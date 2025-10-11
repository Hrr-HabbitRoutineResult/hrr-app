import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TouchableOpacityProps,
} from 'react-native';
import { Text } from './Text';
import { colors } from '../../design/tokens';

// 버튼 variant 타입
type ButtonVariant = 'black' | 'primary' | 'white';

// 버튼 사이즈 타입
type ButtonSize = 'small' | 'medium';

interface ButtonProps extends TouchableOpacityProps {
    variant?: ButtonVariant;        // 버튼 스타일 종류
    size?: ButtonSize;              // 버튼 크기
    disabled?: boolean;             // 비활성화 여부
    onPress: () => void;            // 클릭 이벤트
    children: string;               // 버튼 텍스트
}

// 공통 Button 컴포넌트
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    disabled = false,
    onPress,
    children,
    style,
    ...rest
}) => {
    // variant에 따른 스타일 결정
    const getVariantStyle = (): ViewStyle => {
        // 버튼이 비활성화 상태일 경우 gray 스타일 적용
        if (disabled) {
            return {
                backgroundColor: colors.line,
            };
        }

        switch (variant) {
            case 'black':
                return {
                    backgroundColor: colors.black
                };
            case 'primary':
                return {
                    backgroundColor: colors.primary.main
                };
            case 'white':
                return {
                    backgroundColor: colors.background.white,
                    borderWidth: 1.5,
                    borderColor: colors.line,
                };
            default:
                return {
                    backgroundColor: colors.primary.main
                };
        }
    };

    // variant에 따른 텍스트 색상 결정
    const getTextColor = (): string => {
        // 버튼이 비활성화 상태일 경우
        if (disabled) {
            return colors.icon.gray;
        }

        switch (variant) {
            case 'black':
                return colors.white;
            case 'primary':
                return colors.white;
            case 'white':
                return colors.text.tertiary;
            default:
                return colors.white;
        }
    };

    // size에 따른 width 결정 (medium: 350px, small: 170px)
    const getWidth = (): number => {
        return size === 'medium' ? 350 : 170;
    };

    // 렌더링
    return (
        <TouchableOpacity
            style={[
                styles.button,         // 기본 스타일 적용 (높이, borderRadius 등)
                getVariantStyle(),     // variant에 따른 버튼 색상
                { width: getWidth() }, // 사이즈에 따른 width
                style,                 // 사용자가 입력한 스타일 (우선 적용)
            ]}
            onPress={onPress}
            disabled={disabled}        // true면 버튼 비활성화
            activeOpacity={0.9}        // 터치 시 투명도
            {...rest}                  // 나머지 Props 전달
        >
            <Text variant="md" color={getTextColor()}>
                {children}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 48,               // 고정 높이
        borderRadius: 10,         // 모서리
        paddingVertical: 14,      // 위아래 여백
        // paddingHorizontal: 10,    // 좌우 여백
        justifyContent: 'center', // 세로 중앙 정렬
        alignItems: 'center',     // 가로 중앙 정렬
    },
});