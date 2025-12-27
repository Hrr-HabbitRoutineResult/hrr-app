import { Dimensions } from 'react-native';

// 피그마 디자인 기준 해상도 (390 x 844)
const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

const { width, height } = Dimensions.get('window');

// 커스텀 스케일링 함수
export const scale = (size: number) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor: number = 0.5) =>
  size + (scale(size) - size) * factor;
