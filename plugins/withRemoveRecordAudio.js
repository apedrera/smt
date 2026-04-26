const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withRemoveRecordAudio(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    if (manifest['uses-permission']) {
      manifest['uses-permission'] = manifest['uses-permission'].filter(
        (p) => p.$['android:name'] !== 'android.permission.RECORD_AUDIO'
      );
    }
    return mod;
  });
};
