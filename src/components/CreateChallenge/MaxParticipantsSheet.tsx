import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { BottomSheet } from '../common/BottomSheet';
import { Text } from '../common/Text';
import { Button } from '../common/Button';
import { colors } from '../../design/tokens';

interface MaxParticipantsSheetProps {
  visible: boolean;
  onClose: () => void;
  initialValue?: number;
  onConfirm: (count: number) => void;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// 1명부터 30명까지
const participants = Array.from({ length: 30 }, (_, i) => i + 1);

export const MaxParticipantsSheet: React.FC<MaxParticipantsSheetProps> = ({
  visible,
  onClose,
  initialValue = 10,
  onConfirm,
}) => {
  const [selectedCount, setSelectedCount] = useState(initialValue);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      // 초기 위치로 스크롤
      setTimeout(() => {
        const index = participants.indexOf(selectedCount);
        if (index !== -1) {
          scrollRef.current?.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: false,
          });
        }
      }, 100);
    }
  }, [visible, selectedCount]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, participants.length - 1));
    setSelectedCount(participants[clampedIndex]);
  };

  const handleConfirm = () => {
    onConfirm(selectedCount);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="header4" color={colors.text.primary} style={styles.title}>
        정원을 선택해 주세요
      </Text>

      <View style={styles.pickerWrapper}>
        <View style={styles.pickerContainer}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={styles.scrollContent}
          >
            {participants.map((count, index) => (
              <View key={index} style={styles.pickerItem}>
                <Text
                  variant="header2"
                  color={count === selectedCount ? colors.text.primary : colors.line}
                  style={styles.pickerText}
                >
                  {String(count).padStart(2, '0')} / 30
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.selectedOverlay} pointerEvents="none" />
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
    marginBottom: 24,
  },
  pickerWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pickerContainer: {
    width: 150,
    height: CONTAINER_HEIGHT,
    position: 'relative',
  },
  scrollContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    textAlign: 'center',
  },
  selectedOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  button: {
    marginTop: 20,
  },
});

