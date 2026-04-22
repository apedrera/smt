import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '@/contexts/AppContext';
import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { HomeStackParamList } from '@/navigation/types';
import { i18n } from '@/i18n';

type IntentionRoute = RouteProp<HomeStackParamList, 'Intention'>;
type IntentionNav = StackNavigationProp<HomeStackParamList, 'Intention'>;

export function IntentionScreen() {
  const { colors } = useApp();
  const navigation = useNavigation<IntentionNav>();
  const route = useRoute<IntentionRoute>();
  const params = route.params;
  const [intention, setIntention] = useState('');

  const proceed = (text: string) => {
    navigation.replace('Session', { ...params, intention: text });
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ThemedText style={{ color: colors.primary }}>
                ← {i18n.t('common.back')}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ThemedText variant="title" style={styles.title}>
              {i18n.t('intention.title')}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              placeholder={i18n.t('intention.placeholder')}
              placeholderTextColor={colors.textSecondary}
              multiline
              value={intention}
              onChangeText={setIntention}
              maxLength={500}
              autoFocus
            />
          </ScrollView>

          <View style={styles.actions}>
            <Button
              label={i18n.t('intention.skip')}
              variant="ghost"
              onPress={() => proceed('')}
              style={{ flex: 1 }}
            />
            <Button
              label={i18n.t('intention.begin')}
              onPress={() => proceed(intention.trim())}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 16,
    gap: 20,
  },
  title: {
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    paddingBottom: 24,
  },
});
