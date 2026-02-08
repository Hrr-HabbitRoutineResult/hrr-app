import React from 'react';
import { View, StyleSheet } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Text } from '../common/Text';
import { colors, typography } from '../../design/tokens';

interface WithdrawBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const WithdrawBottomSheet: React.FC<WithdrawBottomSheetProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onClose} height={440}>
      <View style={styles.content}>
        <Text variant="header4" color={colors.text.tertiary} style={styles.title}>
          회원 탈퇴
        </Text>
        <View style={styles.divider} />

        <View style={styles.body}>
          <Text variant="header3" color={colors.text.primary} style={styles.bodyTitle}>
            회원 탈퇴를 하시겠어요?
          </Text>
          <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
            계정은 즉시 비활성화되며, {'\n'}30일 동안 로그인하지 않으면 모든 정보가 완전히 삭제돼요.
          </Text>
          <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
            30일 이내 다시 로그인하면{'\n'}계정과 기록을 그대로 복구할 수 있어요.
          </Text>
        </View>

        <View style={styles.footerDivider} />
        <View style={styles.footer}>
          <Button variant="black" onPress={onClose} style={styles.button}>
            돌아가기
          </Button>
          <Button variant="white" onPress={onConfirm} style={styles.button}>
            탈퇴
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginHorizontal: scale(-20),
    marginTop: verticalScale(-16),
  },
  title: {
    textAlign: 'center',
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(16),
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: scale(20),
  },
  body: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  bodyTitle: {
    ...typography.header3,
    marginBottom: verticalScale(12),
    textAlign: 'left',
  },
  bodyDescription: {
    ...typography.smReg,
    textAlign: 'left',
    marginBottom: verticalScale(12),
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(12),
    gap: scale(8),
  },
  button: {
    flex: 1,
  },
});
