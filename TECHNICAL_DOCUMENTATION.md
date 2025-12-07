# LongDogLifeNew 技術詳細ドキュメント

## 📱 プロジェクト完全仕様

### アプリケーション概要
**名称**: ながいぬのいる生活 (LongDogLife)  
**コンセプト**: ながいぬにご飯をあげて育てる育成ゲーム + ミニゲーム  
**ターゲット**: カジュアルゲームユーザー  
**プラットフォーム**: iOS（現在）、Android（予定）  

---

## 🎮 アプリケーション詳細仕様

### 1. メイン機能：ながいぬ育成システム

#### 1.1 基本仕様
```typescript
interface LongDogState {
  bodyCount: number;          // 体のセグメント数（初期値: 1）
  feedCount: number;          // ご飯をあげた累計回数
  remainingFeeds: number;     // 残りご飯回数（初期値: 100）
  lastFeedDate: string | null; // 最後にご飯をあげた日付
  segmentIncrement: number;   // 1回のご飯で増えるセグメント数（1/5/10）
  dogExpression: 'normal' | 'smile' | 'sad'; // 表情
}
```

#### 1.2 ご飯をあげる機能
**トリガー**: 「ごはんをあげる」ボタンタップ

**処理フロー**:
```typescript
1. remainingFeeds > 0 をチェック
2. 表情を 'smile' に変更
3. bodyCount += segmentIncrement
4. feedCount += 1
5. remainingFeeds -= 1
6. フェードアニメーション実行（0.8 → 1.0、各150ms）
7. lastFeedDate を現在日時に更新
8. 1.5秒後に表情を 'normal' に戻す
```

**ビジュアルフィードバック**:
- アニメーション: `Animated.sequence` 使用
- opacity: 1.0 → 0.8 → 1.0
- duration: 各150ms (合計300ms)

**制約**:
- remainingFeeds が 0 の場合、ボタンは disabled
- ボタン色が #ffd700 → #ccc に変化

#### 1.3 なでなで機能
**トリガー**: ながいぬの頭部をタップ

**処理フロー**:
```typescript
1. dogExpression === 'smile' の場合、早期リターン（多重反応防止）
2. 表情を 'smile' に変更
3. 効果音再生（happy_woof.mp3）
4. フェードアニメーション実行
5. 1.5秒後に表情を 'normal' に戻す
```

**音声設定**:
```typescript
Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,      // サイレントモードでも再生
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});
```

**エラーハンドリング**:
```typescript
try {
  const { sound } = await Audio.Sound.createAsync(
    require('../../assets/sounds/happy_woof.mp3')
  );
  await sound.playAsync();
  // 自動的にリソース解放
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync();
    }
  });
} catch (error) {
  console.warn('音声再生エラー:', error);
  // エラーでもアプリは継続動作
}
```

#### 1.4 体の伸び方の計算
**表示用の長さ**:
```typescript
const getDogLength = () => {
  return Math.round(50 + (bodyCount - 1) * 1); // cm単位
};
// 基本50cm + セグメントごとに1cm
```

**実装詳細**:
- `bodyCount` に基づいて `LongDogBody` コンポーネントが動的にセグメントを生成
- 各セグメントは SVG 画像 (`longdog_body_simple.svg`)
- 横スクロール (`ScrollView`) で長いながいぬを表示

#### 1.5 リセット機能
**処理**:
```typescript
const handleReset = () => {
  setBodyCount(1);
  setFeedCount(0);
  setRemainingFeeds(100);
  setLastFeedDate(null);
  setDogExpression('normal');
};
```
**注意**: データ永続化が未実装のため、アプリ再起動でも自動的にリセットされる

#### 1.6 検証用機能
**セグメント増加量調整**:
- 1, 5, 10 の3段階
- 開発・デバッグ用
- 本番では削除または非表示にする予定

---

### 2. サブ機能：ご飯ランナーゲーム

#### 2.1 ゲーム基本仕様
```typescript
const GRID_SIZE = 10;           // 横方向のセル数
const CELL_SIZE = 30;           // 各セルのサイズ（px）
const GAME_WIDTH = 300;         // 10 * 30
const GAME_HEIGHT = 450;        // 15 * 30

interface Position {
  x: number;  // 0-9
  y: number;  // 0-14
}

type Direction = 'up' | 'down' | 'left' | 'right';
type GameState = 'ready' | 'playing' | 'gameOver' | 'paused';
```

#### 2.2 ゲーム状態管理
**状態遷移図**:
```
ready → playing → gameOver → ready
  ↑        ↓
  └────────┘
   (paused - 未実装)
```

**各状態の詳細**:

1. **ready**:
   - 初期状態、またはリスタート後
   - スタートボタン表示
   - ゲームループ停止
   - ながいぬと食べ物は配置済み（静止）

2. **playing**:
   - ゲーム進行中
   - ゲームループ実行中
   - スワイプ操作有効
   - スピードレベルに応じて速度変化

3. **gameOver**:
   - 壁または自分に衝突時
   - ゲームループ停止
   - 表情が 'sad' に変化
   - 最終スピード表示
   - 「もういっかい！」ボタン表示

4. **paused**:
   - 現在未使用
   - 将来的に一時停止機能実装時に使用

#### 2.3 ゲームループ実装
```typescript
useEffect(() => {
  if (gameState === 'playing') {
    // スピードレベルに応じた速度計算
    const baseSpeed = 200;           // 基本速度（ms）
    const speedIncrement = 15;       // レベルごとの加速（ms）
    const gameSpeed = Math.max(50, baseSpeed - (speedLevel - 1) * speedIncrement);
    
    gameLoopRef.current = setInterval(moveSnake, gameSpeed);
  } else {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }

  return () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  };
}, [moveSnake, gameState, speedLevel]);
```

**速度計算の例**:
- レベル1: 200ms （最初）
- レベル2: 185ms
- レベル5: 140ms
- レベル10: 65ms
- レベル11+: 50ms（上限）

#### 2.4 移動とゲームロジック
```typescript
const moveSnake = () => {
  setSnake(prevSnake => {
    const newSnake = [...prevSnake];
    const head = { ...newSnake[0] };
    const currentDirection = directionRef.current;

    // 方向に応じて頭の位置を更新
    switch (currentDirection) {
      case 'up':    head.y -= 1; break;
      case 'down':  head.y += 1; break;
      case 'left':  head.x -= 1; break;
      case 'right': head.x += 1; break;
    }

    // 壁との衝突判定
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= 15) {
      setGameState('gameOver');
      setDogExpression('sad');
      return prevSnake; // 元の位置を保持
    }

    // 自分の体との衝突判定（頭のみなので常にfalse、将来の拡張用）
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameState('gameOver');
      setDogExpression('sad');
      return prevSnake;
    }

    // 新しい頭を追加
    newSnake.unshift(head);

    // ご飯を食べたかチェック
    if (head.x === food.x && head.y === food.y) {
      setSpeedLevel(prev => prev + 1); // スピードアップ
      setDogExpression('smile');
      playWoofSound();
      
      // アニメーション実行
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();

      setTimeout(() => setDogExpression('normal'), 1500);

      // 新しいご飯を配置
      setFood(generateFood());
      // 体は伸びない（popしない）
    }
    
    // 常に尾を削除（頭のみを維持）
    newSnake.pop();

    return newSnake;
  });
};
```

**重要な実装ポイント**:
1. `directionRef.current` を使用してリアルタイムの方向を取得
2. 衝突時は `prevSnake` を返して位置を保持
3. ご飯を食べても `pop()` を実行して頭のみを維持
4. 状態更新は非同期なので `setGameState` 後も処理を続ける

#### 2.5 スワイプ操作実装
**ライブラリ**: `react-native-gesture-handler`

```typescript
import { PanGestureHandler } from 'react-native-gesture-handler';

const onGestureEvent = (event: any) => {
  const { translationX, translationY, state } = event.nativeEvent;
  
  // state === 5 は END state（スワイプ完了）
  if (state === 5) {
    const threshold = 20; // 検出閾値（px）
    
    if (Math.abs(translationX) > threshold || Math.abs(translationY) > threshold) {
      if (Math.abs(translationX) > Math.abs(translationY)) {
        // 水平方向のスワイプ
        if (translationX > 0) {
          directionRef.current = 'right';
          setDirection('right');
        } else {
          directionRef.current = 'left';
          setDirection('left');
        }
      } else {
        // 垂直方向のスワイプ
        if (translationY > 0) {
          directionRef.current = 'down';
          setDirection('down');
        } else {
          directionRef.current = 'up';
          setDirection('up');
        }
      }
    }
  }
};
```

**重要な実装の決定**:
- `directionRef.current` と `setDirection` の両方を更新
- `gameState` チェックを削除して常に方向を更新
- `state === 5` (END) でのみ方向変更を検出

#### 2.6 ご飯の配置アルゴリズム
```typescript
const generateFood = (): Position => {
  let newFood: Position;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * 15),
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
};
```

**ロジック**:
1. ランダムな位置を生成
2. ながいぬの体と重なっていないかチェック
3. 重なっている場合は再生成
4. 重なっていない位置が見つかるまで繰り返し

**注意**: 
- 現在は頭のみなので衝突はほぼ発生しない
- 将来的に体が伸びる場合は重要になる

#### 2.7 レンダリング
```typescript
const renderCell = (x: number, y: number) => {
  const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
  const isFood = food.x === x && food.y === y;

  let cellContent = null;

  if (isSnakeHead) {
    const headImage = dogExpression === 'smile' 
      ? require('../../assets/simple/longdog_head.png')
      : dogExpression === 'sad'
      ? require('../../assets/simple/longdog_head_sad.png')
      : require('../../assets/simple/longdog_head.png');
    
    cellContent = (
      <Animated.Image
        source={headImage}
        style={[styles.cellImage, { opacity: fadeAnim }]}
        resizeMode="contain"
      />
    );
  } else if (isFood) {
    cellContent = (
      <View style={styles.food}>
        <Text style={styles.foodText}>🍖</Text>
      </View>
    );
  }

  return (
    <View key={`${x}-${y}`} style={styles.cell}>
      {cellContent}
    </View>
  );
};
```

**グリッド生成**:
```typescript
{Array.from({ length: 15 }).map((_, y) =>
  Array.from({ length: GRID_SIZE }).map((_, x) => renderCell(x, y))
)}
```
- 外側: y軸（行）15個
- 内側: x軸（列）10個
- 合計: 150セル

---

## 🔧 開発ルールと設計原則

### 1. コンポーネント設計原則

#### 1.1 責任の分離
```typescript
// ❌ Bad: 1つのコンポーネントに全てを詰め込む
<App>
  <View>
    {/* 全てのロジックとUIをここに書く */}
  </View>
</App>

// ✅ Good: 責任ごとにコンポーネントを分割
<App>
  <LongDog />           // メイン機能
  <FoodRunner />        // サブゲーム
</App>
```

#### 1.2 状態管理のルール
**ローカル状態 (`useState`)を使用する場合**:
- コンポーネント内でのみ使用される状態
- 親コンポーネントに影響しない状態
- 例: `dogExpression`, `gameState`, `speedLevel`

**Refを使用する場合**:
- 再レンダリングをトリガーしたくない値
- リアルタイムで更新が必要な値
- 例: `directionRef`, `gameLoopRef`, `fadeAnim`

```typescript
// ❌ Bad: 頻繁に更新される値をstateで管理
const [currentDirection, setCurrentDirection] = useState('right');
// → moveSnake が呼ばれるたびに再レンダリング

// ✅ Good: Refで管理
const directionRef = useRef<Direction>('right');
// → 再レンダリングなし、パフォーマンス向上
```

#### 1.3 props の設計
**オプショナルなprops**:
```typescript
interface FoodRunnerProps {
  onBackToMain?: () => void;  // ? でオプショナル
}

// 使用側
{onBackToMain && (
  <TouchableOpacity onPress={onBackToMain}>
    <Text>← メインに戻る</Text>
  </TouchableOpacity>
)}
```

**必須のprops**:
```typescript
interface LongDogHeadProps {
  expression: 'normal' | 'smile' | 'sad';
  fadeAnim: Animated.Value;
  onPet: () => void;
}
```

### 2. アニメーション設計

#### 2.1 Animated API の使用
```typescript
// 初期化
const fadeAnim = useRef(new Animated.Value(1)).current;

// シーケンスアニメーション
Animated.sequence([
  Animated.timing(fadeAnim, { 
    toValue: 0.8, 
    duration: 150, 
    useNativeDriver: true  // パフォーマンス向上
  }),
  Animated.timing(fadeAnim, { 
    toValue: 1, 
    duration: 150, 
    useNativeDriver: true 
  }),
]).start();
```

**useNativeDriver の使用**:
- ✅ opacity, transform などで使用可能
- ❌ width, height, backgroundColor では使用不可
- パフォーマンスが大幅に向上

### 3. エラーハンドリング

#### 3.1 音声再生エラー
```typescript
try {
  const { sound } = await Audio.Sound.createAsync(source);
  await sound.playAsync();
} catch (error) {
  console.warn('音声再生エラー:', error);
  // アプリは継続動作（致命的なエラーではない）
}
```

#### 3.2 リソース管理
```typescript
// ✅ Good: リソースの自動解放
sound.setOnPlaybackStatusUpdate((status) => {
  if (status.isLoaded && status.didJustFinish) {
    sound.unloadAsync(); // メモリリーク防止
  }
});
```

### 4. TypeScript使用ルール

#### 4.1 型定義の厳密化
```typescript
// ❌ Bad: any型の使用
const onGestureEvent = (event: any) => { ... }

// ⚠️ Current: 一時的にanyを使用（型定義が複雑なため）
const onGestureEvent = (event: any) => { ... }

// ✅ Future: 適切な型を使用
import { PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
const onGestureEvent = (event: PanGestureHandlerStateChangeEvent) => { ... }
```

#### 4.2 状態の型定義
```typescript
// ✅ Good: 明確な型定義
type GameState = 'ready' | 'playing' | 'gameOver' | 'paused';
const [gameState, setGameState] = useState<GameState>('ready');

// ❌ Bad: 型推論に任せる
const [gameState, setGameState] = useState('ready');
// → string型になり、typoを検出できない
```

### 5. パフォーマンス最適化

#### 5.1 useCallback の使用
```typescript
// moveSnake は毎フレーム呼ばれるため、メモ化
const moveSnake = useCallback(() => {
  // ロジック
}, [food, speedLevel, /* 依存配列 */]);
```

**重要**: 依存配列に含めるべきもの
- 関数内で参照するstate
- 関数内で参照するprops
- 関数内で呼び出す他の関数

#### 5.2 useMemo の使用
```typescript
// LongDog.tsx
const bodySegments = React.useMemo(() => {
  return Array.from({ length: bodyCount }, (_, i) => i);
}, [bodyCount]);
```

**理由**: 
- 毎回新しい配列を生成するとパフォーマンス低下
- `bodyCount` が変わった時のみ再計算

### 6. デバッグとログ

#### 6.1 console.log の使用
```typescript
// ✅ 開発中: 詳細なログ
console.log('Game state changed:', gameState);
console.log('Direction updated:', directionRef.current);

// ⚠️ 本番: 削除または環境変数で制御
if (__DEV__) {
  console.log('Debug info:', data);
}
```

#### 6.2 alert の使用禁止（ゲームループ内）
```typescript
// ❌ Bad: JavaScriptスレッドをブロック
const moveSnake = () => {
  alert('Moving snake'); // ゲームが一時停止する
};

// ✅ Good: console.logを使用
const moveSnake = () => {
  console.log('Moving snake');
};
```

---

## 🐛 解決済みエラーと再発防止策

### エラー1: ネイティブモジュールリンクエラー

#### 発生したエラー
```
Unable to resolve module expo-asset
Cannot read property 'EventEmitter' of undefined
RNGestureHandlerModule not found
```

#### 原因分析
1. Bare React Native プロジェクトに Expo モジュールを使用
2. `ios/Podfile` に Expo の autolinking が設定されていない
3. ネイティブ依存関係がリンクされていない

#### 解決手順
```ruby
# ios/Podfile に追加
require_relative '../node_modules/expo/scripts/autolinking'

target 'LongDogLifeNew' do
  use_expo_modules! # この行を追加
  
  config = use_native_modules!
  # ... 既存の設定
end
```

```bash
# ターミナルで実行
cd ios
pod install
cd ..
```

#### 再発防止策
**チェックリスト**:
- [ ] 新しいネイティブモジュールをインストール後は必ず `pod install`
- [ ] `ios/Podfile` が最新の状態か確認
- [ ] エラーメッセージに "module not found" が含まれる場合はリンク問題を疑う

**ドキュメント化**:
```markdown
## 新しいライブラリの追加手順
1. npm install <library>
2. cd ios && pod install && cd ..
3. Metro サーバーを再起動
4. アプリを再ビルド
```

---

### エラー2: スワイプ操作が反映されない

#### 発生したエラー
- スワイプを検出しているがながいぬが動かない
- `directionRef.current` と `gameState` の値が食い違う
- console.log が期待通りに出力されない

#### 原因分析（複数の問題が重なっていた）

**問題1: stale closureの問題**
```typescript
// ❌ Bad: moveSnake が古い direction を参照
const [direction, setDirection] = useState('right');

const moveSnake = () => {
  // この時点の direction は古い値
  switch (direction) { ... }
};

useEffect(() => {
  const interval = setInterval(moveSnake, 200);
  return () => clearInterval(interval);
}, []); // 空の依存配列 → 初回のmoveSnakeを参照し続ける
```

**問題2: gameStateチェックのタイミング**
```typescript
// ❌ Bad: スワイプ検出時に gameState をチェック
const onGestureEvent = (event: any) => {
  if (gameState !== 'playing') return; // playing になる前にスワイプが無視される
  
  directionRef.current = 'right';
};
```

**問題3: useCallback の依存配列不足**
```typescript
// ❌ Bad: direction が依存配列に含まれていない
const moveSnake = useCallback(() => {
  switch (direction) { ... }
}, []); // direction の変更を検知できない
```

#### 解決手順

**ステップ1: directionRef の導入**
```typescript
const directionRef = useRef<Direction>('right');

// スワイプ検出時
directionRef.current = 'right';
setDirection('right'); // UIの更新用

// moveSnake 内
const currentDirection = directionRef.current; // 常に最新値
```

**ステップ2: gameState チェックの削除**
```typescript
// ✅ Good: 常に方向を更新
const onGestureEvent = (event: any) => {
  // gameState のチェックを削除
  directionRef.current = 'right';
  setDirection('right');
};
```

**ステップ3: 依存配列の修正**
```typescript
const moveSnake = useCallback(() => {
  const currentDirection = directionRef.current;
  // ロジック
}, [food, speedLevel]); // 必要な依存を追加

useEffect(() => {
  if (gameState === 'playing') {
    const interval = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(interval);
  }
}, [moveSnake, gameState, speedLevel]); // moveSnake を依存配列に追加
```

#### 再発防止策

**1. Ref vs State の使い分けルール**
```typescript
// 再レンダリングが必要 → useState
const [gameState, setGameState] = useState('ready');

// 再レンダリング不要、リアルタイム更新が必要 → useRef
const directionRef = useRef('right');
```

**2. useEffect の依存配列チェックリスト**
- [ ] 使用している全てのstateを含める
- [ ] 使用している全てのpropsを含める
- [ ] 呼び出している全ての関数を含める
- [ ] ESLintの警告を無視しない

**3. デバッグ時の確認項目**
```typescript
// 状態のログ出力
console.log('State:', {
  gameState,
  direction,
  directionRef: directionRef.current,
  snake: snake[0],
  speedLevel,
});
```

---

### エラー3: ゲームが即座にゲームオーバーになる

#### 発生したエラー
- スタートボタンを押すと即座にゲームオーバー
- alert が全て表示されている

#### 原因分析
```typescript
// ❌ Bad: alert がJavaScriptスレッドをブロック
const startGame = () => {
  alert('Start game called');
  setGameState('playing');
};

useEffect(() => {
  if (gameState === 'playing') {
    alert('Game loop starting');
    const interval = setInterval(() => {
      alert('moveSnake called'); // ここで停止
      moveSnake();
    }, 200);
  }
}, [gameState]);
```

**問題の詳細**:
1. `alert` がJavaScriptスレッドを完全にブロック
2. ユーザーがalertを閉じる間にゲームループが複数回実行
3. 一度に複数の移動が発生して壁に衝突

#### 解決手順
```typescript
// ✅ Good: alert を全て削除
const startGame = () => {
  console.log('Start game called');
  setGameState('playing');
};

useEffect(() => {
  if (gameState === 'playing') {
    console.log('Game loop starting');
    const interval = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(interval);
  }
}, [gameState, moveSnake, speedLevel]);
```

#### 再発防止策

**絶対に使用してはいけない**:
- `alert()` - ゲームループやアニメーション内
- `confirm()` - 同上
- `prompt()` - 同上

**代替手段**:
```typescript
// デバッグ用
console.log('Debug info:', data);

// ユーザーへの通知
<Text style={styles.debugText}>{debugInfo}</Text>

// 状態の可視化
<View style={styles.debugOverlay}>
  <Text>Game State: {gameState}</Text>
  <Text>Direction: {directionRef.current}</Text>
</View>
```

---

### エラー4: React Native バージョンミスマッチ

#### 発生したエラー
```
React Native version mismatch
JavaScript version: 0.82.0
Native version: 0.81.4
```

#### 原因分析
- 2つのプロジェクト（`LongDogLife` と `LongDogLifeNew`）が存在
- Metro サーバーが古いプロジェクトのバージョンでバンドル
- ポート 8081 で別のMetroが起動中

#### 解決手順
```bash
# ステップ1: 全てのMetroプロセスを停止
lsof -ti:8081 | xargs kill -9

# ステップ2: 正しいディレクトリに移動
cd /Users/enter/LongDogLifeNew

# ステップ3: package.json でバージョン確認
cat package.json | grep react-native
# "react-native": "0.81.4"

# ステップ4: Metro を再起動
npx react-native start --reset-cache

# ステップ5: 新しいターミナルでビルド
npx react-native run-ios --simulator="iPhone 16 Pro"
```

#### 再発防止策

**1. プロジェクト識別の明確化**
```bash
# 現在のディレクトリを常に確認
pwd
# /Users/enter/LongDogLifeNew であることを確認

# package.json の name フィールドを確認
cat package.json | grep '"name"'
```

**2. Metro サーバーの管理**
```bash
# Metro 起動前にポートチェック
lsof -i:8081

# 既に起動している場合は停止
lsof -ti:8081 | xargs kill -9

# または別のポートを使用
npx react-native start --port 8082
```

**3. プロジェクト構造の文書化**
- `PROJECT_STRUCTURE.md` にプロジェクト名を明記
- README に正しいディレクトリパスを記載

---

### エラー5: iOS ビルドエラー (xcodebuild error 65)

#### 発生したエラー
```
error: no member named 'CallInvoker' in namespace 'facebook::react'
xcodebuild exited with error code 65
```

#### 原因分析
1. ビルドキャッシュの問題
2. Podsの依存関係の不整合
3. 古いビルド成果物が残っている
4. 複数のプロジェクトフォルダの混在

#### 解決手順
```bash
# ステップ1: ビルドキャッシュのクリア
rm -rf ios/build

# ステップ2: Derived Data のクリア（完全クリーンアップ）
rm -rf ~/Library/Developer/Xcode/DerivedData

# ステップ3: Pods の再インストール
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# ステップ4: Metro キャッシュのクリア
rm -rf node_modules/.cache

# ステップ5: Metro 再起動
npx react-native start --reset-cache

# ステップ6: 新しいターミナルでビルド
npx react-native run-ios
```

#### 再発防止策

**定期的なクリーンアップ**:
```bash
# ビルド前のクリーンアップスクリプト
#!/bin/bash
echo "Cleaning build artifacts..."
rm -rf ios/build
rm -rf node_modules/.cache
echo "Clean complete!"
```

**package.json にスクリプト追加**:
```json
{
  "scripts": {
    "clean": "rm -rf ios/build && rm -rf node_modules/.cache",
    "clean:full": "rm -rf ios/build && rm -rf ~/Library/Developer/Xcode/DerivedData && cd ios && pod install && cd ..",
    "ios": "npx react-native run-ios"
  }
}
```

**ビルドエラー時のチェックリスト**:
- [ ] `ios/build` フォルダを削除
- [ ] Metro サーバーを再起動
- [ ] Pods を再インストール
- [ ] Xcode を開いて Product > Clean Build Folder
- [ ] 正しいプロジェクトディレクトリにいるか確認

---

### エラー6: 白い画面（White Screen）

#### 発生したエラー
- アプリは起動するが白い画面のまま
- エラーメッセージなし
- Metro は正常に動作

#### 原因分析（複数のパターン）

**パターン1: コンポーネントのimportエラー**
```typescript
// ❌ Bad
import { FoodRunner } from './src/components/SnakeGame';
// ファイルが存在しない、またはexportされていない
```

**パターン2: レンダリングエラー**
```typescript
// ❌ Bad: 条件によってnullを返す
return null; // 画面が真っ白

// ✅ Good: 常に何かをレンダリング
return <View style={styles.container}><Text>Loading...</Text></View>;
```

**パターン3: JavaScriptエラー**
```typescript
// エラーが発生してレンダリングが停止
const invalidOperation = undefined.toString(); // TypeError
```

#### 解決手順

**ステップ1: Metro のログを確認**
```bash
# Metro ターミナルでエラーを確認
# "Error:", "TypeError:", "Cannot read property" などを探す
```

**ステップ2: React Native Debugger を使用**
```bash
# シミュレーターで Command + D
# "Debug" を選択
# Chrome DevTools でコンソールエラーを確認
```

**ステップ3: 最小構成でテスト**
```typescript
// App.tsx を最小限に変更
function App(): React.JSX.Element {
  return (
    <View style={{flex: 1, backgroundColor: 'red'}}>
      <Text>Test</Text>
    </View>
  );
}
```

**ステップ4: 段階的に機能を追加**
```typescript
// 正常に表示されたら、少しずつコンポーネントを追加
function App(): React.JSX.Element {
  return (
    <View style={{flex: 1}}>
      <LongDog /> {/* まずこれだけ */}
    </View>
  );
}
```

#### 再発防止策

**1. エラー境界の実装**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>エラーが発生しました</Text>
          <Text>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <ErrorBoundary>
      <LongDog />
    </ErrorBoundary>
  );
}
```

**2. 開発時のデバッグコンポーネント**
```typescript
const DebugInfo: React.FC = () => {
  if (!__DEV__) return null;
  
  return (
    <View style={styles.debugInfo}>
      <Text>App is running</Text>
      <Text>Environment: {__DEV__ ? 'Development' : 'Production'}</Text>
    </View>
  );
};
```

---

## 🔮 今後の技術的課題

### 1. パフォーマンス最適化

#### 1.1 レンダリング最適化
**現状の問題**:
- グリッド全体（150セル）を毎フレーム再レンダリング
- スクロール時のパフォーマンス低下の可能性

**改善案**:
```typescript
// React.memo でセルをメモ化
const Cell = React.memo<CellProps>(({ x, y, isSnake, isFood }) => {
  // レンダリングロジック
}, (prevProps, nextProps) => {
  // カスタム比較関数
  return prevProps.isSnake === nextProps.isSnake 
      && prevProps.isFood === nextProps.isFood;
});

// グリッドの最適化
const Grid = React.memo(() => {
  return (
    <View style={styles.grid}>
      {cells.map((cell) => (
        <Cell key={cell.id} {...cell} />
      ))}
    </View>
  );
});
```

**測定方法**:
```typescript
import { PerformanceObserver, performance } from 'react-native-performance';

const measureRenderTime = () => {
  performance.mark('render-start');
  // レンダリング
  performance.mark('render-end');
  performance.measure('render', 'render-start', 'render-end');
};
```

#### 1.2 メモリ管理
**現状の問題**:
- 音声リソースの適切な解放が不確実
- 長時間プレイ時のメモリリーク懸念

**改善案**:
```typescript
// 音声プールの実装
class SoundPool {
  private sounds: Map<string, Audio.Sound> = new Map();

  async preload(key: string, source: any) {
    const { sound } = await Audio.Sound.createAsync(source);
    this.sounds.set(key, sound);
  }

  async play(key: string) {
    const sound = this.sounds.get(key);
    if (sound) {
      await sound.replayAsync();
    }
  }

  async unloadAll() {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
  }
}

// 使用
const soundPool = new SoundPool();

useEffect(() => {
  soundPool.preload('woof', require('../../assets/sounds/happy_woof.mp3'));
  
  return () => {
    soundPool.unloadAll(); // アンマウント時に全解放
  };
}, []);
```

#### 1.3 アニメーションの最適化
**現状**: `Animated.timing` を毎回作成

**改善案**:
```typescript
// アニメーションの再利用
const fadeAnimation = useRef(
  Animated.sequence([
    Animated.timing(fadeAnim, { 
      toValue: 0.8, 
      duration: 150, 
      useNativeDriver: true 
    }),
    Animated.timing(fadeAnim, { 
      toValue: 1, 
      duration: 150, 
      useNativeDriver: true 
    }),
  ])
).current;

// 使用時
fadeAnimation.reset();
fadeAnimation.start();
```

---

### 2. TypeScript型定義の厳密化

#### 2.1 ジェスチャーイベントの型
**現状**:
```typescript
const onGestureEvent = (event: any) => { ... }
```

**改善案**:
```typescript
import { 
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent 
} from 'react-native-gesture-handler';

const onGestureEvent = (event: PanGestureHandlerStateChangeEvent) => {
  const { translationX, translationY, state } = event.nativeEvent;
  // 型安全
};
```

#### 2.2 音声APIの型
```typescript
interface SoundStatus {
  isLoaded: boolean;
  isPlaying?: boolean;
  didJustFinish?: boolean;
  durationMillis?: number;
  positionMillis?: number;
}

const handlePlaybackStatus = (status: SoundStatus) => {
  if (status.isLoaded && status.didJustFinish) {
    // 型安全な処理
  }
};
```

#### 2.3 グローバル型定義
```typescript
// src/types/global.d.ts
declare global {
  namespace ReactNative {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

declare const __DEV__: boolean;

export {};
```

---

### 3. 状態管理の改善

#### 3.1 Context API の導入（将来的に）
**現状**: propsでデータを渡している

**改善が必要になる場合**:
- 複数の画面で共有するデータが増える
- データ永続化が必要になる
- ユーザー設定を保存する

```typescript
// GameContext.tsx
interface GameContextType {
  highScore: number;
  setHighScore: (score: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC = ({ children }) => {
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <GameContext.Provider value={{ highScore, setHighScore, soundEnabled, setSoundEnabled }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
```

#### 3.2 AsyncStorage の実装
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// データ保存
const saveGameData = async (data: GameData) => {
  try {
    await AsyncStorage.setItem('@game_data', JSON.stringify(data));
  } catch (error) {
    console.error('Save error:', error);
  }
};

// データ読み込み
const loadGameData = async (): Promise<GameData | null> => {
  try {
    const value = await AsyncStorage.getItem('@game_data');
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Load error:', error);
    return null;
  }
};

// 使用例
useEffect(() => {
  loadGameData().then(data => {
    if (data) {
      setBodyCount(data.bodyCount);
      setFeedCount(data.feedCount);
      // ...
    }
  });
}, []);

useEffect(() => {
  saveGameData({ bodyCount, feedCount, remainingFeeds });
}, [bodyCount, feedCount, remainingFeeds]);
```

---

### 4. テストの実装

#### 4.1 ユニットテストの追加
**現状**: テストなし

**優先度の高いテスト**:
```typescript
// __tests__/gameLogic.test.ts
import { generateFood, checkCollision } from '../src/utils/gameLogic';

describe('ゲームロジック', () => {
  describe('generateFood', () => {
    it('ながいぬの体と重ならない位置を生成する', () => {
      const snake = [{ x: 5, y: 7 }];
      const food = generateFood(snake);
      
      expect(food).toBeDefined();
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(10);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(15);
      
      // ながいぬと重なっていないことを確認
      const collision = snake.some(s => s.x === food.x && s.y === food.y);
      expect(collision).toBe(false);
    });
  });

  describe('checkCollision', () => {
    it('壁との衝突を検出する', () => {
      expect(checkCollision({ x: -1, y: 5 })).toBe(true);
      expect(checkCollision({ x: 10, y: 5 })).toBe(true);
      expect(checkCollision({ x: 5, y: -1 })).toBe(true);
      expect(checkCollision({ x: 5, y: 15 })).toBe(true);
    });

    it('グリッド内では衝突しない', () => {
      expect(checkCollision({ x: 5, y: 7 })).toBe(false);
      expect(checkCollision({ x: 0, y: 0 })).toBe(false);
      expect(checkCollision({ x: 9, y: 14 })).toBe(false);
    });
  });
});
```

#### 4.2 コンポーネントテスト
```typescript
// __tests__/LongDog.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LongDog from '../src/components/LongDog';

describe('LongDog コンポーネント', () => {
  it('初期状態で正しくレンダリングされる', () => {
    const { getByText } = render(<LongDog />);
    
    expect(getByText('ながいぬのいる生活')).toBeDefined();
    expect(getByText('ごはんをあげる')).toBeDefined();
    expect(getByText('残り 100/100回')).toBeDefined();
  });

  it('ご飯をあげるとカウントが減る', () => {
    const { getByText } = render(<LongDog />);
    
    const feedButton = getByText('ごはんをあげる');
    fireEvent.press(feedButton);
    
    expect(getByText('残り 99/100回')).toBeDefined();
  });

  it('残りが0になるとボタンが無効化される', () => {
    const { getByText, getByTestId } = render(<LongDog />);
    
    const feedButton = getByTestId('feed-button');
    
    // 100回タップ
    for (let i = 0; i < 100; i++) {
      fireEvent.press(feedButton);
    }
    
    expect(feedButton).toBeDisabled();
  });
});
```

#### 4.3 E2Eテストの検討
**ツール**: Detox

```typescript
// e2e/game.e2e.ts
describe('ご飯ランナー', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('ゲームを開始できる', async () => {
    // ご飯ランナーボタンをタップ
    await element(by.id('food-runner-button')).tap();
    
    // スタートボタンが表示されることを確認
    await expect(element(by.text('スタート'))).toBeVisible();
    
    // スタートボタンをタップ
    await element(by.text('スタート')).tap();
    
    // ゲームが開始される
    await expect(element(by.text('スピード: 1'))).toBeVisible();
  });

  it('スワイプで移動できる', async () => {
    await element(by.id('game-area')).swipe('up');
    // ながいぬが上に移動することを確認（実装が必要）
  });
});
```

---

### 5. エラー監視とクラッシュレポート

#### 5.1 Sentryの導入
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_DSN_HERE',
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
  tracesSampleRate: 1.0,
});

// エラーの手動送信
try {
  // リスクのある操作
} catch (error) {
  Sentry.captureException(error);
}

// パフォーマンス測定
const transaction = Sentry.startTransaction({
  name: 'game-render',
});

// ゲームロジック実行

transaction.finish();
```

#### 5.2 カスタムエラーログ
```typescript
// src/utils/logger.ts
class Logger {
  static error(message: string, error?: Error, context?: any) {
    console.error(message, error, context);
    
    if (!__DEV__) {
      // 本番環境では外部サービスに送信
      Sentry.captureException(error, {
        contexts: { custom: context },
      });
    }
  }

  static warn(message: string, context?: any) {
    console.warn(message, context);
  }

  static info(message: string, context?: any) {
    if (__DEV__) {
      console.log(message, context);
    }
  }
}

// 使用
Logger.error('Game logic error', error, { gameState, speedLevel });
```

---

### 6. アクセシビリティ

#### 6.1 VoiceOver / TalkBack 対応
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="ごはんをあげる"
  accessibilityHint="タップするとながいぬにご飯をあげます"
  accessibilityRole="button"
  onPress={handleFeed}
>
  <Text>ごはんをあげる</Text>
</TouchableOpacity>
```

#### 6.2 色覚対応
**現状**: 色のみで情報を伝えている箇所がある

**改善案**:
- アイコンやテキストでも情報を伝達
- コントラスト比を WCAG AAレベル以上に
- 色覚シミュレーターでテスト

---

### 7. ネットワーク機能（将来的に）

#### 7.1 リーダーボード
```typescript
// Firebase Realtime Database を使用
import database from '@react-native-firebase/database';

const submitScore = async (score: number, playerName: string) => {
  try {
    await database()
      .ref('/leaderboard')
      .push({
        score,
        playerName,
        timestamp: database.ServerValue.TIMESTAMP,
      });
  } catch (error) {
    Logger.error('Score submission failed', error);
  }
};

const fetchLeaderboard = async () => {
  try {
    const snapshot = await database()
      .ref('/leaderboard')
      .orderByChild('score')
      .limitToLast(10)
      .once('value');
    
    return snapshot.val();
  } catch (error) {
    Logger.error('Leaderboard fetch failed', error);
    return null;
  }
};
```

#### 7.2 ソーシャル機能
- スコアのシェア（Twitter, LINE）
- フレンド機能
- 対戦モード

---

## 🏢 運用上の検討課題

### 1. データ管理戦略

#### 1.1 ローカルストレージの設計
**保存すべきデータ**:
```typescript
interface UserData {
  // メイン画面
  bodyCount: number;
  feedCount: number;
  remainingFeeds: number;
  lastFeedDate: string;
  totalPlayTime: number;
  
  // ご飯ランナー
  highScore: number;
  totalGamesPlayed: number;
  bestSpeedLevel: number;
  
  // 設定
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  
  // 統計
  createdAt: string;
  lastPlayedAt: string;
}
```

**保存タイミング**:
- アプリがバックグラウンドに移行する時
- 重要なイベント発生時（ハイスコア更新等）
- 定期的（1分ごと等）

```typescript
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'background') {
      saveGameData(userData);
    }
  });

  return () => {
    subscription.remove();
  };
}, [userData]);
```

#### 1.2 データのマイグレーション
```typescript
const CURRENT_VERSION = 2;

interface StoredData {
  version: number;
  data: UserData;
}

const migrateData = (stored: StoredData): UserData => {
  if (stored.version === 1) {
    // バージョン1から2へのマイグレーション
    return {
      ...stored.data,
      vibrationEnabled: true, // 新しいフィールド
    };
  }
  
  return stored.data;
};

const loadData = async (): Promise<UserData> => {
  const raw = await AsyncStorage.getItem('@user_data');
  if (!raw) return getDefaultData();
  
  const stored: StoredData = JSON.parse(raw);
  
  if (stored.version < CURRENT_VERSION) {
    const migrated = migrateData(stored);
    await saveData(migrated);
    return migrated;
  }
  
  return stored.data;
};
```

---

### 2. アプリのバージョン管理

#### 2.1 セマンティックバージョニング
```
メジャー.マイナー.パッチ
例: 1.2.3

メジャー: 互換性のない大きな変更
マイナー: 後方互換性のある機能追加
パッチ: バグ修正
```

**現在の状態**: 1.0.0-alpha

**今後の計画**:
- 1.0.0-beta: 主要機能完成、テスト中
- 1.0.0: 正式リリース
- 1.1.0: 新機能追加（例: データ永続化）
- 1.2.0: 新機能追加（例: リーダーボード）
- 2.0.0: 大きな変更（例: オンライン対戦）

#### 2.2 リリースノートの管理
```markdown
# CHANGELOG.md

## [Unreleased]
### Added
- データ永続化機能
- ハイスコア表示

### Changed
- ゲーム速度の調整

### Fixed
- スワイプ操作のバグ修正

## [1.0.0] - 2025-11-03
### Added
- メイン画面（ご飯あげ機能）
- サブゲーム（ご飯ランナー）
- 画面切り替え機能
```

---

### 3. アプリストアへの申請準備

#### 3.1 App Store (iOS)
**必要な準備**:
- [ ] Apple Developer アカウント（年間99ドル）
- [ ] アプリアイコン（1024x1024px）
- [ ] スクリーンショット（各サイズ）
- [ ] プライバシーポリシー
- [ ] App Store説明文
- [ ] カテゴリ選択
- [ ] 年齢レーティング

**スクリーンショットサイズ**:
- 6.7インチ: 1290 x 2796 px
- 6.5インチ: 1284 x 2778 px
- 5.5インチ: 1242 x 2208 px

**プライバシーポリシー例**:
```markdown
# プライバシーポリシー

## データの収集
このアプリは以下のデータをローカルに保存します：
- ゲームの進行状況
- ハイスコア
- 設定情報

## データの使用
収集したデータは、ゲームの進行を保存する目的のみに使用されます。
外部のサーバーには送信されません。

## データの共有
あなたのデータを第三者と共有することはありません。
```

#### 3.2 Google Play (Android)
**必要な準備**:
- [ ] Google Play Developer アカウント（25ドル買い切り）
- [ ] アプリアイコン（512x512px）
- [ ] フィーチャーグラフィック（1024x500px）
- [ ] スクリーンショット
- [ ] プライバシーポリシー
- [ ] 説明文
- [ ] カテゴリ選択

---

### 4. マーケティングとプロモーション

#### 4.1 ソフトローンチ戦略
1. **クローズドベータ** (2-4週間)
   - TestFlight / Firebase App Distribution
   - 10-20人のテスター
   - フィードバック収集

2. **オープンベータ** (2-4週間)
   - 特定地域でリリース（例: 日本のみ）
   - より多くのユーザーでテスト
   - バグ修正とバランス調整

3. **正式リリース**
   - 全地域で公開
   - プレスリリース
   - SNSでの告知

#### 4.2 ユーザー獲得戦略
**オーガニック**:
- App Store最適化（ASO）
- SNS（Twitter, Instagram）
- YouTube実況・紹介動画
- ブログ記事

**ペイド**:
- App Store広告
- Google Ads
- SNS広告

#### 4.3 KPIの設定
```typescript
interface Analytics {
  // ダウンロード
  totalDownloads: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  
  // エンゲージメント
  avgSessionLength: number;
  avgSessionsPerUser: number;
  retentionDay1: number;
  retentionDay7: number;
  retentionDay30: number;
  
  // ゲーム
  avgGameLength: number;
  avgSpeedLevel: number;
  totalGamesPlayed: number;
}
```

---

### 5. メンテナンスとサポート

#### 5.1 バグトラッキング
**システム**:
- GitHub Issues
- または Jira

**優先度の定義**:
- P0: クリティカル（アプリがクラッシュ）
- P1: 高（主要機能が動作しない）
- P2: 中（不便だが回避可能）
- P3: 低（軽微な問題）

#### 5.2 ユーザーサポート
**チャンネル**:
- アプリ内フィードバック機能
- メールサポート
- FAQページ

**よくある質問（予想）**:
```markdown
Q: データが消えてしまいました
A: 現在、データはデバイスのみに保存されます。
   アプリを削除するとデータも消去されます。
   バックアップ機能は今後のアップデートで追加予定です。

Q: 音が出ません
A: デバイスのサイレントモードを確認してください。
   それでも音が出ない場合は...

Q: ゲームが遅いです
A: デバイスの空きメモリを確認してください。
   他のアプリを終了すると改善する場合があります。
```

#### 5.3 アップデート計画
**定期アップデート**:
- 月1回のバグ修正リリース
- 四半期ごとの機能追加

**緊急アップデート**:
- クリティカルなバグは24時間以内に修正版を申請
- セキュリティ問題は最優先で対応

---

### 6. 収益化戦略（将来的に）

#### 6.1 収益モデルの検討
**オプション1: 完全無料**
- メリット: ユーザー獲得が容易
- デメリット: 収益なし

**オプション2: 広告モデル**
```typescript
import { AdMobBanner, AdMobInterstitial } from '@react-native-admob/admob';

// バナー広告
<AdMobBanner
  adSize="banner"
  adUnitID="ca-app-pub-xxxxx"
  onAdFailedToLoad={(error) => console.log(error)}
/>

// インタースティシャル（ゲームオーバー時）
AdMobInterstitial.setAdUnitID('ca-app-pub-xxxxx');
AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd());
```

**オプション3: アプリ内課金**
- ご飯の回数追加（100円）
- 広告削除（490円）
- 特別なスキン（250円）

**オプション4: プレミアム版**
- 無料版: 広告あり、機能制限
- 有料版（490円）: 広告なし、全機能

#### 6.2 収益予測
```
想定ユーザー数: 1,000 DAU
広告収益: 1ユーザーあたり0.5円/日
月間収益: 1,000 × 0.5 × 30 = 15,000円

または

アプリ内課金: 5%のユーザーが平均200円購入
月間収益: 1,000 × 30 × 0.05 × 200 = 30,000円
```

---

### 7. 法的・コンプライアンス

#### 7.1 必要な規約
**利用規約**:
```markdown
# 利用規約

## 1. 本アプリについて
本アプリは娯楽目的で提供されます。

## 2. 禁止事項
- 不正な手段でのスコア操作
- リバースエンジニアリング

## 3. 免責事項
データ損失等の損害について、開発者は責任を負いません。

## 4. アップデート
本規約は予告なく変更される場合があります。
```

**プライバシーポリシー**: 上記参照

#### 7.2 著作権とライセンス
**使用素材の確認**:
- [ ] アイコン画像の権利確認
- [ ] 効果音の権利確認
- [ ] フォントのライセンス確認
- [ ] ライブラリのライセンス確認

**オープンソースライセンス表示**:
```typescript
// 設定画面に「ライセンス」ページを追加
import { getOpenSourceLicenses } from 'react-native-licenses';

const LicensesScreen = () => {
  const [licenses, setLicenses] = useState([]);
  
  useEffect(() => {
    getOpenSourceLicenses().then(setLicenses);
  }, []);
  
  return (
    <ScrollView>
      {licenses.map(license => (
        <View key={license.name}>
          <Text>{license.name}</Text>
          <Text>{license.version}</Text>
          <Text>{license.license}</Text>
        </View>
      ))}
    </ScrollView>
  );
};
```

---

### 8. グローバル展開（将来的に）

#### 8.1 多言語対応
```typescript
// i18n の導入
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    ja: {
      translation: {
        'feed_button': 'ごはんをあげる',
        'game_title': 'ご飯ランナー',
      },
    },
    en: {
      translation: {
        'feed_button': 'Feed',
        'game_title': 'Food Runner',
      },
    },
  },
  lng: 'ja',
  fallbackLng: 'en',
});

// 使用
<Text>{t('feed_button')}</Text>
```

#### 8.2 地域別の最適化
- タイムゾーン対応
- 通貨設定（課金がある場合）
- 文化的配慮（絵文字、色の意味等）

---

### 9. 長期的なビジョン

#### 9.1 機能ロードマップ
**Phase 1 (3ヶ月)**: 基本機能の完成
- [x] メイン画面
- [x] サブゲーム
- [ ] データ永続化
- [ ] 音声有効化

**Phase 2 (6ヶ月)**: 拡張機能
- [ ] ハイスコアシステム
- [ ] 実績システム
- [ ] 新しいミニゲーム追加
- [ ] Android対応

**Phase 3 (1年)**: ソーシャル機能
- [ ] リーダーボード
- [ ] フレンド機能
- [ ] スコアシェア

**Phase 4 (長期)**: プラットフォーム展開
- [ ] Web版
- [ ] タブレット最適化
- [ ] Apple Watch対応

#### 9.2 コミュニティ構築
- Discord サーバー
- 公式Twitter
- ファンアート投稿キャンペーン
- ユーザー参加型のアップデート投票

---

## 📚 参考資料とリソース

### 開発リソース
- [React Native 公式ドキュメント](https://reactnative.dev/)
- [Expo ドキュメント](https://docs.expo.dev/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)

### デザインリソース
- [React Native UI Libraries](https://reactnative.directory/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)

### 運用リソース
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [ASO Guide](https://www.apptamin.com/blog/app-store-optimization/)

---

**最終更新**: 2025年11月3日  
**ドキュメントバージョン**: 1.0.0
