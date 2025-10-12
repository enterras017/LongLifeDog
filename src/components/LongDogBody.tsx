import React from 'react';
import { Image, StyleSheet } from 'react-native';

export const LongDogBody: React.FC = () => {
  return (
    <Image
      source={require('../../assets/simple/longdog_body.png')}
      style={styles.image}
      resizeMode="stretch"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 1,
    height: 120,
  },
});
