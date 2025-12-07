import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, Text, ScrollView } from 'react-native';
import { LongDogHead } from './LongDogHead';
import { LongDogBody } from './LongDogBody';
import { LongDogTail } from './LongDogTail';
import { snapToPixel } from '../utils/pixelSnap';

export type LongDogGrowingHandle = {
  feedDog: () => void;
  resetDog: () => void;
};

export const LongDogGrowing = forwardRef<LongDogGrowingHandle>((_props, ref) => {
  // body のスケール値（1.0 → 1.05 → ... 最大 5.0）
  const [bodyScale, setBodyScale] = useState(1);
  const scaleX = useRef(new Animated.Value(1)).current;

  // bodyのベース幅を固定（viewBox 42.85 → 表示24pxに正規化）
  // 実測に近い見た目の初期胴体幅（柔軟に変更可能）
  const bodyBaseWidth = snapToPixel(80);

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
    const next = Math.min(bodyScale + 0.05, 5.0);
    setBodyScale(next);
    animateTo(next);
  }, [animateTo, bodyScale]);

  const resetDog = useCallback(() => {
    setBodyScale(1);
    animateTo(1);
  }, [animateTo]);

  useImperativeHandle(ref, () => ({ feedDog, resetDog }));

  // 左端起点で拡大させるための補正: +(baseWidth/2)*(scale-1)
  const leftAnchorTranslate = useMemo(
    () => Animated.multiply(Animated.subtract(scaleX, 1), bodyBaseWidth / 2),
    [scaleX, bodyBaseWidth]
  );

  // Tail を右へ押す距離（width アニメを使わず transform で対応）
  const tailTranslate = useMemo(
    () => Animated.multiply(Animated.subtract(scaleX, 1), bodyBaseWidth),
    [scaleX, bodyBaseWidth]
  );

  const lengthCm = Math.round(100 * bodyScale);

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      <View style={styles.root}>
        <View style={styles.row}>
          <LongDogHead />

          {/* body 外枠: 幅は固定。scaleXで右側に伸ばし、Tailはtransformで押し出す */}
          <Animated.View style={[styles.bodyOuter, { width: bodyBaseWidth, height: snapToPixel(120) }]}>
            <Animated.View
              style={{
                width: bodyBaseWidth,
                height: snapToPixel(120),
                transform: [{ translateX: leftAnchorTranslate }, { scaleX }],
              }}
            >
              <LongDogBody width={bodyBaseWidth} height={snapToPixel(120)} />
            </Animated.View>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: tailTranslate }] }}>
            <LongDogTail />
          </Animated.View>
        </View>

        <Text style={styles.length}>長さ: {lengthCm}cm</Text>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollView: { 
    flexGrow: 0,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  root: { 
    alignItems: 'center',
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  bodyOuter: { 
    overflow: 'hidden',
  },
  length: { 
    marginTop: 8, 
    fontSize: 14, 
    color: '#333',
  },
});


