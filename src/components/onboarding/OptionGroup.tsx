import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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

// 옵션 그룹 컴포넌트 Props
interface OptionGroupProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onOptionSelect: (option: string) => void;
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
  const handleOptionPress = (option: string) => {
    if (multiSelect) {
      // 다중 선택
      if (selectedOptions.includes(option)) {
        onOptionSelect(option); // 이미 선택된 경우 선택 해제
      } else {
        onOptionSelect(option); // 선택되지 않은 경우 선택 추가
      }
    } else {
      // 단일 선택
      if (selectedOptions.includes(option)) {
        onOptionSelect(option);
      } else {
        onOptionSelect(option);
      }
    }
  };

  return (
    <View style={styles.group}>
      <Text variant="xsReg" color={colors.text.tertiary} style={styles.title}>
        {title}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <OptionButton
            key={index}
            label={option}
            isSelected={selectedOptions.includes(option)}
            onPress={() => handleOptionPress(option)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 10,
    lineHeight: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    width: 110,
    height: 38,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
    selectedButton: {
    backgroundColor: colors.text.primary,
    borderWidth: 0,
  },
  unselectedButton: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  buttonText: {
    lineHeight: 20,
  },
});

