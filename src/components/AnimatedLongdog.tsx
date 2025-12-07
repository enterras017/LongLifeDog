import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { G, Defs, ClipPath, Rect } from 'react-native-svg';
import LongdogSvg from '../icons/Longdog';

export type AnimatedLongdogHandle = {
  feedDog: () => void;
};

export const AnimatedLongdog = forwardRef<AnimatedLongdogHandle>((_props, ref) => {
  const scaleX = useRef(new Animated.Value(1)).current;
  const AnimatedG = useMemo(() => Animated.createAnimatedComponent(G), []);
  const AnimatedRightG = AnimatedG;
  const AnimatedLeftG = AnimatedG;
  const currentScaleRef = useRef(1);

  // longdog.svg の viewBox（コンポーネント内の定義に合わせる）
  const vbWidth = 835.6;
  const vbHeight = 435.2;

  // 中央帯を明示定義（中央寄せ）。必要に応じて bandWidth を調整
  const bandWidth = 80; // 目視でわかる伸び量にする（後で微調整可）
  const middleCenter = vbWidth / 2;
  const leftEdge = middleCenter - bandWidth / 2;
  const rightEdge = middleCenter + bandWidth / 2;

  const animateFeed = () => {
    // 累積で少しずつ長くする
    const next = Math.min(currentScaleRef.current * 1.10, 3.0);
    currentScaleRef.current = next;
    Animated.timing(scaleX, {
      toValue: next,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useImperativeHandle(ref, () => ({ feedDog: animateFeed }));

  // 同一SVGを3枚重ねて、中央レイヤーのみscaleX。見た目は1枚に見える。
  return (
    <View style={styles.root}>
      <Svg width={320} height={160} viewBox={`0 0 ${vbWidth} ${vbHeight}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <ClipPath id="ld_left">
            <Rect x={0} y={0} width={leftEdge} height={vbHeight} />
          </ClipPath>
          <ClipPath id="ld_middle">
            <Rect x={leftEdge} y={0} width={rightEdge - leftEdge} height={vbHeight} />
          </ClipPath>
          <ClipPath id="ld_right">
            <Rect x={rightEdge} y={0} width={vbWidth - rightEdge} height={vbHeight} />
          </ClipPath>
        </Defs>

        {/* 1) 中央（拡張）を先に描画して、のちに左右で縁を覆って継ぎ目を隠す */}
        <AnimatedG
          clipPath="url(#ld_middle)"
          style={{ transform: [{ translateX: middleCenter }, { scaleX }, { translateX: -middleCenter }] }}
        >
          {/* @ts-ignore */}
          <LongdogSvg width={vbWidth} height={vbHeight} />
        </AnimatedG>

        {/* 左（頭側）: 中央拡大分の半分だけ左へシフト */}
        <AnimatedLeftG
          clipPath="url(#ld_left)"
          style={{ transform: [{ translateX: Animated.multiply(Animated.subtract(scaleX, 1), -(bandWidth / 2)) }] }}
        >
          {/* @ts-ignore */}
          <LongdogSvg width={vbWidth} height={vbHeight} />
        </AnimatedLeftG>

        {/* 右（尻尾側）: 中央拡大分の半分だけ右へシフト */}
        <AnimatedRightG
          clipPath="url(#ld_right)"
          style={{ transform: [{ translateX: Animated.multiply(Animated.subtract(scaleX, 1), bandWidth / 2) }] }}
        >
          {/* @ts-ignore */}
          <LongdogSvg width={vbWidth} height={vbHeight} />
        </AnimatedRightG>
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
});


