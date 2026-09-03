import React from 'react';
import { View, StyleSheet } from 'react-native';
import { verticalScale } from '../../utils/scaling';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Text } from '../common/Text';
import { colors } from '../../design/tokens';

interface RoundEndBottomSheetProps {
  visible: boolean;
  /** 현재 라운드 종료까지 남은 일수 (챌린지 상세의 remainDays) */
  remainDays: number;
  isSubmitting?: boolean;
  onClose: () => void;
  /** 이번 라운드로 종료하기 */
  onStop: () => void;
  /** 다음 라운드 연장하기 */
  onContinue: () => void;
}

export const RoundEndBottomSheet: React.FC<RoundEndBottomSheetProps> = ({
  visible,
  remainDays,
  isSubmitting = false,
  onClose,
  onStop,
  onContinue,
}) => {
  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      height={340}
      scrollEnabled={false}
      animationType="slide"
    >
      <View style={styles.content}>
        <Text
          variant="smMd"
          color={colors.text.primary}
          style={styles.sheetTitle}
        >
          라운드 종료
        </Text>

        <Text
          variant="header4"
          color={colors.text.primary}
          style={styles.headline}
        >
          현재 라운드 종료까지 {remainDays}일 남았어요
        </Text>

        <Text
          variant="smReg"
          color={colors.text.tertiary}
          style={styles.description}
        >
          {
            '자기계발 활동 흐름이 끊기지 않도록\n다음 라운드를 미리 준비해보아요!'
          }
        </Text>

        <Text
          variant="xsReg"
          color={colors.primary.main}
          style={styles.caution}
        >
          선택하지 않을 시 이번 라운드를 끝으로 자동 종료돼요
        </Text>

        <View style={styles.buttons}>
          <Button
            variant="white"
            size="medium"
            onPress={onStop}
            disabled={isSubmitting}
            textVariant="smMd"
            style={styles.button}
          >
            이번 라운드로 종료하기
          </Button>
          <Button
            variant="primary"
            size="medium"
            onPress={onContinue}
            disabled={isSubmitting}
            textVariant="smMd"
            style={styles.button}
          >
            다음 라운드 연장하기
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  sheetTitle: {
    textAlign: 'center',
  },
  headline: {
    marginTop: verticalScale(24),
  },
  description: {
    marginTop: verticalScale(8),
  },
  caution: {
    marginTop: verticalScale(16),
    // 본문이 길어져도 버튼과 최소 간격을 유지한다.
    marginBottom: verticalScale(16),
  },
  buttons: {
    marginTop: 'auto',
    gap: verticalScale(8),
  },
  button: {
    width: '100%',
  },
});
