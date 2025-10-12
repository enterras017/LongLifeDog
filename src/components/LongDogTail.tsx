import React from 'react';
import { Image, StyleSheet } from 'react-native';

export const LongDogTail: React.FC = () => {
  return (
    <Image
      source={require('../../assets/simple/longdog_tail.png')}
      style={styles.image}
      resizeMode="stretch"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 110,
    height: 120,
  },
});
