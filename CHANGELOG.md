# 変更履歴

## [0c8caa1] - 2025-12-07

### 変更内容の詳細

#### 1. アプリ構造の根本的な変更

**`App.tsx`の変更:**
- **変更前**: React Nativeのデフォルトテンプレート（`NewAppScreen`）を表示
- **変更後**: カスタムメイン画面（`LongDog`）とゲーム画面（`FoodRunner`）の切り替え機能を実装
- 追加された機能:
  - `AppMode`型定義（`'main' | 'foodRunner'`）
  - `useState`による画面状態管理
  - `switchToFoodRunner()`: メイン画面からゲーム画面への遷移
  - `switchToMain()`: ゲーム画面からメイン画面への遷移
  - `GestureHandlerRootView`でジェスチャーハンドラーをラップ

#### 2. 新規コンポーネントの追加

**メイン画面コンポーネント:**
- **`src/components/LongDog.tsx`** (203行)
  - メイン画面のUIコンポーネント
  - 犬の体が伸びるアニメーション機能
  - 「ごはんをあげる」ボタン
  - 「あそぶ」ボタン（`onSwitchToFoodRunner`プロップでゲーム画面に遷移）

**ゲームコンポーネント:**
- **`src/components/SnakeGame.tsx`** (428行)
  - FoodRunnerゲームの実装
  - スネークゲームのロジック（移動、食べ物取得、衝突判定）
  - スワイプジェスチャーによる操作
  - スピードレベルの管理
  - 犬の表情の変更（normal, smile, sad）
  - 戻るボタン（`onBack`プロップでメイン画面に戻る）
  - 音声再生機能（`expo-av`を使用）

**LongDog関連コンポーネント:**
- `src/components/LongDogHead.tsx` (74行): 犬の頭部コンポーネント
- `src/components/LongDogBody.tsx` (33行): 犬の胴体コンポーネント
- `src/components/LongDogTail.tsx` (30行): 犬の尻尾コンポーネント
- `src/components/AnimatedLongdog.tsx` (92行): アニメーション付きLongDog
- `src/components/LongDogGrowing.tsx` (119行): 成長するLongDog
- `src/components/MaskedLongDog.tsx` (187行): マスク付きLongDog
- `src/components/StretchableLongDog.tsx` (142行): 伸縮可能なLongDog

**アイコン・ユーティリティ:**
- `src/icons/Longdog.tsx` (16行): LongDog SVGアイコン
- `src/icons/LongdogBody.js` (24行): 胴体アイコン
- `src/icons/LongdogHead.js` (21行): 頭部アイコン
- `src/icons/LongdogTail.js` (25行): 尻尾アイコン
- `src/types/svg.d.ts` (6行): SVG型定義
- `src/utils/pixelSnap.ts` (12行): ピクセルスナップユーティリティ

#### 3. 依存関係の追加

**`package.json`の変更:**
```json
追加された依存関係:
- "expo": "^54.0.13"
- "expo-asset": "^12.0.9"
- "expo-av": "^16.0.7"
- "expo-modules-core": "^3.0.21"
- "react-native-gesture-handler": "^2.28.0"
- "react-native-svg": "^15.8.0"
```

**変更理由:**
- `react-native-gesture-handler`: スワイプジェスチャー操作のため
- `expo-av`: ゲーム内の音声再生のため
- `expo-asset`: アセット管理のため
- `react-native-svg`: SVGアイコンの表示のため

#### 4. アプリ名・表示名の統一

**変更されたファイル:**
- `package.json`: `"name": "LongDogLife"` → `"LongDogLifeNew"`
- `app.json`: 
  - `"name": "LongDogLife"` → `"LongDogLifeNew"`
  - `"displayName": "ながいぬのいる生活"` を追加
- `ios/LongDogLife/Info.plist`: `CFBundleDisplayName` → `"ながいぬのいる生活"`
- `android/app/src/main/res/values/strings.xml`: `app_name` → `"ながいぬのいる生活"`
- `ios/LongDogLife/AppDelegate.swift`: `withModuleName: "LongDogLife"` → `"LongDogLifeNew"`

**目的**: アプリ名と表示名を統一し、iOS/Androidで一貫した表示を実現

#### 5. アセット・アイコンの追加

- `ios/LongDogLife/Images.xcassets/AppIcon.appiconset/nagainu_icon_1024.png`: アプリアイコン画像（1.3MB）
- `ios/LongDogLife/Images.xcassets/AppIcon.appiconset/Contents.json`: アイコン設定の更新

#### 6. CocoaPods依存関係

- `ios/Podfile.lock`: CocoaPods依存関係のロックファイル（2,876行）
  - 新しく追加された依存関係のネイティブモジュール設定

### 統計情報

- **変更ファイル数**: 26ファイル
- **追加行数**: 10,424行
- **削除行数**: 3,143行
- **新規ファイル**: 18ファイル
- **変更ファイル**: 8ファイル

### 機能追加の概要

1. ✅ メイン画面（LongDog）の実装
2. ✅ ゲーム画面（FoodRunner）の実装
3. ✅ 画面間の遷移機能
4. ✅ ジェスチャー操作（スワイプ）
5. ✅ 音声再生機能
6. ✅ アニメーション機能
7. ✅ アプリ名・表示名の統一

### 過去の実装履歴（記録のみ）

#### ながいぬ転がし（BallRollingGame）
- **実装時期**: 過去に実装されていたが、現在のコードベースには含まれていません
- **機能**: 3Dボール転がしゲーム
  - expo-gl, expo-three, three.jsを使用した3Dレンダリング
  - ジャイロスコープによる操作
  - マイクラ風の犬キャラクター
  - カントリー調のBGM
- **削除理由**: プロジェクトのリバートにより削除された可能性があります
- **備考**: 将来の実装予定として検討中

### 技術スタック

- React Native 0.81.4
- React 19.1.0
- TypeScript
- Expo SDK 54
- react-native-gesture-handler
- react-native-svg
- expo-av

