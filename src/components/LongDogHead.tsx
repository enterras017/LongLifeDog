import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

interface LongDogHeadProps {
  expression: 'normal' | 'smile' | 'sad';
  fadeAnim: Animated.Value;
  onPet?: () => void;
}

export const LongDogHead: React.FC<LongDogHeadProps> = ({ expression, fadeAnim, onPet }) => {
  const getImageSource = () => {
    switch (expression) {
      case 'smile':
        return require('../../assets/simple/longdog_head_smile.png');
      case 'sad':
        return require('../../assets/simple/longdog_head_normal.png'); // sadがないのでnormalを使用
      default:
        return require('../../assets/simple/longdog_head_normal.png');
    }
  };

  const onGestureEvent = (event: any) => {
    // タップ（distance < 10）またはスワイプ（distance > 30）で撫でたと判定
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      const distance = Math.sqrt(translationX * translationX + translationY * translationY);
      
      // タップまたはスワイプで反応（中途半端な距離は無視）
      if (distance < 10 || distance > 30) {
        onPet?.();
      }
    }
  };

  return (
    <PanGestureHandler onHandlerStateChange={onGestureEvent}>
      <Animated.Image
        source={getImageSource()}
        style={[styles.image, { opacity: fadeAnim }]}
        resizeMode="stretch"
      />
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 110,
    height: 120,
  },
});
