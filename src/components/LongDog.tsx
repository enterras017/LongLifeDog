import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';

interface LongDogProps {
  onFeed?: () => void;
  onSwitchToFoodRunner?: () => void;
}

const LongDog: React.FC<LongDogProps> = ({ onFeed, onSwitchToFoodRunner }) => {
  const [bodySegments, setBodySegments] = useState(1);
  const bodyScaleAnim = useRef(new Animated.Value(1)).current;

  const feedDog = () => {
    // セグメントを即座に追加
    setBodySegments(prev => Math.min(prev + 1, 20));
    
    // 体の伸びるアニメーション
    Animated.sequence([
      Animated.timing(bodyScaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bodyScaleAnim, {
        toValue: 1.0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    onFeed?.();
  };

  const getDogLength = () => {
    return Math.round(80 + (bodySegments - 1) * 30); // 基本80px + セグメント×30px
  };

  const renderBodySegments = () => {
    const segments = [];
    for (let i = 0; i < bodySegments; i++) {
      segments.push(
        <View
          key={`segment-${i}`}
          style={[
            styles.bodySegment,
            { width: i === 0 ? 80 : 30 } // 最初のセグメントは幅広く
          ]}
        />
      );
    }
    return segments;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ながいぬアプリ</Text>
      
      <View style={styles.dogContainer}>
        {/* 頭部 */}
        <View style={styles.head}>
          <Text style={styles.emoji}>🐶</Text>
        </View>
        
        {/* 胴体セグメント */}
        <Animated.View 
          style={[
            styles.bodyContainer,
            { transform: [{ scaleX: bodyScaleAnim }] }
          ]}
        >
          {renderBodySegments()}
        </Animated.View>
        
        {/* 尻尾 */}
        <View style={styles.tail}>
          <Text style={styles.emoji}>🐕</Text>
        </View>
      </View>
      
      <Text style={styles.lengthText}>
        長さ: {getDogLength()}px ({bodySegments}セグメント)
      </Text>
      
      <TouchableOpacity style={styles.feedButton} onPress={feedDog}>
        <Text style={styles.feedButtonText}>ごはんをあげる</Text>
      </TouchableOpacity>
      
      {onSwitchToFoodRunner && (
        <TouchableOpacity style={styles.gameButton} onPress={onSwitchToFoodRunner}>
          <Text style={styles.gameButtonText}>あそぶ</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  dogContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  head: {
    width: 80,
    height: 80,
    backgroundColor: '#ffd700',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  bodyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bodySegment: {
    height: 60,
    backgroundColor: '#8b4513',
    borderWidth: 1,
    borderColor: '#654321',
    marginHorizontal: 1,
  },
  tail: {
    width: 80,
    height: 80,
    backgroundColor: '#ffd700',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  emoji: {
    fontSize: 32,
  },
  lengthText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  feedButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gameButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LongDog;