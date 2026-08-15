import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Text } from './Text';
import { colors } from '../../design/tokens';
import { scale, verticalScale } from '../../utils/scaling';

export interface ActionSheetItem {
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  items: ActionSheetItem[];
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  items,
}) => {
  const handleItemPress = (item: ActionSheetItem) => {
    if (item.disabled || !item.onPress) return;

    item.onPress();
    onClose();
  };

  /**
   * 액션 시트 컨테이너 높이 계산
   * @returns 액션 시트 컨테이너 높이
   */
  const calculateContainerHeight = () => {
    const itemHeight = 49;
    const dividerHeight = 1;
    return verticalScale(items.length * itemHeight + (items.length - 1) * dividerHeight);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <View style={[styles.actionButtonsContainer, { height: calculateContainerHeight() }]}>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={styles.actionDivider} />}
                <TouchableOpacity
                  style={styles.actionButton}
                  activeOpacity={0.9}
                  disabled={item.disabled}
                  onPress={() => handleItemPress(item)}
                  accessibilityState={{ disabled: item.disabled }}
                >
                  <Text
                    variant="md"
                    color={
                      item.disabled
                        ? colors.text.tertiary
                        : item.destructive
                          ? colors.primary.sub
                          : colors.text.primary
                    }
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.9}
            onPress={onClose}
          >
            <Text variant="md" color={colors.text.primary}>
              취소
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(32, 32, 32, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: verticalScale(40),
  },
  container: {
    alignItems: 'center',
  },
  actionButtonsContainer: {
    width: scale(350),
    backgroundColor: colors.white,
    borderRadius: scale(10),
    borderWidth: 1.5,
    borderColor: colors.line,
    marginBottom: verticalScale(12),
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  cancelButton: {
    width: scale(350),
    height: verticalScale(48),
    backgroundColor: colors.white,
    borderRadius: scale(10),
    borderWidth: 1.5,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
