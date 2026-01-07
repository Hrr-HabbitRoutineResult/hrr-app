import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { colors } from '../../design/tokens';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
  scrollEnabled?: boolean;
  footer?: React.ReactNode;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DEFAULT_SHEET_HEIGHT = SCREEN_HEIGHT * 0.55;

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  height,
  scrollEnabled = true,
  footer,
}) => {
  const sheetHeight = height ? verticalScale(height) : DEFAULT_SHEET_HEIGHT;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.bottomSheet, { height: sheetHeight }]}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {scrollEnabled ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.content, { flexGrow: 1 }]}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.content, { flex: 1 }]}>
              {children}
            </View>
          )}

          {footer && <View>{footer}</View>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    zIndex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  handle: {
    width: scale(60),
    height: verticalScale(4),
    backgroundColor: colors.line,
    borderRadius: scale(10),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(40),
  },
});
