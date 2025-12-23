import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BottomSheet } from '../common/BottomSheet';
import { Text } from '../common/Text';
import { Button } from '../common/Button';
import { colors } from '../../design/tokens';

interface TimePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  initialTime?: { period: 'AM' | 'PM'; hour: string; minute: string };
  onConfirm: (time: { period: 'AM' | 'PM'; hour: string; minute: string }) => void;
}

export const TimePickerSheet: React.FC<TimePickerSheetProps> = ({
  visible,
  onClose,
  title,
  initialTime = { period: 'AM', hour: '12', minute: '00' },
  onConfirm,
}) => {
  // 초기 Date 객체 생성
  const getInitialDate = () => {
    const hour = parseInt(initialTime.hour);
    const minute = parseInt(initialTime.minute);
    const adjustedHour = initialTime.period === 'PM' && hour !== 12 
      ? hour + 12 
      : initialTime.period === 'AM' && hour === 12 
      ? 0 
      : hour;
    
    const date = new Date();
    date.setHours(adjustedHour, minute, 0, 0);
    return date;
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());

  const handleConfirm = () => {
    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    
    const period: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    onConfirm({
      period,
      hour: String(hour12).padStart(2, '0'),
      minute: String(minutes).padStart(2, '0'),
    });
    onClose();
  };

  const onChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="header4" color={colors.text.primary} style={styles.title}>
        {title}
      </Text>

      <View style={styles.pickerContainer}>
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="spinner"
            onChange={onChange}
            style={styles.picker}
            textColor={colors.text.primary}
          />
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="spinner"
            onChange={onChange}
          />
        )}
      </View>

      <Button variant="black" size="medium" onPress={handleConfirm} style={styles.button}>
        확인
      </Button>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: verticalScale(24),
  },
  pickerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  picker: {
    width: '100%',
    height: verticalScale(200),
  },
  button: {
    marginTop: verticalScale(20),
  },
});

