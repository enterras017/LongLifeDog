# ながいぬのいる生活 (LongDogLife)

<div align="center">
  <img src="./assets/nagainu.png" alt="ながいぬ" width="200"/>
  
  **ながいぬにご飯をあげて育てる癒し系育成ゲーム**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
  [![iOS](https://img.shields.io/badge/iOS-13.0%2B-lightgrey.svg)](https://www.apple.com/ios/)
  [![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)](https://github.com)
  [![Status](https://img.shields.io/badge/Status-MVP%20Ready-brightgreen.svg)](https://github.com)
  [![License](https://img.shields.io/badge/License-未定-lightgrey.svg)](./LICENSE)
</div>

---

## 📱 アプリ概要

「ながいぬのいる生活」は、ご飯をあげると体がニョキニョキ伸びる不思議な生き物「ながいぬ」を育てる癒し系育成ゲームです。

### 主な機能
- 🍖 **ご飯をあげる**: ながいぬにご飯をあげて体を伸ばそう
- 🐕 **なでなで**: ながいぬをなでなでして癒されよう（効果音付き）
- 🎮 **ご飯ランナー**: スワイプでながいぬを操作するミニゲーム
- 💾 **データ保存**: 進捗とハイスコアを自動保存
- 🎓 **チュートリアル**: 初回起動時に遊び方を説明
- ⚙️ **設定**: 効果音・バイブレーションのON/OFF

---

## 🎥 スクリーンショット

```
[メイン画面]      [ご飯ランナー]    [ゲームプレイ]
  ┌─────┐          ┌─────┐          ┌─────┐
  │ 🐕─🦴│          │START│          │🐕 🍖│
  │     │          │     │          │     │
  └─────┘          └─────┘          └─────┘
```

*(スクリーンショットは開発完了後に追加予定)*

---

## 🚀 現在のステータス

### ✅ MVP v1.0.0 完成！（2025年11月）

#### コア機能
- [x] メイン画面（ご飯あげ・なでなで機能）
- [x] ながいぬの表情変化（通常・笑顔・悲しい）
- [x] サブゲーム「ご飯ランナー」
- [x] スワイプ操作とゲームコントロール
- [x] スピードアップシステム
- [x] 画面切り替え機能

#### データ・設定
- [x] データ永続化（AsyncStorage）
- [x] ハイスコア保存・表示
- [x] 設定画面（効果音・バイブレーション）
- [x] チュートリアル機能

#### 音声・フィードバック
- [x] 効果音（わん！）
- [x] バイブレーション（ゲーム中）
- [x] 設定でON/OFF可能

#### iOS対応
- [x] iOS 13.0+ 対応
- [x] 実機テスト完了
- [x] アプリアイコン設定
- [x] プライバシーポリシー作成

### 🚧 今後の予定
- [ ] Android実機テスト
- [ ] App Store申請
- [ ] 実績システム
- [ ] リーダーボード
- [ ] 新しいミニゲーム

---

## 📚 ドキュメント

このプロジェクトには以下のドキュメントが含まれています：

### 1. **README.md** (このファイル)
プロジェクトの概要と基本情報

### 2. **[APP_SPECIFICATION.md](./APP_SPECIFICATION.md)** ⭐ 必読
アプリケーションの完全な仕様書（50ページ）
- アプリ概要とコンセプト
- 全機能の詳細仕様
- UI/UXデザイン
- ゲームルールとバランス
- ユーザーストーリー
- FAQ

**こんな人におすすめ**:
- アプリの全体像を理解したい
- 機能の詳細を知りたい
- ユーザー体験を理解したい
- プロダクトマネージャー、デザイナー

### 3. **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)** ⭐ 必読
技術的な詳細ドキュメント（100ページ）
- 詳細な技術仕様とコード例
- 開発ルールと設計原則
- 解決済みエラーと再発防止策（6つの主要エラー）
- 今後の技術的課題
- 運用上の検討課題
- パフォーマンス最適化

**こんな人におすすめ**:
- 開発に参加する
- コードを理解したい
- エラーのトラブルシューティング
- エンジニア、技術リード

### 4. **[CODE_REFACTORING_REPORT.md](./CODE_REFACTORING_REPORT.md)** 🆕
コードリファクタリング報告書
- 10項目の改善内容
- バグ修正（3件）
- パフォーマンス改善（2件）
- コード品質向上（5件）

### 5. **[PRIVACY_POLICY.md](./PRIVACY_POLICY.md)** 🆕
プライバシーポリシー（日本語・英語）
- データ収集・保存について
- 個人情報の取り扱い
- ユーザーの権利

### 6. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**
プロジェクト構造と役割定義
- メイン/サブの役割分担
- ファイル構成
- 開発ルール

### 7. **[DEVELOPMENT_SUMMARY.md](./DEVELOPMENT_SUMMARY.md)**
開発サマリー（簡易版）
- 完成した機能の概要
- 現在の課題
- 次のステップ

---

## 🛠️ 技術スタック

- **フレームワーク**: React Native 0.81.4 (Bare workflow)
- **言語**: TypeScript (strict mode)
- **UI**: React Native標準コンポーネント
- **ジェスチャー**: react-native-gesture-handler
- **音声**: expo-av
- **画像**: react-native-svg, PNG/SVG assets
- **データ保存**: @react-native-async-storage/async-storage
- **バイブレーション**: React Native Vibration API

---

## 💻 開発環境のセットアップ

### 前提条件
- Node.js 20.x 以上
- npm または yarn
- Xcode 14.x 以上（iOS開発）
- CocoaPods（iOS依存関係管理）
- iOS 13.0+ デバイスまたはシミュレーター

### インストール手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/enterras017/LongLifeDog.git
cd LongDogLifeNew

# 2. 依存関係をインストール
npm install

# 3. iOS依存関係をインストール
cd ios
pod install
cd ..

# 4. Metro サーバーを起動
npx react-native start --reset-cache

# 5. 別のターミナルでiOSアプリを起動（シミュレーター）
npx react-native run-ios --simulator="iPhone 16 Pro"

# または実機で起動
npx react-native run-ios --device="デバイス名"
```

### トラブルシューティング

#### ビルドエラーが発生した場合
```bash
# ビルドキャッシュをクリア
rm -rf ios/build

# Podsを再インストール
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Metro キャッシュをクリア
npx react-native start --reset-cache
```

#### Metro がポート8081で起動できない場合
```bash
# ポートを使用しているプロセスを確認
lsof -i:8081

# プロセスを終了
lsof -ti:8081 | xargs kill -9
```

詳細なトラブルシューティングは [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) を参照してください。

---

## 📁 プロジェクト構造

```
LongDogLifeNew/
├── App.tsx                          # アプリのエントリーポイント
├── index.js                         # React Native登録
├── package.json                     # 依存関係
│
├── src/
│   ├── components/
│   │   ├── LongDog.tsx             # メイン画面
│   │   ├── LongDogHead.tsx         # 頭部コンポーネント
│   │   ├── LongDogBody.tsx         # 胴体コンポーネント
│   │   ├── LongDogTail.tsx         # 尻尾コンポーネント
│   │   ├── SnakeGame.tsx           # ご飯ランナー
│   │   ├── Tutorial.tsx            # チュートリアル
│   │   ├── Settings.tsx            # 設定画面
│   │   └── experimental/           # 実験的コンポーネント
│   ├── utils/
│   │   └── storage.ts              # データ永続化
│   └── types/
│       └── svg.d.ts                # SVG型定義
│
├── assets/
│   ├── simple/                     # ゲーム用画像
│   ├── sounds/                     # 効果音
│   └── ...
│
├── ios/                            # iOSネイティブコード
├── android/                        # Androidネイティブコード
│
└── docs/                           # ドキュメント
    ├── README.md                   # このファイル
    ├── APP_SPECIFICATION.md        # アプリ仕様書
    ├── TECHNICAL_DOCUMENTATION.md  # 技術ドキュメント
    ├── PROJECT_STRUCTURE.md        # プロジェクト構造
    └── DEVELOPMENT_SUMMARY.md      # 開発サマリー
```

---

## 🎮 使い方

### メイン画面
1. **ご飯をあげる**: 「ごはんをあげる」ボタンをタップ
2. **なでなで**: ながいぬの頭をタップ（効果音が鳴ります）
3. **リセット**: 「リセット」ボタンで初期状態に戻る
4. **設定**: 左上の⚙️ボタンで設定画面を開く
5. **ヘルプ**: 右上の？ボタンでチュートリアルを再表示

### ご飯ランナー
1. 右上の 🏃‍♂️ ボタンをタップ
2. 「スタート」ボタンでゲーム開始
3. スワイプでながいぬを操作
4. ご飯を集めてスピードアップ（効果音＋バイブレーション）
5. 壁に当たったらゲームオーバー
6. ハイスコアは自動保存されます

### 設定画面
1. **効果音**: ON/OFFで切り替え
2. **バイブレーション**: ON/OFFで切り替え
3. **チュートリアルリセット**: 初回チュートリアルを再表示

---

## 🤝 コントリビューション

現在、このプロジェクトは個人開発中のため、外部からのコントリビューションは受け付けていません。

将来的にオープンソース化した際は、以下のガイドラインに従ってください：
- イシューを作成してから作業を開始
- コードスタイルガイドに従う
- テストを書く
- ドキュメントを更新

---

## 📄 ライセンス

現在未定。将来的にライセンスを決定予定です。

---

## 👤 作者

**Enter**

---

## 🙏 謝辞

- React Native コミュニティ
- Expo チーム
- テスターの皆さん（将来）

---

## 📞 サポート

バグ報告や機能リクエストは、以下の方法で受け付けています：
- GitHub Issues（将来実装）
- メール: [未定]

---

## 📊 ロードマップ

### ✅ Phase 1: MVP完成（2025年11月）
- [x] メイン機能実装
- [x] サブゲーム実装
- [x] データ永続化
- [x] チュートリアル・設定画面
- [x] 効果音・バイブレーション
- [x] iOS実機テスト完了

### 🚧 Phase 2: リリース準備（2025年12月）
- [ ] Android実機テスト
- [ ] App Store申請
- [ ] Google Play申請
- [ ] マーケティング素材作成

### 📋 Phase 3: 機能拡張（2026年Q1-Q2）
- [ ] 実績システム
- [ ] リーダーボード
- [ ] 新しいミニゲーム
- [ ] カスタマイズ機能
- [ ] 多言語対応

### 🌟 Phase 4: ソーシャル機能（2026年Q3-Q4）
- [ ] オンラインランキング
- [ ] スコアシェア
- [ ] フレンド機能
- [ ] デイリーチャレンジ

詳細は [APP_SPECIFICATION.md](./APP_SPECIFICATION.md) の「将来の拡張計画」を参照してください。

---

## 🔗 関連リンク

- [React Native 公式ドキュメント](https://reactnative.dev/)
- [Expo ドキュメント](https://docs.expo.dev/)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)

---

<div align="center">
  Made with ❤️ and React Native
  
  **ながいぬと楽しい生活を！**
</div>