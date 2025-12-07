import { PixelRatio } from 'react-native';

export function snapToPixel(value: number): number {
  const scale = PixelRatio.get();
  return Math.round(value * scale) / scale;
}






