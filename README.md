# SAMA Timer

**Simple Meditation Timer**

A clean, ad-free meditation timer for Android. No accounts, no tracking, no internet required.

---

## Features

- **Free session** — meditate without a time limit
- **Timed session** — set a duration with a simple picker
- **Presets** — create and save custom configurations with duration, warm-up time, and bell intervals
- **Bells** — choose from 9 sounds (Tingsha, Zen Bell, Gong, Crystal Bowl, Tibetan Bowl, and more) for start, interval, and end
- **Journal** — every session is saved locally with date, duration, intention, and notes
- **Intention setting** — set an intention before each session
- **Export** — export your journal as TXT, JSON, or XLSX
- **Dark mode** — follows system theme or set manually
- **Bilingual** — English and Spanish

## Privacy

SAMA Timer collects no data whatsoever. Everything stays on your device. No analytics, no ads, no network requests.

## Tech stack

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 54)
- [expo-av](https://docs.expo.dev/versions/latest/sdk/av/) for audio
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for local storage
- [react-native-svg](https://github.com/software-mansion/react-native-svg) for the logo
- [expo-localization](https://docs.expo.dev/versions/latest/sdk/localization/) + [i18n-js](https://github.com/fnando/i18n-js) for translations

## Build

This project uses [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
npm install
eas build --platform android --profile preview
```

## Support

If SAMA Timer helps your practice, consider supporting its development:

👉 [ko-fi.com/karlbanor](https://ko-fi.com/karlbanor)

