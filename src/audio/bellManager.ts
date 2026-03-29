import { Audio } from 'expo-av';

const BELL_SOURCES: Record<string, ReturnType<typeof require>> = {
  bell_1: require('../../assets/audio/bell_1.mp3'),
  bell_2: require('../../assets/audio/bell_2.mp3'),
  bell_3: require('../../assets/audio/bell_3.mp3'),
  bell_4: require('../../assets/audio/bell_4.mp3'),
  bell_5: require('../../assets/audio/bell_5.mp3'),
  bell_6: require('../../assets/audio/bell_6.mp3'),
  bell_7: require('../../assets/audio/bell_7.mp3'),
  bell_8: require('../../assets/audio/bell_8.mp3'),
  bell_9: require('../../assets/audio/bell_9.mp3'),
};

export async function configureBellAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });
  } catch (e) {
    console.warn('Failed to configure audio mode:', e);
  }
}

export async function playBell(bellId: string, volume = 1.0): Promise<void> {
  const source = BELL_SOURCES[bellId];
  if (!source) return;
  let sound: Audio.Sound | null = null;
  try {
    const { sound: s } = await Audio.Sound.createAsync(source, {
      volume,
      shouldPlay: true,
    });
    sound = s;
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.didJustFinish) {
        sound?.unloadAsync().catch(() => {});
      }
    });
  } catch (e) {
    console.warn(`Failed to play bell ${bellId}:`, e);
    if (sound) {
      await sound.unloadAsync().catch(() => {});
    }
  }
}

export async function previewBell(bellId: string): Promise<void> {
  await playBell(bellId, 0.8);
}
