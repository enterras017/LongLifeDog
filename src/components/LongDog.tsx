import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { LongDogHead } from './LongDogHead';
import { LongDogBody } from './LongDogBody';
import { LongDogTail } from './LongDogTail';

interface LongDogProps {
  onSwitchToSnake?: () => void;
}

const LongDog: React.FC<LongDogProps> = ({ onSwitchToSnake }) => {
  const [bodyCount, setBodyCount] = useState(1);
  const [feedCount, setFeedCount] = useState(0);
  const [remainingFeeds, setRemainingFeeds] = useState(100);
  const [lastFeedDate, setLastFeedDate] = useState<string | null>(null);
  const [segmentIncrement, setSegmentIncrement] = useState(10); // 検証用: セグメント増加量
  const [dogExpression, setDogExpression] = useState<'normal' | 'smile' | 'sad'>('normal');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // iOS サイレントモードでも音が鳴るように設定（初回のみ）
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

    // クリーンアップ: コンポーネントアンマウント時に音声を解放
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {
          // ignore
        });
      }
    };
  }, []);

  const handleFeed = () => {
    if (remainingFeeds > 0) {
      // 表情を笑顔に変更
      setDogExpression('smile');
      
      // 一度にセグメントを追加
      setBodyCount(prev => prev + segmentIncrement);
      setFeedCount(prev => prev + 1);
      setRemainingFeeds(prev => prev - 1);
      
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
      
      const now = new Date();
      setLastFeedDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
      
      // 1.5秒後に通常表情に戻す
      setTimeout(() => {
        setDogExpression('normal');
      }, 1500);
    }
  };

  const handlePet = async () => {
    if (dogExpression === 'smile') return; // 多重反応防止
    
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
    
    setDogExpression('smile');

    // 効果音を再生
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

    setTimeout(() => {
      setDogExpression('normal');
    }, 1500);
  };

  const handleReset = () => {
    setBodyCount(1);
    setFeedCount(0);
    setRemainingFeeds(100);
    setLastFeedDate(null);
    setDogExpression('normal'); // 表情も通常に戻す
  };

  const getDogLength = () => {
    return Math.round(50 + (bodyCount - 1) * 1); // 基本50cm + セグメント×1cm
  };

  return (
    <View style={styles.container}>
      {/* ステータスバーエリア */}
      <View style={styles.statusBar}>
        <Text style={styles.title}>ながいぬのいる生活</Text>
        {onSwitchToSnake && (
          <TouchableOpacity style={styles.snakeButton} onPress={onSwitchToSnake}>
            <Text style={styles.snakeButtonText}>🏃‍♂️</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.dogContainer}>
          <LongDogHead expression={dogExpression} fadeAnim={fadeAnim} onPet={handlePet} />
          <LongDogBody totalWidth={bodyCount} />
          <LongDogTail />
        </View>
      </ScrollView>

      <View style={styles.infoContainer}>
        <Text style={styles.dogName}>ながいぬ</Text>
        <Text style={styles.infoText}>長さ: {getDogLength()}cm</Text>
        <Text style={styles.moodText}>機嫌: ごきげん</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.feedButton, remainingFeeds === 0 && styles.disabledButton]} 
          onPress={handleFeed}
          disabled={remainingFeeds === 0}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.feedIcon}>🍖</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.feedButtonText}>ごはんをあげる</Text>
              <Text style={styles.remainingText}>残り {remainingFeeds}/100回</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <View style={styles.buttonContent}>
            <Text style={styles.resetIcon}>🔄</Text>
            <Text style={styles.resetButtonText}>リセット</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>今日のごはん: {feedCount}回</Text>
        <Text style={styles.statsText}>
          最後のごはん: {lastFeedDate || 'まだ'}
        </Text>
      </View>

      {/* 検証用ボタン */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>検証用: セグメント増加量</Text>
        <View style={styles.debugButtonRow}>
          <TouchableOpacity 
            style={[styles.debugButton, segmentIncrement === 1 && styles.debugButtonActive]} 
            onPress={() => setSegmentIncrement(1)}
          >
            <Text style={styles.debugButtonText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.debugButton, segmentIncrement === 5 && styles.debugButtonActive]} 
            onPress={() => setSegmentIncrement(5)}
          >
            <Text style={styles.debugButtonText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.debugButton, segmentIncrement === 10 && styles.debugButtonActive]} 
            onPress={() => setSegmentIncrement(10)}
          >
            <Text style={styles.debugButtonText}>10</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // 全体の背景は白
    alignItems: 'center',
    paddingTop: 20, // 余白調整
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // 文字色は黒
    textAlign: 'center',
    flex: 1,
  },
  snakeButton: {
    backgroundColor: '#FF6B6B',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  snakeButtonText: {
    fontSize: 20,
  },
  scrollView: {
    height: 200, // 固定の高さ
    width: '100%',
    marginBottom: 20,
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
  },
  dogContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  dogName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  moodText: {
    fontSize: 18,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  feedButton: {
    backgroundColor: '#ffd700',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  resetIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  buttonTextContainer: {
    alignItems: 'center',
  },
  feedButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  remainingText: {
    color: '#666',
    fontSize: 14,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  debugContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  debugTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  debugButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  debugButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    minWidth: 40,
    alignItems: 'center',
  },
  debugButtonActive: {
    backgroundColor: '#4CAF50',
  },
  debugButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default LongDog;