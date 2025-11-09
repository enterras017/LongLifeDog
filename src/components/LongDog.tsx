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
import { Tutorial } from './Tutorial';
import { Settings } from './Settings';
import { loadMainData, saveMainData, type MainData, loadSettings, saveSettings } from '../utils/storage';

interface LongDogProps {
  onSwitchToSnake?: () => void;
}

const LongDog: React.FC<LongDogProps> = ({ onSwitchToSnake }) => {
  const [bodyCount, setBodyCount] = useState(1);
  const [feedCount, setFeedCount] = useState(0);
  const [remainingFeeds, setRemainingFeeds] = useState(3); // デフォルト3回に変更
  const [lastFeedDate, setLastFeedDate] = useState<string | null>(null);
  const [totalPetCount, setTotalPetCount] = useState(0);
  const segmentIncrement = 1; // 固定値に変更（検証用機能を削除）
  const [dogExpression, setDogExpression] = useState<'normal' | 'smile' | 'sad'>('normal');
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  
  // データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadMainData();
        setBodyCount(data.bodyCount);
        setFeedCount(data.feedCount);
        setRemainingFeeds(data.remainingFeeds);
        setLastFeedDate(data.lastFeedDate);
        setTotalPetCount(data.totalPetCount);

        // 最後にご飯をあげた日から1日以上経過しているかチェック
        if (data.lastFeedDate) {
          const lastFeed = new Date(data.lastFeedDate);
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - lastFeed.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff >= 1) {
            setDogExpression('sad');
          }
        }

        // チュートリアル表示判定
        const settings = await loadSettings();
        if (!settings.tutorialCompleted) {
          setShowTutorial(true);
        }
      } catch (error) {
        console.error('データ読み込みエラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // データの自動保存（状態が変わったら保存）
  useEffect(() => {
    if (isLoading) return; // 初回読み込み中は保存しない

    const saveData = async () => {
      const data: MainData = {
        bodyCount,
        feedCount,
        remainingFeeds,
        lastFeedDate,
        totalPetCount,
        totalPlayTime: Math.floor((Date.now() - mountTimeRef.current) / 1000),
        createdAt: new Date().toISOString(), // 既存データがあればそのまま
        lastPlayedAt: new Date().toISOString(),
      };

      await saveMainData(data);
    };

    saveData();
  }, [bodyCount, feedCount, remainingFeeds, lastFeedDate, totalPetCount, isLoading]);
  
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
    
    setDogExpression('smile');
    setTotalPetCount(prev => prev + 1); // なでなで回数をカウント

    // 設定を確認して効果音を再生
    const settings = await loadSettings();
    if (settings.soundEnabled) {
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
    setRemainingFeeds(3); // デフォルト3回に変更
    setLastFeedDate(null);
    setDogExpression('normal'); // 表情も通常に戻す
  };

  const getDogLength = () => {
    return Math.round(50 + (bodyCount - 1) * 1); // 基本50cm + セグメント×1cm
  };

  const handleCloseTutorial = async () => {
    setShowTutorial(false);
    // チュートリアル完了フラグを保存
    const settings = await loadSettings();
    await saveSettings({ ...settings, tutorialCompleted: true });
  };

  // ローディング中
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* チュートリアル */}
      {showTutorial && <Tutorial type="main" onClose={handleCloseTutorial} />}
      
      {/* 設定 */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* タイトルバー */}
      <View style={styles.statusBar}>
        <Text style={styles.title}>ながいぬのいる生活</Text>
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
              <Text style={styles.remainingText}>残り {remainingFeeds}/3回</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>今日のごはん: {feedCount}回</Text>
        <Text style={styles.statsText}>
          最後のごはん: {lastFeedDate || 'まだ'}
        </Text>
      </View>

      {/* 設定・ご飯ランナー・ヘルプボタン */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={styles.bottomButton} 
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.bottomButtonIcon}>⚙️</Text>
          <Text style={styles.bottomButtonText}>設定</Text>
        </TouchableOpacity>
        {onSwitchToSnake && (
          <TouchableOpacity 
            style={styles.bottomButton} 
            onPress={onSwitchToSnake}
          >
            <Text style={styles.bottomButtonIcon}>🐶</Text>
            <Text style={styles.bottomButtonText}>あそぶ</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.bottomButton} 
          onPress={() => setShowTutorial(true)}
        >
          <Text style={styles.bottomButtonIcon}>？</Text>
          <Text style={styles.bottomButtonText}>ヘルプ</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  statusBar: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedIcon: {
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
  statsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
    paddingHorizontal: 10,
  },
  bottomButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    flex: 1,
    maxWidth: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  bottomButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default LongDog;