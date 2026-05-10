import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { useApp } from '@/contexts/AppContext';
import { getAllSessions, Session } from '@/db/sessions';
import { ThemeColors } from '@/theme/colors';
import { i18n } from '@/i18n';

type RangeKey = '7d' | '1m' | '3m' | '6m' | '1y' | 'all';
type GranKey = 'day' | 'week' | 'month';

const SCREEN_W = Dimensions.get('window').width;

// ── Data helpers ──────────────────────────────────────────────────────────────

function getKey(d: dayjs.Dayjs, gran: GranKey): string {
  if (gran === 'month') return d.format('YYYY-MM');
  if (gran === 'week') return d.startOf('week').format('YYYY-MM-DD');
  return d.format('YYYY-MM-DD');
}

function buildChartData(
  sessions: Session[],
  range: RangeKey,
  gran: GranKey,
  primaryColor: string
): {
  bars: { value: number; label: string; frontColor: string }[];
  totalSessions: number;
  totalMinutes: number;
} {
  const now = dayjs();

  let rangeStart: dayjs.Dayjs;
  switch (range) {
    case '7d': rangeStart = now.subtract(6, 'day'); break;
    case '1m': rangeStart = now.subtract(29, 'day'); break;
    case '3m': rangeStart = now.subtract(3, 'month').add(1, 'day'); break;
    case '6m': rangeStart = now.subtract(6, 'month').add(1, 'day'); break;
    case '1y': rangeStart = now.subtract(1, 'year').add(1, 'day'); break;
    default: {
      if (sessions.length === 0) { rangeStart = now.subtract(6, 'day'); break; }
      const earliest = [...sessions].sort((a, b) => a.date.localeCompare(b.date))[0].date;
      rangeStart = dayjs(earliest);
    }
  }

  const inRange = sessions.filter(s => !dayjs(s.date).isBefore(rangeStart, 'day'));
  const totalSessions = inRange.length;
  const totalMinutes = inRange.reduce((sum, s) => sum + s.duration_seconds / 60, 0);

  const totals = new Map<string, number>();
  for (const s of inRange) {
    const key = getKey(dayjs(s.date), gran);
    totals.set(key, (totals.get(key) ?? 0) + s.duration_seconds / 60);
  }

  const periodUnit: 'day' | 'week' | 'month' = gran;
  let cursor = rangeStart.startOf(periodUnit);
  const endCursor = now.startOf(periodUnit);
  const totalDays = now.diff(rangeStart, 'day') + 1;

  const bars: { value: number; label: string; frontColor: string }[] = [];
  let idx = 0;

  while (!cursor.isAfter(endCursor)) {
    const key = getKey(cursor, gran);
    const value = Math.round(totals.get(key) ?? 0);

    let label = '';
    if (gran === 'day') {
      if (totalDays <= 7) label = cursor.format('D');
      else if (totalDays <= 31 && idx % 5 === 0) label = cursor.format('D');
      else if (totalDays > 31 && idx % 7 === 0) label = cursor.format('M/D');
    } else if (gran === 'week') {
      label = cursor.format('M/D');
    } else {
      label = cursor.format('MMM');
    }

    bars.push({
      value,
      label,
      frontColor: value > 0 ? primaryColor : primaryColor + '28',
    });

    cursor = cursor.add(1, periodUnit);
    idx++;
  }

  return { bars, totalSessions, totalMinutes };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Pill<T extends string>({
  options,
  labels,
  selected,
  onSelect,
  colors,
}: {
  options: T[];
  labels: string[];
  selected: T;
  onSelect: (v: T) => void;
  colors: ThemeColors;
}) {
  return (
    <View style={pillStyles.row}>
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt}
          style={[
            pillStyles.pill,
            { borderColor: colors.border, backgroundColor: colors.surface },
            selected === opt && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.75}
        >
          <ThemedText
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: selected === opt ? '#fff' : colors.textSecondary,
            }}
          >
            {labels[i]}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const pillStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5 },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
});

function SummaryItem({
  value,
  label,
  colors,
}: {
  value: string;
  label: string;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.summaryItem}>
      <ThemedText style={{ fontSize: 20, fontWeight: '700', color: colors.primary }}>
        {value}
      </ThemedText>
      <ThemedText secondary style={{ fontSize: 11, marginTop: 2, textAlign: 'center' }}>
        {label}
      </ThemedText>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

const RANGES: RangeKey[] = ['7d', '1m', '3m', '6m', '1y', 'all'];
const GRANS: GranKey[] = ['day', 'week', 'month'];

export function StatsScreen() {
  const { colors } = useApp();
  const navigation = useNavigation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [range, setRange] = useState<RangeKey>('1m');
  const [gran, setGran] = useState<GranKey>('day');

  useFocusEffect(
    useCallback(() => {
      getAllSessions().then(setSessions).catch(console.warn);
    }, [])
  );

  const { bars, totalSessions, totalMinutes } = useMemo(
    () => buildChartData(sessions, range, gran, colors.primary),
    [sessions, range, gran, colors.primary]
  );

  const avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const maxVal = bars.length > 0 ? Math.max(...bars.map(b => b.value)) : 0;
  const chartMax = Math.max(Math.ceil((maxVal || 10) / 5) * 5, 10);

  const barWidth = gran === 'month' ? 28 : gran === 'week' ? 22 : 16;
  const spacing = gran === 'month' ? 12 : gran === 'week' ? 8 : 4;
  const chartContentWidth = bars.length * (barWidth + spacing) + 40;

  const rangeLabels = ['7D', '1M', '3M', '6M', '1Y', i18n.t('stats.all')];
  const granLabels = [i18n.t('stats.day'), i18n.t('stats.week'), i18n.t('stats.month')];

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.hamburger}
          >
            <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
            <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
            <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
          </TouchableOpacity>
          <ThemedText variant="subtitle">{i18n.t('stats.title')}</ThemedText>
          <View style={{ width: 36 }} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pill options={RANGES} labels={rangeLabels} selected={range} onSelect={r => { setRange(r); }} colors={colors} />
          <Pill options={GRANS} labels={granLabels} selected={gran} onSelect={setGran} colors={colors} />
        </View>

        {sessions.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText secondary style={{ textAlign: 'center', lineHeight: 24 }}>
              {i18n.t('journal.empty')}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.chartArea}>
            {/* Summary */}
            <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SummaryItem
                value={String(totalSessions)}
                label={totalSessions === 1 ? i18n.t('journal.session') : i18n.t('journal.sessions')}
                colors={colors}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SummaryItem
                value={`${Math.round(totalMinutes)}`}
                label={i18n.t('stats.totalMin')}
                colors={colors}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SummaryItem
                value={`${avgMinutes}`}
                label={i18n.t('stats.avgMin')}
                colors={colors}
              />
            </View>

            {/* Chart */}
            {bars.every(b => b.value === 0) ? (
              <View style={styles.empty}>
                <ThemedText secondary>{i18n.t('stats.noData')}</ThemedText>
              </View>
            ) : (
              <View style={styles.chartWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ minWidth: SCREEN_W - 40 }}
                >
                  <BarChart
                    data={bars}
                    barWidth={barWidth}
                    spacing={spacing}
                    noOfSections={4}
                    maxValue={chartMax}
                    frontColor={colors.primary}
                    yAxisThickness={0}
                    xAxisThickness={StyleSheet.hairlineWidth}
                    xAxisColor={colors.border}
                    yAxisTextStyle={{ color: colors.textSecondary, fontSize: 11 }}
                    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 9 }}
                    isAnimated
                    animationDuration={400}
                    initialSpacing={8}
                    endSpacing={16}
                    height={180}
                    width={Math.max(SCREEN_W - 40, chartContentWidth)}
                    roundedTop
                  />
                </ScrollView>
                <ThemedText secondary style={styles.yUnit}>
                  {i18n.t('stats.minutes')}
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
  },
  hamburger: { gap: 5, paddingVertical: 4 },
  hLine: { height: 2, width: 24, borderRadius: 2 },
  controls: {
    gap: 8,
    marginBottom: 16,
  },
  chartArea: {
    flex: 1,
    gap: 16,
  },
  summary: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    marginHorizontal: 4,
  },
  chartWrapper: {
    flex: 1,
  },
  yUnit: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
