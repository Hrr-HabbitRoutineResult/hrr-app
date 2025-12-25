import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TouchableOpacityProps,
} from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { Text } from './Text';
import { colors } from '../../design/tokens';

// 버튼 variant 타입
type ButtonVariant = 'black' | 'primary' | 'white' | 'gray';

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
                    backgroundColor: colors.text.primary
                };
            case 'primary':
                return {
                    backgroundColor: colors.primary.main
                };
            case 'white':
                return {
                    backgroundColor: colors.white,
                    borderWidth: 1.5,
                    borderColor: colors.line,
                };
            case 'gray':
                return {
                    backgroundColor: colors.line,
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
            case 'gray':
                return colors.icon.gray;
            default:
                return colors.white;
        }
    };

    // size에 따른 maxWidth 결정 (medium: 350px, small: 170px)
    const getMaxWidth = (): number => {
        return size === 'medium' ? scale(350) : scale(170);
    };

    // 렌더링
    return (
        <TouchableOpacity
            style={[
                styles.button,         // 기본 스타일 적용 (높이, borderRadius 등)
                getVariantStyle(),     // variant에 따른 버튼 색상
                { maxWidth: getMaxWidth() }, // 사이즈에 따른 maxWidth
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
        width: '100%',            // 기본적으로 부모 컨테이너 너비를 따름
        height: verticalScale(48),               // 고정 높이
        borderRadius: scale(10),         // 모서리
        paddingVertical: verticalScale(14),      // 위아래 여백
        // paddingHorizontal: scale(10),    // 좌우 여백
        justifyContent: 'center', // 세로 중앙 정렬
        alignItems: 'center',     // 가로 중앙 정렬
    },
});