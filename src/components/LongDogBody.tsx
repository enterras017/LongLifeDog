import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface LongDogBodyProps {
  totalWidth: number;
}

export const LongDogBody: React.FC<LongDogBodyProps> = ({ totalWidth }) => {
  return (
    <Image
      source={require('../../assets/simple/longdog_body.png')}
      style={[styles.image, { width: totalWidth }]}
      resizeMode="stretch"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    height: 120,
  },
});
