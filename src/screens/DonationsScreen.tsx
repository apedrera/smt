import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Clipboard,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useApp } from '@/contexts/AppContext';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import {
  BTC_ADDRESS,
  ETH_ADDRESS,
  USDT_ADDRESS,
  USDC_ADDRESS,
  SOL_ADDRESS,
  KOFI_URL,
  PAYPAL_URL,
} from '@/config/donations';
import { i18n } from '@/i18n';

interface CryptoRowProps {
  label: string;
  address: string;
  copied: boolean;
  onCopy: () => void;
  colors: ReturnType<typeof useApp>['colors'];
}

function CryptoRow({ label, address, copied, onCopy, colors }: CryptoRowProps) {
  return (
    <View style={[styles.cryptoRow, { borderColor: colors.border }]}>
      <View style={styles.cryptoInfo}>
        <ThemedText style={{ fontWeight: '600', fontSize: 14 }}>{label}</ThemedText>
        {address ? (
          <ThemedText secondary style={styles.address} selectable>
            {address}
          </ThemedText>
        ) : (
          <ThemedText secondary style={{ fontSize: 13, fontStyle: 'italic' }}>
            {i18n.t('donations.notConfigured')}
          </ThemedText>
        )}
      </View>
      {address ? (
        <TouchableOpacity
          style={[styles.copyBtn, { borderColor: colors.border }]}
          onPress={onCopy}
        >
          <ThemedText style={{ color: colors.primary, fontSize: 13 }}>
            {copied ? i18n.t('donations.copied') : i18n.t('donations.copyAddress')}
          </ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function DonationsScreen() {
  const { colors } = useApp();
  const navigation = useNavigation();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, value: string) => {
    Clipboard.setString(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openUrl = (url: string) => {
    if (url) Linking.openURL(url).catch(console.warn);
  };

  const cryptoItems = [
    { key: 'btc', label: i18n.t('donations.btc'), address: BTC_ADDRESS },
    { key: 'eth', label: i18n.t('donations.eth'), address: ETH_ADDRESS },
    { key: 'usdt', label: i18n.t('donations.usdt'), address: USDT_ADDRESS },
    { key: 'usdc', label: i18n.t('donations.usdc'), address: USDC_ADDRESS },
    { key: 'sol', label: i18n.t('donations.sol'), address: SOL_ADDRESS },
  ];

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
            <ThemedText variant="subtitle">{i18n.t('donations.title')}</ThemedText>
            <View style={{ width: 36 }} />
          </View>

          <ThemedText secondary style={styles.subtitle}>
            {i18n.t('donations.subtitle')}
          </ThemedText>

          {/* Ko-fi / PayPal */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText secondary style={styles.sectionTitle}>
              {i18n.t('donations.kofiPaypal')}
            </ThemedText>
            {KOFI_URL ? (
              <Button label="Ko-fi" variant="secondary" onPress={() => openUrl(KOFI_URL)} />
            ) : null}
            {PAYPAL_URL ? (
              <Button label="PayPal" variant="secondary" onPress={() => openUrl(PAYPAL_URL)} />
            ) : null}
            {!KOFI_URL && !PAYPAL_URL && (
              <ThemedText secondary style={{ fontStyle: 'italic' }}>
                {i18n.t('donations.notConfigured')}
              </ThemedText>
            )}
          </View>

          {/* Crypto */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText secondary style={styles.sectionTitle}>
              {i18n.t('donations.crypto')}
            </ThemedText>
            {cryptoItems.map(item => (
              <CryptoRow
                key={item.key}
                label={item.label}
                address={item.address}
                copied={copiedKey === item.key}
                onCopy={() => handleCopy(item.key, item.address)}
                colors={colors}
              />
            ))}
          </View>
        </View>
      </ScrollView>
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
  subtitle: {
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cryptoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    gap: 12,
  },
  cryptoInfo: {
    flex: 1,
    gap: 4,
  },
  address: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  copyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
