import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { typography, colors } from '../../design/tokens';

// typography 객체의 키들만 타입으로 추출
export type TypographyVariant = keyof typeof typography;

// Text 컴포넌트가 받을 Props 정의
interface TextProps extends RNTextProps {
    variant?: TypographyVariant;        // 텍스트 스타일 지정
    color?: string;                     // 텍스트 색상 지정
    children: React.ReactNode;          // 텍스트 내용
}

// 공통 Text 컴포넌트
export const Text: React.FC<TextProps> = ({
    variant = 'smMd',                 // 기본 타이포그래피: Sm size (Md)
    color = colors.text.primary,      // 기본 색상: primary
    style,                            // 추가 스타일
    children,                         // 텍스트 내용
    ...rest                           // 나머지 Props
}) => {
    // 렌더링
    return (
        <RNText
            style={[
                {
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                },
                typography[variant],  // 선택한 variant의 타이포그래피 스타일 적용
                { color },            // 색상 적용
                style,                // 추가로 전달받은 스타일 적용
            ]}
            {...rest}                 // 나머지 Props 그대로 전달
        >
            {children}
        </RNText>
    );
};