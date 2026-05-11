import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { i18n } from '@/i18n';

export function AboutScreen() {
  const { colors, isDark } = useApp();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <GradientBackground>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={styles.hamburger}
            >
              <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
              <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
              <View style={[styles.hLine, { backgroundColor: colors.textPrimary }]} />
            </TouchableOpacity>
            <ThemedText variant="subtitle">{i18n.t('about.title')}</ThemedText>
            <View style={{ width: 36 }} />
          </View>

          <View style={styles.logoArea}>
            <Image source={isDark ? require('../../assets/logo-light.png') : require('../../assets/logo.png')} style={{ width: 160, height: 160 }} resizeMode="contain" />
            <ThemedText secondary style={{ fontSize: 14, marginTop: 4 }}>
              {i18n.t('about.version')} {version}
            </ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText style={{ lineHeight: 24 }}>
              {i18n.t('about.description')}
            </ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.row}>
              <ThemedText secondary style={styles.rowLabel}>{i18n.t('about.author')}</ThemedText>
              <ThemedText>{i18n.t('about.authorName')}</ThemedText>
            </View>
            <View style={[styles.row, styles.rowBorder, { borderColor: colors.border }]}>
              <ThemedText secondary style={styles.rowLabel}>{i18n.t('about.version')}</ThemedText>
              <ThemedText>{version}</ThemedText>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}>
            <ThemedText style={{ textAlign: 'center', lineHeight: 22, color: colors.primary }}>
              {i18n.t('about.openSource')}
            </ThemedText>
          </View>

          {/* Donation CTA */}
          <TouchableOpacity
            style={[styles.donationCard, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Donations' as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.donationIcon}>💚</Text>
            <View style={styles.donationBody}>
              <ThemedText style={styles.donationTitle}>{i18n.t('home.donate')}</ThemedText>
              <ThemedText style={styles.donationSub}>{i18n.t('home.donationBanner')}</ThemedText>
            </View>
            <ThemedText style={styles.donationArrow}>›</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkBtn, { borderColor: colors.border }]}
            onPress={() => setShowPrivacy(true)}
          >
            <ThemedText style={{ color: colors.primary }}>
              {i18n.t('about.privacyPolicy')} →
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal visible={showPrivacy} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText variant="subtitle">{i18n.t('about.privacyPolicy')}</ThemedText>
              <TouchableOpacity onPress={() => setShowPrivacy(false)}>
                <ThemedText style={{ color: colors.primary, fontSize: 16 }}>{i18n.t('common.close')}</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 + insets.bottom }} showsVerticalScrollIndicator={false}>
              <ThemedText variant="subtitle" style={styles.ppSection}>{i18n.t('about.pp.s1title')}</ThemedText>
              <ThemedText style={styles.ppText}>{i18n.t('about.pp.s1body')}</ThemedText>

              <ThemedText variant="subtitle" style={styles.ppSection}>{i18n.t('about.pp.s2title')}</ThemedText>
              <ThemedText style={styles.ppText}>{i18n.t('about.pp.s2body')}</ThemedText>

              <ThemedText variant="subtitle" style={styles.ppSection}>{i18n.t('about.pp.s3title')}</ThemedText>
              <ThemedText style={styles.ppText}>{i18n.t('about.pp.s3body')}</ThemedText>

              <ThemedText variant="subtitle" style={styles.ppSection}>{i18n.t('about.pp.s4title')}</ThemedText>
              <ThemedText style={styles.ppText}>{i18n.t('about.pp.s4body')}</ThemedText>

              <ThemedText variant="subtitle" style={styles.ppSection}>{i18n.t('about.pp.s5title')}</ThemedText>
              <ThemedText style={styles.ppText}>{i18n.t('about.pp.s5body')}</ThemedText>

              <ThemedText secondary style={styles.ppFooter}>{i18n.t('about.pp.updated')}</ThemedText>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  hamburger: {
    gap: 5,
    paddingVertical: 4,
  },
  hLine: {
    height: 2,
    width: 24,
    borderRadius: 2,
  },
  logoArea: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    paddingTop: 12,
  },
  rowLabel: {
    fontSize: 14,
  },
  donationCard: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  donationIcon: {
    fontSize: 24,
  },
  donationBody: {
    flex: 1,
    gap: 2,
  },
  donationTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  donationSub: {
    color: '#ffffffaa',
    fontSize: 11,
    lineHeight: 15,
  },
  donationArrow: {
    color: '#ffffffcc',
    fontSize: 24,
    lineHeight: 26,
  },
  linkBtn: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  ppSection: {
    marginTop: 20,
    marginBottom: 8,
  },
  ppText: {
    lineHeight: 24,
  },
  ppFooter: {
    marginTop: 32,
    marginBottom: 16,
    fontSize: 12,
    textAlign: 'center',
  },
});
