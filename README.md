# ながいぬのいる生活 (LongDogLife)

<div align="center">
  <img src="./assets/nagainu.png" alt="ながいぬ" width="200"/>
  
  **ながいぬにご飯をあげて育てる癒し系育成ゲーム**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
  [![iOS](https://img.shields.io/badge/iOS-13.0%2B-lightgrey.svg)](https://www.apple.com/ios/)
  [![Status](https://img.shields.io/badge/Status-Alpha-orange.svg)](https://github.com)
  [![License](https://img.shields.io/badge/License-未定-lightgrey.svg)](./LICENSE)
</div>

---

## 📱 アプリ概要

「ながいぬのいる生活」は、ご飯をあげると体がニョキニョキ伸びる不思議な生き物「ながいぬ」を育てる癒し系育成ゲームです。

### 主な機能
- 🍖 **ご飯をあげる**: ながいぬにご飯をあげて体を伸ばそう
- 🐕 **なでなで**: ながいぬをなでなでして癒されよう
- 🎮 **ご飯ランナー**: スワイプでながいぬを操作するミニゲーム
- 📊 **統計**: 今日のご飯回数や成長記録を確認

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

### ✅ 実装済み
- [x] メイン画面（ご飯あげ・なでなで機能）
- [x] ながいぬの表情変化
- [x] サブゲーム「ご飯ランナー」
- [x] スワイプ操作
- [x] スピードアップシステム
- [x] 画面切り替え機能

### 🚧 開発中
- [ ] データ永続化
- [ ] 効果音の有効化
- [ ] ハイスコア表示
- [ ] Android対応

### 📋 計画中
- [ ] 実績システム
- [ ] リーダーボード
- [ ] 新しいミニゲーム
- [ ] カスタマイズ機能

---

## 📚 ドキュメント

このプロジェクトには以下のドキュメントが含まれています：

### 1. **README.md** (このファイル)
プロジェクトの概要と基本情報

### 2. **[APP_SPECIFICATION.md](./APP_SPECIFICATION.md)** ⭐ 必読
アプリケーションの完全な仕様書
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
技術的な詳細ドキュメント
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

### 4. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**
プロジェクト構造と役割定義
- メイン/サブの役割分担
- ファイル構成
- 開発ルール

**こんな人におすすめ**:
- プロジェクトの構造を理解したい
- どこに何があるか知りたい

### 5. **[DEVELOPMENT_SUMMARY.md](./DEVELOPMENT_SUMMARY.md)**
開発サマリー（簡易版）
- 完成した機能の概要
- 現在の課題
- 次のステップ

**こんな人におすすめ**:
- 手っ取り早く現状を把握したい
- 進捗確認

---

## 🛠️ 技術スタック

- **フレームワーク**: React Native 0.81.4 (Bare workflow)
- **言語**: TypeScript
- **UI**: React Native標準コンポーネント
- **ジェスチャー**: react-native-gesture-handler
- **音声**: expo-av
- **画像**: react-native-svg, PNG/SVG assets

---

## 💻 開発環境のセットアップ

### 前提条件
- Node.js 16.x 以上
- npm または yarn
- Xcode 14.x 以上（iOS開発）
- CocoaPods（iOS依存関係管理）

### インストール手順

```bash
# 1. リポジトリをクローン
git clone [リポジトリURL]
cd LongDogLifeNew

# 2. 依存関係をインストール
npm install

# 3. iOS依存関係をインストール
cd ios
pod install
cd ..

# 4. Metro サーバーを起動
npx react-native start --reset-cache

# 5. 別のターミナルでiOSアプリを起動
npx react-native run-ios --simulator="iPhone 16 Pro"
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
│   │   └── SnakeGame.tsx           # ご飯ランナー
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
2. **なでなで**: ながいぬの頭をタップ
3. **リセット**: 「リセット」ボタンで初期状態に戻る

### ご飯ランナー
1. 右上の 🏃‍♂️ ボタンをタップ
2. 「スタート」ボタンでゲーム開始
3. スワイプでながいぬを操作
4. ご飯を集めてスピードアップ
5. 壁に当たったらゲームオーバー

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

### Phase 1: 基本機能完成（現在）
- [x] メイン機能実装
- [x] サブゲーム実装
- [ ] データ永続化
- [ ] Android対応

### Phase 2: 機能拡張（3-6ヶ月）
- [ ] 実績システム
- [ ] ハイスコアシステム
- [ ] 新しいミニゲーム
- [ ] カスタマイズ機能

### Phase 3: ソーシャル機能（6-12ヶ月）
- [ ] リーダーボード
- [ ] スコアシェア
- [ ] フレンド機能

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