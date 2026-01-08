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
          계정은 즉시 비활성화되며, {'\n'}30일 동안 로그인하지 않으면 모든 정보가 완전히 삭제돼요.{'\n'}
        </Text>
        <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
                  30일 이내 다시 로그인하면
                  {'\n'}
                  계정과 기록을 그대로 복구할 수 있어요.
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
