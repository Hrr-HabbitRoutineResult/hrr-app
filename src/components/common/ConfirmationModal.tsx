import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { colors } from '../../design/tokens';
import { scale, verticalScale } from '../../utils/scaling';

interface ModalButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive';
}

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  buttons: ModalButton[];
}

export const ConfirmationModal = ({
  visible,
  onClose,
  title,
  description,
  buttons,
}: ConfirmationModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <TouchableOpacity
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
          activeOpacity={1}
        >
          <Text
            variant="header3"
            color={colors.text.primary}
            style={styles.modalTitle}
          >
            {title}
          </Text>
          {description && (
            <Text variant="xsReg" color={colors.text.tertiary} style={styles.modalDescription}>
              {description}
            </Text>
          )}
          <View style={styles.modalButtons}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalButton}
                onPress={button.onPress}
                activeOpacity={0.7}
              >
                <Text
                  variant="smMd"
                  color={button.style === 'destructive' ? '#FF473B' : colors.text.primary}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContent: {
    width: '100%',
    height: verticalScale(180),
    backgroundColor: colors.white,
    borderRadius: scale(20),
    paddingTop: verticalScale(28),
    paddingLeft: scale(24),
    justifyContent: 'space-between',
  },
  modalTitle: {
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(-24),
  },
  modalDescription: {
    lineHeight: verticalScale(18),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: scale(4),
    paddingBottom: verticalScale(12),
    paddingRight: scale(16),
  },
  modalButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    minWidth: scale(60),
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
