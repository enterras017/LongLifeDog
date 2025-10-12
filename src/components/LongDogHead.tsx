import React from 'react';
import { Image, StyleSheet } from 'react-native';

export const LongDogHead: React.FC = () => {
  return (
    <Image
      source={require('../../assets/simple/longdog_head.png')}
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
