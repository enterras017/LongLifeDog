import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';

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
type GameState = 'playing' | 'gameOver' | 'paused';

interface FoodRunnerProps {
  onBack?: () => void;
}

export const FoodRunner: React.FC<FoodRunnerProps> = ({ onBack }) => {
  // ゲーム状態
  const [gameState, setGameState] = useState<GameState>('playing');
  const [snake, setSnake] = useState<SnakeSegment[]>([
    { x: 5, y: 7 }  // 頭のみ
  ]);
  const [food, setFood] = useState<Position>({ x: 8, y: 5 });
  const [direction, setDirection] = useState<Direction>('right');
  const [speedLevel, setSpeedLevel] = useState(1);
  const [dogExpression, setDogExpression] = useState<'normal' | 'smile' | 'sad'>('normal');
  
  // アニメーション
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 音声設定
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // ランダムな位置にごはんを配置
  const generateFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * 15),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  // 効果音再生
  const playWoofSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/happy_woof.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('音声再生エラー:', error);
    }
  };

  // スネークの移動
  const moveSnake = useCallback(() => {
    if (gameState !== 'playing') return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      // 方向に応じて頭の位置を更新
      switch (direction) {
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
        return prevSnake;
      }

      // 自分の体との衝突判定
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameOver');
        setDogExpression('sad');
        return prevSnake;
      }

      // 新しい頭を追加
      newSnake.unshift(head);

      // ごはんを食べたかチェック
      if (head.x === food.x && head.y === food.y) {
        // スピードレベルを上げる
        setSpeedLevel(prev => prev + 1);
        setDogExpression('smile');
        playWoofSound();
        
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

        // 新しいごはんを配置
        setFood(generateFood());
      }

      // 胴体の長さを固定（1セグメント：頭のみ）にするため、尻尾を削除
      newSnake.pop();

      return newSnake;
    });
  }, [direction, gameState, food, generateFood, fadeAnim]);

  // ゲームループ（スピードレベルに応じて速度調整）
  useEffect(() => {
    if (gameState === 'playing') {
      // スピードレベルに応じて速度を調整（レベルが上がるほど速く）
      const baseSpeed = 200;
      const speedIncrement = 15; // レベルごとに15ms速く
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

  // スワイプジェスチャー処理
  const onGestureEvent = (event: any) => {
    if (gameState !== 'playing') return;

    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      const threshold = 30;

      if (Math.abs(translationX) > Math.abs(translationY)) {
        // 水平方向のスワイプ
        if (translationX > threshold && direction !== 'left') {
          setDirection('right');
        } else if (translationX < -threshold && direction !== 'right') {
          setDirection('left');
        }
      } else {
        // 垂直方向のスワイプ
        if (translationY > threshold && direction !== 'up') {
          setDirection('down');
        } else if (translationY < -threshold && direction !== 'down') {
          setDirection('up');
        }
      }
    }
  };

  // ゲームリスタート
  const restartGame = () => {
    setSnake([
      { x: 5, y: 7 }  // 頭のみ
    ]);
    setFood(generateFood());
    setDirection('right');
    setSpeedLevel(1);
    setGameState('playing');
    setDogExpression('normal');
    fadeAnim.setValue(1);
  };

  // セルの描画
  const renderCell = (x: number, y: number) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isFood = food.x === x && food.y === y;

    let cellContent = null;

    if (isSnakeHead) {
      // 頭の画像（表情に応じて変更）
      const headImage = dogExpression === 'smile' 
        ? require('../../assets/simple/longdog_head.png') // 笑顔時は通常画像を使用（smile画像が存在しない場合）
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

  return (
    <View style={styles.container}>
      {/* 戻るボタン */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
      )}
      
      {/* スピードレベル表示 */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>スピード: {speedLevel}</Text>
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
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>ご飯ランナー - スワイプで移動</Text>
      </View>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  scoreContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodText: {
    fontSize: 20,
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
  },
});
