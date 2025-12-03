import React, { useState } from 'react';
import {
    TextInput,
    View,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TouchableOpacity,
} from 'react-native';
import { Text } from './Text';
import { colors, typography } from '../../design/tokens';

// TextField variant 타입
type TextFieldVariant = 'default' | 'white';

interface TextFieldProps extends TextInputProps {
    variant?: TextFieldVariant;    // 인풋 스타일 종류
    error?: string;                // 에러 메시지
    message?: string;              // 일반 안내 메시지
    disabled?: boolean;            // 비활성화 여부
    leftIcon?: React.ReactNode;    // 왼쪽 아이콘
    rightIcon?: React.ReactNode;   // 오른쪽 아이콘
    onLeftIconPress?: () => void;  // 왼쪽 아이콘 클릭 이벤트
    onRightIconPress?: () => void; // 오른쪽 아이콘 클릭 이벤트
    containerStyle?: ViewStyle;    // 컨테이너 스타일
    inputContainerStyle?: ViewStyle; // 입력 필드 박스 스타일 오버라이드 (높이, 패딩 등 커스터마이징 가능)
}

// 공통 TextField 컴포넌트
export const TextField: React.FC<TextFieldProps> = ({
    variant = 'default',
    error,
    message,
    disabled = false,
    leftIcon,
    rightIcon,
    onLeftIconPress,
    onRightIconPress,
    containerStyle,
    inputContainerStyle,
    style,
    ...rest
}) => {
    // 포커스 상태 관리 (테두리 색상 변경용)
    const [isFocused, setIsFocused] = useState(false);

    // variant에 따른 배경색 결정
    const getBackgroundColor = (): string => {
        if (variant === 'default') {
            return colors.background; // 회색 배경
        }
        return colors.white; // 흰색 배경
    };

    // variant에 따른 테두리 색상 결정
    const getBorderColor = (): string => {
        if (variant === 'default') {
            return 'transparent'; // 기본은 테두리 없음
        }

        // white variant
        if (isFocused) {
            return colors.primary.sub; // 입력 중일 때 테두리 색상 변경 (임의)
        }
        return colors.line; // 기본은 회색 테두리
    };

    // variant에 따른 placeholder 색상 결정
    const getPlaceholderColor = (): string => {
        if (variant === 'default') {
            return colors.icon.gray;
        }
        return colors.text.tertiary;
    };

    // 아이콘 렌더링 함수 (클릭 가능/불가능 구분)
    const renderIcon = (icon: React.ReactNode, onPress?: () => void) => {
        if (onPress) {
            return (
                <TouchableOpacity
                    onPress={onPress}
                    style={styles.iconContainer}
                >
                    {icon}
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.iconContainer}>
                {icon}
            </View>
        );
    };

    // 렌더링
    return (
        <View style={containerStyle}>
            {/* Input Container */}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: disabled
                            ? colors.background
                            : getBackgroundColor(),
                        borderColor: getBorderColor(),
                        borderWidth: variant === 'white' ? 1 : 0, // white variant에서만 테두리 표시
                    },
                    inputContainerStyle,
                ]}
            >
                {/* 왼쪽 아이콘 */}
                {leftIcon && renderIcon(leftIcon, onLeftIconPress)}

                {/* TextInput */}
                <TextInput
                    style={[styles.input, typography.smMd, style]}
                    placeholderTextColor={getPlaceholderColor()}
                    editable={!disabled}                        // 비활성화 상태에 따른 편집 가능 여부
                    onFocus={() => setIsFocused(true)}          // 포커스 시 테두리 색상 변경
                    onBlur={() => setIsFocused(false)}          // 포커스 해제 시 테두리 색상 복원
                    {...rest}                                  // 나머지 TextInput props 전달
                />

                {/* 오른쪽 아이콘 */}
                {rightIcon && renderIcon(rightIcon, onRightIconPress)}
            </View>

            {/* 에러/일반 메시지 영역 (항상 일정 높이만큼 공간 차지) */}
            <View style={styles.messageContainer}>
                {error && (
                    <Text
                        variant="xsReg"
                        color={colors.primary.sub}
                        style={styles.messageText}
                    >
                        {error}
                    </Text>
                )}

                {message && !error && (
                    <Text
                        variant="xsReg"
                        color={colors.text.tertiary}
                        style={styles.messageText}
                    >
                        {message}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        height: 44,               // 고정 높이
        borderRadius: 10,         // 모서리 둥글게
        flexDirection: 'row',     // 요소 가로 배치
        alignItems: 'center',     // 세로 중앙 정렬
        paddingHorizontal: 10,    // 좌우 여백
    },
    iconContainer: {
        marginRight: 8,           // 아이콘 오른쪽 여백 (TextInput과의 간격)
    },
    input: {
        flex: 1,                 // 남은 공간 차지하기
        color: colors.text.primary, // 입력된 텍스트 색상
        padding: 0,               // 기본 padding 제거 (Android 대응)
    },
    messageContainer: {
        minHeight: 26,            // 공간 확보
        justifyContent: 'flex-start',
    },
    messageText: {
        marginTop: 8,             // 메시지 위 여백
        marginLeft: 13,           // 메시지 왼쪽 여백
    },
});