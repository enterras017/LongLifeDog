import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { LongDogHead } from './LongDogHead';
import { LongDogBody } from './LongDogBody';
import { LongDogTail } from './LongDogTail';

const LongDog: React.FC = () => {
  const [bodyCount, setBodyCount] = useState(1);
  const [feedCount, setFeedCount] = useState(0);
  const [remainingFeeds, setRemainingFeeds] = useState(100);
  const [lastFeedDate, setLastFeedDate] = useState<string | null>(null);
  const [segmentIncrement, setSegmentIncrement] = useState(10); // 検証用: セグメント増加量
  const [dogExpression, setDogExpression] = useState<'normal' | 'smile' | 'sad'>('normal');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 安定したセグメント配列をメモ化
  const bodySegments = React.useMemo(() => {
    return Array.from({ length: bodyCount }, (_, i) => i);
  }, [bodyCount]);

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

  const getDisplayLength = () => {
    return Math.round(200 + feedCount * 8); // 表示用の長さ
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ながいぬのいる生活</Text>
      
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.dogContainer}>
          <LongDogHead expression={dogExpression} fadeAnim={fadeAnim} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // 文字色は黒
    marginBottom: 20,
    textAlign: 'center',
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