import I18n from 'i18n-js';
import * as Localization from 'expo-localization';
import en from './en.json';
import es from './es.json';

I18n.translations = { en, es };
I18n.fallbacks = true;
I18n.defaultLocale = 'en';

export function initLocale(overrideLocale?: string | null): void {
  if (overrideLocale) {
    I18n.locale = overrideLocale;
  } else {
    const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
    I18n.locale = deviceLocale;
  }
}

export const i18n = I18n;
