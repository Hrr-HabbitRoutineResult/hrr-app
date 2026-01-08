import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { colors, radius, spacing } from '../../design/tokens';

interface ModalButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive';
}

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
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
          <View style={styles.contentWrapper}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalButton}
                  onPress={button.onPress}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, button.style === 'destructive' && styles.destructiveButtonText]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    paddingHorizontal: spacing.xxxl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
  },
  contentWrapper: {
    paddingVertical: spacing.xl, // Increased vertical padding by one step
    paddingHorizontal: spacing.md,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'left',
    marginBottom: spacing.xxs,
    fontWeight: '650', // Increased font weight
  },
  description: {
    fontSize: 13,
    color: colors.text.tertiary, // Changed to tertiary color
    textAlign: 'left',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.md,
    marginLeft: spacing.sm,
  },
  buttonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600', // Increased font weight
  },
  destructiveButtonText: {
    color: colors.primary.main,
  },
});
