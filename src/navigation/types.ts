export type RootDrawerParamList = {
  HomeStack: undefined;
  JournalStack: undefined;
  Presets: undefined;
  Settings: undefined;
  Donations: undefined;
  About: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Intention: {
    durationSeconds: number;
    warmupSeconds: number;
    intervalSeconds: number;
    startingBellId: string | null;
    intervalBellId: string | null;
    endingBellId: string | null;
    presetId: string | null;
    presetName: string | null;
  };
  Session: {
    durationSeconds: number;
    warmupSeconds: number;
    intervalSeconds: number;
    startingBellId: string | null;
    intervalBellId: string | null;
    endingBellId: string | null;
    presetId: string | null;
    presetName: string | null;
    intention: string;
  };
  PostSession: { sessionId: string };
};

export type JournalStackParamList = {
  JournalList: undefined;
  JournalBrowse: { initialIndex?: number } | undefined;
  JournalDetail: { sessionId: string };
};

export type PresetsStackParamList = {
  PresetsScreen: undefined;
  PresetForm: { presetId?: string };
};
