import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../common/BottomSheet';
import { Text } from '../common/Text';
import { colors, typography, spacing, radius } from '../../design/tokens';

interface BlockUserBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username?: string;
}

export const BlockUserBottomSheet: React.FC<BlockUserBottomSheetProps> = ({
  visible,
  onClose,
  onConfirm,
  username = '사용자',
}) => {
  const renderFooter = () => (
    <>
      <View style={styles.buttonDivider} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.blockButton} onPress={onConfirm} activeOpacity={0.8}>
          <Text variant="smMd" color={colors.white}>
            차단하기
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} height={420} footer={renderFooter()}>
      <View style={styles.header}>
        <Text variant="header4" color={colors.text.tertiary}>
          차단
        </Text>
      </View>
      <View style={styles.headerDivider} />

      <View style={styles.body}>
        <Text variant="header3" color={colors.text.primary} style={styles.bodyTitle}>
          {`'${username}'님을 차단하시겠어요?`}
        </Text>
        <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
          차단하면 차단한 사용자가 보내는 채팅을 받을 수 없습니다.
        </Text>
        <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
          또한, 차단된 사용자는 회원님의 프로필 확인이 불가하며 회원님이 개설한 챌린지에 참여할 수 없습니다.
        </Text>
        <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
          상대방은 회원님이 차단한 사실을 알 수 없습니다.
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
  blockButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.text.primary, // Black color
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
