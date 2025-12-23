import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { colors, typography } from '../../design/tokens';

interface SortSelectorProps {
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { key: 'POPULAR', label: '인기순' },
  { key: 'LATEST', label: '최신순' },
  { key: 'OLDEST', label: '오래된순' },
];

// 정렬 선택 컴포넌트
export const SortSelector: React.FC<SortSelectorProps> = ({
  selectedSort,
  onSortChange,
}) => {
  return (
    <View style={styles.container}>
      {sortOptions.map((option) => {
        const isSelected = selectedSort === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optionButton,
              isSelected && styles.optionButtonSelected,
            ]}
            onPress={() => {
              // 같은 버튼을 다시 누르면 선택 해제 (토글)
              if (isSelected) {
                onSortChange(''); // 선택 해제
              } else {
                onSortChange(option.key);
              }
            }}
          >
            <Text
              style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: scale(8),
  },
  optionButton: {
    width: scale(110),
    height: verticalScale(38),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: scale(1.5),
    borderColor: colors.line,
    borderRadius: scale(40),
  },
  optionButtonSelected: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  optionText: {
    ...typography.smReg,
    color: colors.text.tertiary,
  },
  optionTextSelected: {
    color: colors.white,
  },
});

