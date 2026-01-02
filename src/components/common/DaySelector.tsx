import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { colors, typography } from '../../design/tokens';

interface DaySelectorProps {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
}

const days = [
  { key: 'MONDAY', label: '월' },
  { key: 'TUESDAY', label: '화' },
  { key: 'WEDNESDAY', label: '수' },
  { key: 'THURSDAY', label: '목' },
  { key: 'FRIDAY', label: '금' },
  { key: 'SATURDAY', label: '토' },
  { key: 'SUNDAY', label: '일' },
];
// 요일 선택 컴포넌트
export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onDaysChange,
}) => {
  const toggleDay = (dayKey: string) => {
    if (selectedDays.includes(dayKey)) {
      onDaysChange(selectedDays.filter(d => d !== dayKey));
    } else {
      onDaysChange([...selectedDays, dayKey]);
    }
  };

  return (
    <View style={styles.container}>
      {days.map((day) => {
        const isSelected = selectedDays.includes(day.key);
        return (
          <TouchableOpacity
            key={day.key}
            style={[
              styles.dayButton,
              isSelected && styles.dayButtonSelected,
            ]}
            onPress={() => toggleDay(day.key)}
          >
            <Text
              style={[
                styles.dayText,
                isSelected && styles.dayTextSelected,
              ]}
            >
              {day.label}
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
  dayButton: {
    width: scale(44),
    height: verticalScale(60),
    borderRadius: scale(30),
    backgroundColor: colors.white,
    borderWidth: scale(1.5),
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  dayText: {
    ...typography.smReg,
    color: colors.text.tertiary,
  },
  dayTextSelected: {
    color: colors.white,
  },
});

