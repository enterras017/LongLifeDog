import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import LongdogBody from '../icons/LongdogBody';

interface LongDogBodyProps {
  color?: string;
  width?: number;
  height?: number;
}

export const LongDogBody: React.FC<LongDogBodyProps> = ({ color = '#F85E3F', width = 80, height = 120 }) => {
  const isComponent = typeof LongdogBody === 'function' || (typeof LongdogBody === 'object' && LongdogBody !== null);
  if (isComponent) {
    return (
      <View style={styles.container}>
        <LongdogBody width={width} height={height} preserveAspectRatio="none" />
      </View>
    );
  }

  // Fallback only (not used when SVGR component exists): simple transparent SVG that preserves spacing
  const bodySvg = `
<svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>`;
  return <View style={styles.container}><SvgXml xml={bodySvg} width={width} height={height} preserveAspectRatio="none" /></View>;
};

const styles = StyleSheet.create({
  container: {
    margin: 0,
    padding: 0,
  },
});
