import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, Text, Image } from 'react-native';

export type MaskedLongDogHandle = {
  feedDog: () => void;
  resetDog: () => void;
};

interface MaskedLongDogProps {
  source?: any;
}

export const MaskedLongDog = forwardRef<MaskedLongDogHandle, MaskedLongDogProps>(
  ({ source = require('../../assets/simple/longdog.png') }, ref) => {
    // 胴体のスケール値（1.0 → 1.02 → ... 最大 2.0）
    const [bodyScale, setBodyScale] = useState(1);
    const scaleX = useRef(new Animated.Value(1)).current;

    // 画像のサイズ（Illustratorのガイド線に基づく）
    const imageWidth = 400; // 全体幅
    const imageHeight = 150; // 全体高さ
    
    // 胴体部分のマスク範囲（Illustratorのガイド線座標）
    const headEnd = 50; // 頭部終了（胴体開始）
    const tailStart = 250; // 尻尾開始（胴体終了）
    const bodyWidth = tailStart - headEnd; // 胴体幅 = 200
    
    // アニメーション開始
    const animateTo = useCallback((next: number) => {
      Animated.timing(scaleX, {
        toValue: next,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [scaleX]);

    const feedDog = useCallback(() => {
      const next = Math.min(bodyScale + 0.02, 2.0);
      setBodyScale(next);
      animateTo(next);
    }, [animateTo, bodyScale]);

    const resetDog = useCallback(() => {
      setBodyScale(1);
      animateTo(1);
    }, [animateTo]);

    useImperativeHandle(ref, () => ({ feedDog, resetDog }));

    // 胴体の拡大後の幅計算
    const expandedBodyWidth = useMemo(() => {
      return bodyWidth * bodyScale;
    }, [bodyWidth, bodyScale]);

    // 全体の幅（頭 + 拡大胴体 + 尻尾）
    const totalWidth = useMemo(() => {
      return headEnd + expandedBodyWidth + (imageWidth - tailStart);
    }, [headEnd, expandedBodyWidth, tailStart, imageWidth]);

    // 尻尾の位置調整（胴体が拡大した分だけ右にシフト）
    const tailTranslateX = useMemo(() => {
      return (bodyScale - 1) * bodyWidth;
    }, [bodyScale, bodyWidth]);

    const lengthCm = Math.round(100 * bodyScale);

    return (
      <View style={styles.container}>
        <View style={[styles.dogContainer, { width: totalWidth }]}>
          {/* 頭部（完全固定） */}
          <View style={[styles.headSection, { width: headEnd }]}>
            <Image
              source={source}
              style={[
                styles.dogImage,
                {
                  width: imageWidth,
                  height: imageHeight,
                },
              ]}
              resizeMode="contain"
            />
          </View>
          
          {/* 胴体部分（マスク付き拡大） */}
          <View style={[styles.bodySection, { width: expandedBodyWidth }]}>
            <View style={styles.bodyMask}>
              <Animated.View
                style={[
                  styles.bodyImageContainer,
                  {
                    transform: [
                      { translateX: -headEnd },
                      { scaleX: scaleX },
                      { translateX: headEnd },
                    ],
                  },
                ]}
              >
                <Image
                  source={source}
                  style={[
                    styles.dogImage,
                    {
                      width: imageWidth,
                      height: imageHeight,
                    },
                  ]}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </View>
          
          {/* 尻尾（完全固定、位置調整） */}
          <View 
            style={[
              styles.tailSection, 
              { 
                width: imageWidth - tailStart,
                transform: [{ translateX: tailTranslateX }]
              }
            ]}
          >
            <Image
              source={source}
              style={[
                styles.dogImage,
                {
                  width: imageWidth,
                  height: imageHeight,
                  transform: [{ translateX: -tailStart }],
                },
              ]}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.lengthText}>長さ: {lengthCm}cm</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dogContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headSection: {
    overflow: 'hidden',
    height: 150,
  },
  bodySection: {
    overflow: 'hidden',
    height: 150,
  },
  tailSection: {
    overflow: 'hidden',
    height: 150,
  },
  bodyImageContainer: {
    width: 400,
    height: 150,
  },
  bodyMask: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  dogImage: {
    backgroundColor: 'transparent',
  },
  lengthText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});
