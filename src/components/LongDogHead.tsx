import React from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

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

  return (
    <TouchableOpacity onPress={onPet} activeOpacity={0.8}>
      <Animated.Image
        source={getImageSource()}
        style={[styles.image, { opacity: fadeAnim }]}
        resizeMode="stretch"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 110,
    height: 120,
  },
});
