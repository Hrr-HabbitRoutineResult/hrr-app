export const colors = {
  // Primary
  primary: {
    main: '#FF6B61',
    sub: '#FF473B',
    light: '#FF9F99',
    lighter: '#FFE0DE',
    lightest: '#FFEBE9'
  },

  // Gray Scale (용도별)
  text: {
    primary: '#202020',
    secondary: '#3E4145',
    tertiary: '#5A5F68'
  },

  icon: {
    gray: '#A7AEBB'
  },

  button: '#D7DBE4',

  line: '#E9EDF4',

  background: {
    main: '#F7F8FB',
    white: '#FFFFFF'
  },

  // 직접 참조용
  white: '#FFFFFF',
  black: '#202020'

} as const;

export const typography = {
  // hrr/Header 1
  header1: {
    fontSize: 24,
    fontWeight: '600' as const,
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.3
  },
  // hrr/Header 2
  header2: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.3
  },
  // hrr/Header 3
  header3: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.3
  },
  // hrr/Header 4
  header4: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.3
  },
  // hrr/Md size
  md: {
    fontSize: 16,
    fontWeight: '500' as const,
    fontFamily: 'Pretendard-Medium',
    letterSpacing: -0.3
  },
  // hrr/Sm size (Md)
  smMd: {
    fontSize: 15,
    fontWeight: '500' as const,
    fontFamily: 'Pretendard-Medium',
    letterSpacing: -0.3
  },
  // hrr/Sm size (Reg)
  smReg: {
    fontSize: 15,
    fontWeight: '400' as const,
    fontFamily: 'Pretendard-Regular',
    letterSpacing: -0.3
  },
  // hrr/Xs size (Md)
  xsMd: {
    fontSize: 13,
    fontWeight: '500' as const,
    fontFamily: 'Pretendard-Medium',
    letterSpacing: -0.3
  },
  // hrr/Xs size (Reg)
  xsReg: {
    fontSize: 13,
    fontWeight: '400' as const,
    fontFamily: 'Pretendard-Regular',
    letterSpacing: -0.3
  },
  // hrr/Xxs size
  xxs: {
    fontSize: 12,
    fontWeight: '400' as const,
    fontFamily: 'Pretendard-Regular',
    letterSpacing: -0.3
  },
  // hrr/caption
  caption: {
    fontSize: 10,
    fontWeight: '400' as const,
    fontFamily: 'Pretendard-Regular',
    letterSpacing: -0.3
  }
} as const;
