import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { BottomSheet } from '../common/BottomSheet';
import { Text } from '../common/Text';
import { colors } from '../../design/tokens';
import PhotoSelectedIcon from '../../../assets/icons/challenge-create/photo-selected.svg';
import PhotoUnselectedIcon from '../../../assets/icons/challenge-create/photo-unselected.svg';
import TextSelectedIcon from '../../../assets/icons/challenge-create/text-selected.svg';
import TextUnselectedIcon from '../../../assets/icons/challenge-create/text-unselected.svg';

interface VerificationMethodSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedMethod: 'photo' | 'text' | '';
  onSelect: (method: 'photo' | 'text') => void;
}

const methods = [
  {
    id: 'photo' as const,
    title: '사진 인증',
    description: '타임스탬프 카메라 기능으로 쉽고 빠르게 인증해요',
    SelectedIcon: PhotoSelectedIcon,
    UnselectedIcon: PhotoUnselectedIcon,
  },
  {
    id: 'text' as const,
    title: '글 인증',
    description: '간단한 글 작성과 블로그 등 외부 링크 연결로 인증해요',
    SelectedIcon: TextSelectedIcon,
    UnselectedIcon: TextUnselectedIcon,
  },
];

export const VerificationMethodSheet: React.FC<VerificationMethodSheetProps> = ({
  visible,
  onClose,
  selectedMethod,
  onSelect,
}) => {
  const handleSelect = (methodId: 'photo' | 'text') => {
    onSelect(methodId);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={360}>
      <Text variant="header4" color={colors.text.primary} style={styles.title}>
        인증 수단을 선택해 주세요
      </Text>

      <View style={styles.methodList}>
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                isSelected && styles.methodCardSelected,
              ]}
              onPress={() => handleSelect(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {isSelected ? (
                  <method.SelectedIcon width={24} height={24} />
                ) : (
                  <method.UnselectedIcon width={24} height={24} />
                )}
              </View>
              <View style={styles.methodTextContainer}>
                <Text variant="smMd" color={colors.text.secondary} style={styles.methodTitle}>
                  {method.title}
                </Text>
                <Text variant="xxs" color={colors.text.tertiary} style={styles.methodDescription}>
                  {method.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: verticalScale(24),
  },
  methodList: {
    gap: verticalScale(10),
  },
  methodCard: {
    width: '100%',
    height: verticalScale(80),
    borderRadius: scale(20),
    borderWidth: scale(1.5),
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodCardSelected: {
    borderColor: colors.primary.main,
  },
  iconContainer: {
    width: scale(24),
    height: verticalScale(24),
    marginRight: scale(12),
  },
  methodTextContainer: {
    flex: 1,
  },
  methodTitle: {
    marginBottom: verticalScale(4),
    lineHeight: verticalScale(20),
  },
  methodDescription: {
    lineHeight: verticalScale(18),
  },
});
