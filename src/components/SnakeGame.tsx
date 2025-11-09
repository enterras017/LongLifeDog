import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { loadFoodRunnerData, saveFoodRunnerData, type FoodRunnerData, loadSettings } from '../utils/storage';
import { Audio } from 'expo-av';
import { Tutorial } from './Tutorial';

const GRID_SIZE = 10;
const CELL_SIZE = 30;
const GAME_WIDTH = GRID_SIZE * CELL_SIZE;
const GAME_HEIGHT = 15 * CELL_SIZE;

interface Position {
  x: number;
  y: number;
}

interface SnakeSegment {
  x: number;
  y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';
type GameState = 'ready' | 'playing' | 'gameOver' | 'paused';

interface FoodRunnerProps {
  onBackToMain?: () => void;
}

export const FoodRunner: React.FC<FoodRunnerProps> = ({ onBackToMain }) => {
  // ゲーム状態
  const [gameState, setGameState] = useState<GameState>('ready');
  const [snake, setSnake] = useState<SnakeSegment[]>([
    { x: 5, y: 7 }  // 頭のみ
  ]);
  const [food, setFood] = useState<Position>({ x: 8, y: 5 });
  const [speedLevel, setSpeedLevel] = useState(1);
  const [dogExpression, setDogExpression] = useState<'normal' | 'smile' | 'sad'>('normal');
  const [highScore, setHighScore] = useState(0);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // アニメーション
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const directionRef = useRef<Direction>('right');
  const foodCollectedThisGame = useRef(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const hasShownTutorial = useRef(false);

  // データの読み込み
  useEffect(() => {
    const loadData = async () => {
      const data = await loadFoodRunnerData();
      setHighScore(data.highScore);
      setTotalGamesPlayed(data.totalGamesPlayed);

      // 初回プレイ時のみチュートリアルを表示
      if (data.totalGamesPlayed === 0 && !hasShownTutorial.current) {
        setShowTutorial(true);
        hasShownTutorial.current = true;
      }
    };
    loadData();
  }, []);

  // 音声設定とクリーンアップ
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => {
      // no-op
    });

    // クリーンアップ
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {
          // ignore
        });
      }
    };
  }, []);

  // ランダムな位置にごはんを配置（snakeを引数で受け取る）
  const generateFood = (currentSnake: SnakeSegment[]): Position => {
    let newFood: Position;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * 15),
      };
      attempts++;
    } while (
      attempts < maxAttempts &&
      currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    );
    
    return newFood;
  };

  // 効果音再生（メイン画面の「わん！」を流用）
  const playSound = async () => {
    // 設定を確認
    const settings = await loadSettings();
    if (!settings.soundEnabled) return;

    // 既存の音声を停止して解放
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        // ignore
      }
      soundRef.current = null;
    }
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/happy_woof.mp3')
      );
      soundRef.current = sound;
      await sound.playAsync();
      
      // 再生が終わったら解放
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {
            // ignore
          });
          if (soundRef.current === sound) {
            soundRef.current = null;
          }
        }
      });
    } catch (error) {
      console.warn('音声再生エラー:', error);
    }
  };

  // ゲームデータの保存
  const saveGameData = async (finalScore: number) => {
    try {
      const currentData = await loadFoodRunnerData();
      const newHighScore = Math.max(currentData.highScore, finalScore);
      
      const updatedData: FoodRunnerData = {
        highScore: newHighScore,
        totalGamesPlayed: currentData.totalGamesPlayed + 1,
        totalFoodCollected: currentData.totalFoodCollected + foodCollectedThisGame.current,
        lastPlayedAt: new Date().toISOString(),
      };

      await saveFoodRunnerData(updatedData);
      
      // ハイスコア更新
      if (newHighScore > highScore) {
        setHighScore(newHighScore);
      }
      setTotalGamesPlayed(prev => prev + 1);
    } catch (error) {
      console.error('ゲームデータの保存エラー:', error);
    }
  };

  // スネークの移動（useRefを使った実装に変更）
  const moveSnakeRef = useRef<(() => void) | undefined>(undefined);
  
  useEffect(() => {
    moveSnakeRef.current = () => {
      if (gameState !== 'playing') return;

      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        // 方向に応じて頭の位置を更新（directionRef.currentを使用）
        switch (directionRef.current) {
          case 'up':
            head.y -= 1;
            break;
          case 'down':
            head.y += 1;
            break;
          case 'left':
            head.x -= 1;
            break;
          case 'right':
            head.x += 1;
            break;
        }

        // 壁との衝突判定
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= 15) {
          setGameState('gameOver');
          setDogExpression('sad');
          
          // ゲームオーバー効果（長めの振動）
          loadSettings().then(settings => {
            if (settings.vibrationEnabled) {
              Vibration.vibrate([0, 200, 100, 200]); // パターン振動
            }
          });
          
          // ゲームオーバー時にデータを保存
          saveGameData(speedLevel);
          
          return prevSnake;
        }

        // 自分の体との衝突判定 (頭のみなので、このチェックは常にfalseになるが、残しておく)
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameState('gameOver');
          setDogExpression('sad');
          return prevSnake;
        }

        // 新しい頭を追加
        newSnake.unshift(head);

        // ごはんを食べたかチェック
        if (head.x === food.x && head.y === food.y) {
          setSpeedLevel(prev => prev + 1); // スピードレベルを上げる
          foodCollectedThisGame.current += 1; // ご飯を集めた数をカウント
          setDogExpression('smile');
          
          // 効果音 + バイブレーション
          playSound();
          loadSettings().then(settings => {
            if (settings.vibrationEnabled) {
              Vibration.vibrate(100); // 100ms振動
            }
          });
          
          // フェードアニメーション
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
          ]).start();

          // 1.5秒後に表情を戻す
          setTimeout(() => {
            setDogExpression('normal');
          }, 1500);

          // 新しいごはんを配置（現在のsnakeを渡す）
          const newFoodPos = generateFood([...newSnake]);
          setFood(newFoodPos);
        }

        // 胴体の長さを固定（1セグメント：頭のみ）にするため、尻尾を削除
        newSnake.pop();

        return newSnake;
      });
    };
  }, [gameState, food, fadeAnim]);

  // スピードレベルをrefで管理（ゲームループの再作成を防ぐ）
  const speedLevelRef = useRef(1);
  
  useEffect(() => {
    speedLevelRef.current = speedLevel;
  }, [speedLevel]);

  // ゲームループ（スピードレベルに応じて速度調整）
  useEffect(() => {
    if (gameState === 'playing') {
      const tick = () => {
        if (moveSnakeRef.current) {
          moveSnakeRef.current();
        }
        
        // 次のティックをスケジュール（スピードレベルに応じて）
        const baseSpeed = 200;
        const speedIncrement = 15;
        const gameSpeed = Math.max(50, baseSpeed - (speedLevelRef.current - 1) * speedIncrement);
        
        gameLoopRef.current = setTimeout(tick, gameSpeed) as any;
      };
      
      tick(); // 開始
    } else {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameState]);

  // ジェスチャーイベント処理
  const onGestureEvent = (event: any) => {
    const { translationX, translationY, state } = event.nativeEvent;
    
    if (state === 5) { // END state
      const threshold = 20;
      
      if (Math.abs(translationX) > threshold || Math.abs(translationY) > threshold) {
        if (Math.abs(translationX) > Math.abs(translationY)) {
          // 水平方向のスワイプ
          if (translationX > 0) {
            directionRef.current = 'right';
          } else {
            directionRef.current = 'left';
          }
        } else {
          // 垂直方向のスワイプ
          if (translationY > 0) {
            directionRef.current = 'down';
          } else {
            directionRef.current = 'up';
          }
        }
      }
    }
  };

  // ゲームスタート（カウントダウン付き）
  const startGame = async () => {
    // カウントダウン開始
    setCountdown(3);
    
    // 3秒カウントダウン
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    setCountdown(2);
    
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    setCountdown(1);
    
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    setCountdown(null);
    
    // ゲーム開始
    setGameState('playing');
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  // ゲームリスタート
  const restartGame = () => {
    const initialSnake = [{ x: 5, y: 7 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    directionRef.current = 'right';
    setSpeedLevel(1);
    speedLevelRef.current = 1;
    foodCollectedThisGame.current = 0; // ご飯カウントをリセット
    setGameState('ready');
    setDogExpression('normal');
    fadeAnim.setValue(1);
  };

  // セルの描画
  const renderCell = (x: number, y: number) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isFood = food.x === x && food.y === y;

    let cellContent = null;

    if (isSnakeHead) {
      // ながいぬの画像（常に同じ）
      cellContent = (
        <Animated.Image
          source={require('../../assets/simple/longdog.png')}
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

  return (
    <View style={styles.container}>
      {/* チュートリアル */}
      {showTutorial && <Tutorial type="foodRunner" onClose={handleCloseTutorial} />}

      {/* メインに戻るボタン */}
      {onBackToMain && (
        <TouchableOpacity style={styles.backButton} onPress={onBackToMain}>
          <Text style={styles.backButtonText}>← メインに戻る</Text>
        </TouchableOpacity>
      )}

      {/* スピードレベル表示 */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreText}>スピード: {speedLevel}</Text>
          <TouchableOpacity 
            style={styles.helpIconButton} 
            onPress={() => setShowTutorial(true)}
          >
            <Text style={styles.helpIcon}>？</Text>
          </TouchableOpacity>
        </View>
        {highScore > 0 && (
          <Text style={styles.highScoreText}>ハイスコア: {highScore}</Text>
        )}
      </View>

      {/* ゲームエリア */}
      <PanGestureHandler onHandlerStateChange={onGestureEvent}>
        <View style={styles.gameArea}>
          <View style={styles.grid}>
            {Array.from({ length: 15 }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => renderCell(x, y))
            )}
          </View>
        </View>
      </PanGestureHandler>

      {/* スタート画面（カウントダウン中は非表示） */}
      {gameState === 'ready' && countdown === null && (
        <View style={styles.startOverlay}>
          <Text style={styles.gameTitle}>ご飯ランナー</Text>
          <Text style={styles.startInstructionText}>スワイプで移動してご飯を集めよう！</Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>スタート</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* カウントダウン表示 */}
      {countdown !== null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* ゲームオーバー画面 */}
      {gameState === 'gameOver' && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>ゲームオーバー</Text>
          <Text style={styles.finalScoreText}>最終スピード: {speedLevel}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
            <Text style={styles.restartButtonText}>もういっかい！</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 操作説明 */}
      {gameState === 'playing' && (
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>スワイプで移動</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  helpIconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  highScoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  gameArea: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#90EE90',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#228B22',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellImage: {
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
  },
  food: {
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodText: {
    fontSize: 20,
  },
  startOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  startInstructionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 15,
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  finalScoreText: {
    fontSize: 24,
    color: 'white',
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  restartButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructions: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});