import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
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

// 정수 값으로 높이 설정 (소수점 방지)
const ITEM_HEIGHT = Math.round(verticalScale(44));
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const HIGHLIGHT_HEIGHT = Math.round(verticalScale(48));

const PERIODS = ['AM', 'PM'];
const HOURS = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
const MINUTES = ['00', '10', '20', '30', '40', '50'];

export const TimePickerSheet: React.FC<TimePickerSheetProps> = ({
  visible,
  onClose,
  title,
  initialTime = { period: 'AM', hour: '12', minute: '00' },
  onConfirm,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(initialTime.period);
  const [selectedHour, setSelectedHour] = useState(initialTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);

  const periodRef = useRef<ScrollView>(null);
  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);

  // 초기 위치 설정 (마운트 시 한 번만)
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        const periodIndex = PERIODS.indexOf(initialTime.period);
        const hourIndex = HOURS.indexOf(initialTime.hour);
        const minuteIndex = MINUTES.indexOf(initialTime.minute);

        if (periodIndex !== -1) periodRef.current?.scrollTo({ y: periodIndex * ITEM_HEIGHT, animated: false });
        if (hourIndex !== -1) hourRef.current?.scrollTo({ y: hourIndex * ITEM_HEIGHT, animated: false });
        if (minuteIndex !== -1) minuteRef.current?.scrollTo({ y: minuteIndex * ITEM_HEIGHT, animated: false });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // 스크롤이 끝났을 때 현재 중앙에 위치한 값 선택
  const handleScroll = (type: 'period' | 'hour' | 'minute') => (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);

    if (type === 'period') {
      const clampedIndex = Math.max(0, Math.min(index, PERIODS.length - 1));
      setSelectedPeriod(PERIODS[clampedIndex] as 'AM' | 'PM');
    } else if (type === 'hour') {
      const clampedIndex = Math.max(0, Math.min(index, HOURS.length - 1));
      setSelectedHour(HOURS[clampedIndex]);
    } else {
      const clampedIndex = Math.max(0, Math.min(index, MINUTES.length - 1));
      setSelectedMinute(MINUTES[clampedIndex]);
    }
  };

  // 커스텀 휠 피커의 한 열(Column)을 렌더링하는 함수
  const renderPicker = (
    data: string[],
    ref: React.RefObject<ScrollView | null>,
    selectedValue: string,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  ) => (
    <View style={styles.pickerColumn}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onScroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        bounces={true}
        overScrollMode="never"
        removeClippedSubviews={false}
        disableIntervalMomentum={true}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.pickerItem}>
            <Text
              variant="smReg"
              color={item === selectedValue ? colors.text.primary : colors.icon.gray}
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const handleConfirm = () => {
    onConfirm({
      period: selectedPeriod,
      hour: selectedHour,
      minute: selectedMinute,
    });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={360} scrollEnabled={false}>
      <Text variant="header4" color={colors.text.primary} style={styles.title}>
        {title}
      </Text>

      <View style={styles.pickerWrapper}>
        <View style={styles.pickerContainer}>
          <View style={styles.selectedOverlay} pointerEvents="none" />
          {renderPicker(PERIODS, periodRef, selectedPeriod, handleScroll('period'))}
          {renderPicker(HOURS, hourRef, selectedHour, handleScroll('hour'))}
          {renderPicker(MINUTES, minuteRef, selectedMinute, handleScroll('minute'))}
        </View>
      </View>

      <Button variant="black" size="medium" onPress={handleConfirm} style={styles.button}>
        확인
      </Button>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: verticalScale(20),
  },
  pickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
    width: '100%',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: CONTAINER_HEIGHT,
    position: 'relative',
    width: '100%',
  },
  pickerColumn: {
    width: scale(70),
    height: CONTAINER_HEIGHT,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: ITEM_HEIGHT,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOverlay: {
    position: 'absolute',
    top: (CONTAINER_HEIGHT - HIGHLIGHT_HEIGHT) / 2,
    left: 0,
    right: 0,
    height: HIGHLIGHT_HEIGHT,
    backgroundColor: colors.background,
    borderRadius: scale(16),
  },
  button: {
    marginTop: verticalScale(20),
  },
});

