const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withRemoveRecordAudio(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;

    // Filter out any existing RECORD_AUDIO entry
    if (manifest['uses-permission']) {
      manifest['uses-permission'] = manifest['uses-permission'].filter(
        (p) => p.$?.['android:name'] !== 'android.permission.RECORD_AUDIO'
      );
    }

    // Add tools namespace to support removal markers
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // Add explicit removal marker so any library that merges the permission later gets overridden
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }
    manifest['uses-permission'].push({
      $: {
        'android:name': 'android.permission.RECORD_AUDIO',
        'tools:node': 'remove',
      },
    });

    return mod;
  });
};
