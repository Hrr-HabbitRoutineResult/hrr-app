import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../common/BottomSheet';
import { Text } from '../common/Text';
import { colors, typography, spacing, radius } from '../../design/tokens';

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
  const renderFooter = () => (
    <>
      <View style={styles.buttonDivider} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text variant="smMd" color={colors.white}>
            돌아가기
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={onConfirm}
          activeOpacity={0.8}
        >
          <Text variant="smMd" color={colors.text.primary}>
            탈퇴
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} height={420} footer={renderFooter()}>
      <View style={styles.header}>
        <Text variant="header4" color={colors.text.tertiary}>
          회원 탈퇴
        </Text>
      </View>
      <View style={styles.headerDivider} />

      <View style={styles.body}>
        <Text variant="header3" color={colors.text.primary} style={styles.bodyTitle}>
          회원 탈퇴를 하시겠어요?
        </Text>
        <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
          회원 탈퇴 시 챌린지 현황을 비롯한 모든 정보와 계정이 삭제되며 한 번 삭제된 계정은 되돌릴 수 없습니다.{'\n'}
        </Text>
        <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
                  회원 탈퇴 후 재가입은 1개월이 지나야 가능합니다.{'\n'}
                  그래도 탈퇴를 진행하시겠어요?
                </Text>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  body: {
    paddingHorizontal: 0, // Removed horizontal padding
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  bodyTitle: {
    marginBottom: spacing.md,
    textAlign: 'left', // Added for left alignment
  },
  bodyDescription: {
    lineHeight: typography.smReg.lineHeight,
    textAlign: 'left', // Added for left alignment
  },
  buttonDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.text.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.white, // White background
    borderRadius: radius.md,
    borderWidth: 1, // Keep border for distinction, if not, change to 0
    borderColor: colors.line, // Changed border color for white button
    justifyContent: 'center',
    alignItems: 'center',
  },
});
