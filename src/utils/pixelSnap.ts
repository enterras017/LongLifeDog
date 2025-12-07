import { PixelRatio } from 'react-native';

export function snapToPixel(value: number): number {
  const scale = PixelRatio.get();
  return Math.round(value * scale) / scale;
}




<<<<<<< HEAD


=======
>>>>>>> d2d1bd14458db03eb1a31dece82cf0cac46a607d
