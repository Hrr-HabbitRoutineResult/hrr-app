import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../common/BottomSheet';
import { Text } from '../common/Text';
import { colors, typography, spacing, radius } from '../../design/tokens';

interface UnblockUserBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username?: string;
}

export const UnblockUserBottomSheet: React.FC<UnblockUserBottomSheetProps> = ({
  visible,
  onClose,
  onConfirm,
  username = '사용자',
}) => {
  const renderFooter = () => (
    <>
      <View style={styles.buttonDivider} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.unblockButton} onPress={onConfirm} activeOpacity={0.8}>
          <Text variant="smMd" color={colors.white}>
            차단 해제하기
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} height={420} footer={renderFooter()}>
      <View style={styles.header}>
        <Text variant="header4" color={colors.text.tertiary}>
          차단 해제
        </Text>
      </View>
      <View style={styles.headerDivider} />

      <View style={styles.body}>
        <Text variant="header3" color={colors.text.primary} style={styles.bodyTitle}>
          {`'${username}'님의 차단을 해제하시겠어요?`}
        </Text>
        <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
          차단을 해제할 경우 차단되었던 사용자가 회원님에게 팔로우 요청 및 채팅을 보낼 수 있습니다.
        </Text>
        <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
          또한, 회원님이 개설한 챌린지에 참여할 수 있습니다.
        </Text>
        <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
          상대방에게 회원님이 차단 해제한 사실을 알리지 않습니다.
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
    paddingHorizontal: 0,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  bodyTitle: {
    marginBottom: spacing.md,
    textAlign: 'left',
  },
  bodyDescription: {
    lineHeight: typography.smReg.lineHeight,
    textAlign: 'left',
    marginBottom: spacing.sm,
  },
  buttonDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  unblockButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.text.primary, // Black color
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
