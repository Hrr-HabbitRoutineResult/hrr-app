import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../common/BottomSheet';
import { Text } from '../common/Text';
import { colors } from '../../design/tokens';
import CheckedIcon from '../../../assets/icons/checkbox-checked.svg';
import UncheckedIcon from '../../../assets/icons/checkbox-unchecked.svg';

interface VerificationDaysSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedDays: string[];
  onConfirm: (days: string[]) => void;
}

const DAYS = [
  { id: 'SUNDAY', label: '일' },
  { id: 'MONDAY', label: '월' },
  { id: 'TUESDAY', label: '화' },
  { id: 'WEDNESDAY', label: '수' },
  { id: 'THURSDAY', label: '목' },
  { id: 'FRIDAY', label: '금' },
  { id: 'SATURDAY', label: '토' },
];

export const VerificationDaysSheet: React.FC<VerificationDaysSheetProps> = ({
  visible,
  onClose,
  selectedDays,
  onConfirm,
}) => {
  const [tempSelectedDays, setTempSelectedDays] = useState<string[]>(selectedDays);

  useEffect(() => {
    if (visible) {
      setTempSelectedDays(selectedDays);
    }
  }, [visible, selectedDays]);

  const toggleDay = (dayId: string) => {
    const newDays = tempSelectedDays.includes(dayId)
      ? tempSelectedDays.filter(d => d !== dayId)
      : [...tempSelectedDays, dayId];
    setTempSelectedDays(newDays);
    onConfirm(newDays);
  };

  const toggleAll = () => {
    const newDays = tempSelectedDays.length === DAYS.length ? [] : DAYS.map(d => d.id);
    setTempSelectedDays(newDays);
    onConfirm(newDays);
  };

  const isAllSelected = tempSelectedDays.length === DAYS.length;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="header4" color={colors.text.primary} style={styles.title}>
        인증 요일을 선택해 주세요
      </Text>

      <View style={styles.daysContainer}>
        {DAYS.map((day) => {
          const isSelected = tempSelectedDays.includes(day.id);
          return (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
              ]}
              onPress={() => toggleDay(day.id)}
              activeOpacity={0.7}
            >
              <Text
                variant="smMd"
                color={isSelected ? colors.primary.main : colors.text.tertiary}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.selectAllContainer}
        onPress={toggleAll}
        activeOpacity={0.7}
      >
        {isAllSelected ? (
          <CheckedIcon width={20} height={20} />
        ) : (
          <UncheckedIcon width={20} height={20} />
        )}
        <Text variant="smReg" color={colors.text.tertiary} style={styles.selectAllText}>
          전체 선택
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 24,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dayButton: {
    width: 44,
    height: 60,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.white,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 20,
    gap: 6,
  },
  selectAllText: {
    lineHeight: 20,
  },
});
