import { scale, moderateScale } from '../utils/scaling';

export const colors = {
  // Primary
  primary: {
    main: '#FF6B61',
    sub: '#FF473B',
    light: '#FF9F99',
    lighter: '#FFE0DE',
    lightest: '#FFF1F0',
  },
  // Gray Scale (용도별)
  text: {
    primary: '#202020',
    secondary: '#3E4145',
    tertiary: '#5A5F68',
  },
  icon: {
    gray: '#A7AEBB',
  },
  button: '#D7DBE4',
  line: '#E9EDF4',
  background: '#F7F8FB',
  white: '#FFFFFF',
  destructive: {
    ios: '#FF3B30',
    Android: '#E53935'
  }
} as const;

export const typography = {
  // hrr/Header 1
  header1: {
    fontSize: moderateScale(24),
    fontWeight: '600' as const,
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.3,
    lineHeight: moderateScale(34),
  },
  // hrr/Header 2
  header2: {
    fontSize: moderateScale(20),
    fontWeight: '600' as const,
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.3,
    lineHeight: moderateScale(28),
  },
  // hrr/Header 3
  header3: {
    fontSize: moderateScale(18),
    fontWeight: '600' as const,
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.3,
    lineHeight: moderateScale(26),
  },
  // hrr/Header 4
  header4: {
    fontSize: moderateScale(16),
    fontWeight: '600' as const,
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.3,
    lineHeight: moderateScale(22),
  },
  // hrr/Md size
  md: {
    fontSize: moderateScale(16),
    fontWeight: '500' as const,
    fontFamily: 'Pretendard-Medium',
    letterSpacing: -0.3,
    lineHeight: moderateScale(22),
  },
  // hrr/Sm size (Md)
  smMd: {
    fontSize: moderateScale(15),
    fontWeight: '500' as const,
    fontFamily: 'Pretendard-Medium',
    letterSpacing: -0.3,
    lineHeight: moderateScale(21),
  },
  // hrr/Sm size (Reg)
  smReg: {
    fontSize: moderateScale(15),
    fontWeight: '400' as const,
    fontFamily: 'Pretendard-Regular',
    letterSpacing: -0.3,
    lineHeight: moderateScale(21),
  },
  // hrr/Xs size (Md)
  xsMd: {
    fontSize: moderateScale(13),
    fontWeight: '500' as const,
    fontFamily: 'Pretendard-Medium',
    letterSpacing: -0.3,
    lineHeight: moderateScale(18),
  },
  // hrr/Xs size (Reg)
  xsReg: {
    fontSize: moderateScale(13),
    fontWeight: '400' as const,
    fontFamily: 'Pretendard-Regular',
    letterSpacing: -0.3,
    lineHeight: moderateScale(18),
  },
  // hrr/Xxs size
  xxs: {
    fontSize: moderateScale(12),
    fontWeight: '400' as const,
    fontFamily: 'Pretendard-Regular',
    letterSpacing: -0.3,
    lineHeight: moderateScale(17),
  },
  // hrr/caption
  caption: {
    fontSize: moderateScale(10),
    fontWeight: '400' as const,
    fontFamily: 'Pretendard-Regular',
    letterSpacing: -0.3,
    lineHeight: moderateScale(14),
  },
} as const;

export const spacing = {
  xxs: scale(4),
  xs: scale(8),
  sm: scale(12),
  md: scale(16),
  lg: scale(20),
  xl: scale(24),
  xxl: scale(32),
  xxxl: scale(40),
} as const;

export const radius = {
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
} as const;
