import AsyncStorage from '@react-native-async-storage/async-storage';

// ストレージキー
const STORAGE_KEYS = {
  MAIN_DATA: '@LongDogLife:mainData',
  FOOD_RUNNER_DATA: '@LongDogLife:foodRunnerData',
  SETTINGS: '@LongDogLife:settings',
  FIRST_LAUNCH: '@LongDogLife:firstLaunch',
} as const;

// メインデータの型定義
export interface MainData {
  bodyCount: number;
  feedCount: number; // 今日のご飯回数
  remainingFeeds: number;
  lastFeedDate: string | null;
  totalPetCount: number; // 今日の撫でた回数
  totalPlayTime: number;
  createdAt: string;
  lastPlayedAt: string;
  // 累計統計（派生用パラメータ）
  totalFeedCount: number; // 累計ご飯回数
  totalPetCountAllTime: number; // 累計撫でた回数
  consecutiveFeedDays: number; // 連続ご飯日数
  maxConsecutiveFeedDays: number; // 最大連続ご飯日数
  sadFaceCount: number; // 悲しい顔になった回数（放置回数）
  foodRunnerFoodCollected: number; // ご飯ランナーで集めたご飯の累計
  lastFoodRunnerRewardCheck: number; // 最後にご飯ランナー報酬をチェックした回数
}

// ご飯ランナーデータの型定義
export interface FoodRunnerData {
  highScore: number;
  totalGamesPlayed: number;
  totalFoodCollected: number;
  lastPlayedAt: string | null;
}

// 設定データの型定義
export interface SettingsData {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  tutorialCompleted: boolean;
}

// デフォルト値
const DEFAULT_MAIN_DATA: MainData = {
  bodyCount: 1,
  feedCount: 0,
  remainingFeeds: 3,
  lastFeedDate: null,
  totalPetCount: 0,
  totalPlayTime: 0,
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString(),
  // 累計統計
  totalFeedCount: 0,
  totalPetCountAllTime: 0,
  consecutiveFeedDays: 0,
  maxConsecutiveFeedDays: 0,
  sadFaceCount: 0,
  foodRunnerFoodCollected: 0,
  lastFoodRunnerRewardCheck: 0,
};

const DEFAULT_FOOD_RUNNER_DATA: FoodRunnerData = {
  highScore: 0,
  totalGamesPlayed: 0,
  totalFoodCollected: 0,
  lastPlayedAt: null,
};

const DEFAULT_SETTINGS: SettingsData = {
  soundEnabled: true,
  vibrationEnabled: true,
  tutorialCompleted: false,
};

// メインデータの保存
export const saveMainData = async (data: MainData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.MAIN_DATA, jsonValue);
  } catch (error) {
    console.error('メインデータの保存エラー:', error);
  }
};

// メインデータの読み込み
export const loadMainData = async (): Promise<MainData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.MAIN_DATA);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    return DEFAULT_MAIN_DATA;
  } catch (error) {
    console.error('メインデータの読み込みエラー:', error);
    return DEFAULT_MAIN_DATA;
  }
};

// ご飯ランナーデータの保存
export const saveFoodRunnerData = async (data: FoodRunnerData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.FOOD_RUNNER_DATA, jsonValue);
  } catch (error) {
    console.error('ご飯ランナーデータの保存エラー:', error);
  }
};

// ご飯ランナーデータの読み込み
export const loadFoodRunnerData = async (): Promise<FoodRunnerData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_RUNNER_DATA);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    return DEFAULT_FOOD_RUNNER_DATA;
  } catch (error) {
    console.error('ご飯ランナーデータの読み込みエラー:', error);
    return DEFAULT_FOOD_RUNNER_DATA;
  }
};

// 設定データの保存
export const saveSettings = async (data: SettingsData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
  } catch (error) {
    console.error('設定データの保存エラー:', error);
  }
};

// 設定データの読み込み
export const loadSettings = async (): Promise<SettingsData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('設定データの読み込みエラー:', error);
    return DEFAULT_SETTINGS;
  }
};

// 初回起動フラグの確認
export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    return value === null;
  } catch (error) {
    console.error('初回起動フラグの確認エラー:', error);
    return true;
  }
};

// 初回起動フラグの設定
export const setFirstLaunchCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
  } catch (error) {
    console.error('初回起動フラグの設定エラー:', error);
  }
};

// 全データのクリア（デバッグ用）
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.MAIN_DATA,
      STORAGE_KEYS.FOOD_RUNNER_DATA,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.FIRST_LAUNCH,
    ]);
    console.log('全データをクリアしました');
  } catch (error) {
    console.error('全データのクリアエラー:', error);
  }
};

// ストレージサイズの取得（デバッグ用）
export const getStorageInfo = async (): Promise<{
  keys: string[];
  size: number;
}> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const longDogKeys = keys.filter(key => key.startsWith('@LongDogLife:'));
    
    let totalSize = 0;
    for (const key of longDogKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }
    
    return {
      keys: longDogKeys,
      size: totalSize,
    };
  } catch (error) {
    console.error('ストレージ情報の取得エラー:', error);
    return { keys: [], size: 0 };
  }
};


