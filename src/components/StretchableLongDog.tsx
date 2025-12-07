import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';

export type StretchableLongDogHandle = {
  feedDog: () => void;
  resetDog: () => void;
  getLength: () => number;
};

interface StretchableLongDogProps {
  headSource?: any;
  bodySource?: any;
  tailSource?: any;
}

export const StretchableLongDog = forwardRef<StretchableLongDogHandle, StretchableLongDogProps>(
  (
    {
      headSource = require('../../assets/simple/longdog_head.png'),
      bodySource = require('../../assets/simple/longdog_body.png'),
      tailSource = require('../../assets/simple/longdog_tail.png'),
    },
    ref
  ) => {
    // 胴体の枚数（初期値: 1枚、最大7000枚）
    const [bodyCount, setBodyCount] = useState(1);

    // ごはんをあげる（胴体を20枚追加）
    const feedDog = useCallback(() => {
      setBodyCount((prev) => Math.min(prev + 20, 7000));
    }, []);

    // リセット（胴体を1枚に戻す）
    const resetDog = useCallback(() => {
      setBodyCount(1);
    }, []);

    const getLength = useCallback(() => {
      return 50 + Math.floor((bodyCount - 1) / 20) * 10;
    }, [bodyCount]);

    useImperativeHandle(ref, () => ({ feedDog, resetDog, getLength }));

    // 長さ表示（cm）= 初期長さ50cm + 胴体20個ごとに10cm増加
    const lengthCm = 50 + Math.floor((bodyCount - 1) / 20) * 10;

    return (
      <View style={styles.container}>
        {/* 犬の画像（横並び、スクロール可能） */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.dogRow}>
            {/* 頭部（固定） */}
            <View style={styles.headContainer}>
              <Image
                source={headSource}
                style={styles.headImage}
                resizeMode="contain"
              />
            </View>

            {/* 胴体部分（枚数分繰り返し） */}
            {Array.from({ length: bodyCount }).map((_, index) => (
              <View key={`body-container-${index}`} style={styles.bodyContainer}>
                <Image
                  key={`body-${index}`}
                  source={bodySource}
                  style={styles.bodyImage}
                  resizeMode="stretch"
                />
              </View>
            ))}

            {/* 尻尾（固定） */}
            <View style={styles.tailContainer}>
              <Image
                source={tailSource}
                style={styles.tailImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  dogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headContainer: {
    width: 110,
    height: 120,
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  headImage: {
    width: 120,
    height: 120,
  },
  bodyContainer: {
    width: 0.5,
    height: 120,
    overflow: 'hidden',
    alignItems: 'center',
  },
  bodyImage: {
    width: 1.5,
    height: 120,
  },
  tailContainer: {
    width: 110,
    height: 120,
    overflow: 'hidden',
    alignItems: 'flex-end',
  },
  tailImage: {
    width: 120,
    height: 120,
  },
  lengthText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

