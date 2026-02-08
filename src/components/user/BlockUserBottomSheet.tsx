import React from 'react';
import { View, StyleSheet } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Text } from '../common/Text';
import { colors, typography } from '../../design/tokens';

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
  return (
    <BottomSheet visible={visible} onClose={onClose} height={440}>
      <View style={styles.content}>
        <Text variant="header4" color={colors.text.tertiary} style={styles.title}>
          차단
        </Text>
        <View style={styles.divider} />

        <View style={styles.body}>
          <Text variant="header3" color={colors.text.primary} style={styles.bodyTitle}>
            사용자를 차단하시겠어요?
          </Text>
          <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
            차단하면 차단한 사용자가 보내는 채팅을 받을 수 없습니다
          </Text>
          <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
            또한, 차단된 사용자는 회원님의 프로필 확인이 불가하며 회원님이 개설한 챌린지에 참여할 수 없습니다
          </Text>
          <Text variant="smReg" color={colors.text.tertiary} style={styles.bodyDescription}>
            상대방은 회원님이 차단한 사실을 알 수 없습니다
          </Text>
        </View>

        <View style={styles.footerDivider} />
        <View style={styles.footer}>
          <Button variant="black" onPress={onConfirm}>
            차단하기
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
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(12),
    alignItems: 'center',
  },
});
