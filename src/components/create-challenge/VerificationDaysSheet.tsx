import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
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
    <BottomSheet visible={visible} onClose={onClose} height={300}>
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
          <CheckedIcon width={10} height={8} />
        ) : (
          <UncheckedIcon width={10} height={8} />
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
    marginBottom: verticalScale(24),
  },
  daysContainer: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: verticalScale(24),
  },
  dayButton: {
    width: scale(44),
    height: verticalScale(60),
    borderRadius: scale(50),
    borderWidth: scale(1.5),
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
    marginBottom: verticalScale(20),
    gap: scale(6),
  },
  selectAllText: {
    lineHeight: verticalScale(20),
  },
});
