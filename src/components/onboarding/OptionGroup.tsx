import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { Text } from '../common/Text';
import { colors } from '../../design/tokens';

// 개별 옵션 버튼 컴포넌트 Props
interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

// 개별 옵션 버튼 컴포넌트
export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSelected ? styles.selectedButton : styles.unselectedButton,
      ]}
      onPress={onPress}
    >
      <Text
        variant={isSelected ? 'smMd' : 'smReg'}
        color={isSelected ? colors.white : colors.text.tertiary}
        style={styles.buttonText}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// 옵션 아이템 타입
export interface OptionItem {
  id: string;
  label: string;
}

// 옵션 그룹 컴포넌트 Props
interface OptionGroupProps {
  title: string;
  options: OptionItem[] | string[];
  selectedOptions: string[];
  onOptionSelect: (id: string) => void;
  multiSelect?: boolean; // 다중 선택 가능 여부 (기본값: false, 단일 선택)
}

// 옵션 그룹 컴포넌트
export const OptionGroup: React.FC<OptionGroupProps> = ({
  title,
  options,
  selectedOptions,
  onOptionSelect,
  multiSelect = false,
}) => {
  const normalizedOptions: OptionItem[] = options.map((option) => {
    if (typeof option === 'string') {
      return { id: option, label: option };
    }
    return option;
  });

  const handleOptionPress = (id: string) => {
    if (multiSelect) {
      // 다중 선택 토글
      onOptionSelect(id);
    } else {
      // 단일 선택 토글
      onOptionSelect(id);
    }
  };

  return (
    <View style={styles.group}>
      <Text variant="xsReg" color={colors.text.tertiary} style={styles.title}>
        {title}
      </Text>
      <View style={styles.optionsContainer}>
        {normalizedOptions.map((option) => (
          <OptionButton
            key={option.id}
            label={option.label}
            isSelected={selectedOptions.includes(option.id)}
            onPress={() => handleOptionPress(option.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginBottom: verticalScale(32),
  },
  title: {
    marginBottom: verticalScale(12),
    lineHeight: verticalScale(24),
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  button: {
    width: scale(110),
    height: verticalScale(38),
    borderRadius: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
    selectedButton: {
    backgroundColor: colors.text.primary,
    borderWidth: 0,
  },
  unselectedButton: {
    backgroundColor: colors.white,
    borderWidth: scale(1.5),
    borderColor: colors.line,
  },
  buttonText: {
    lineHeight: verticalScale(20),
  },
});

