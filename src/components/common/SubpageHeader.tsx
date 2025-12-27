import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'; // Added Platform
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Added useSafeAreaInsets
import { colors, typography, spacing } from '../../design/tokens';
import BackIcon from '../../../assets/icons/back.svg';

type SubpageHeaderProps = {
  title: string;
  onBackPress?: () => void;
  rightContent?: React.ReactNode;
  useSafeArea?: boolean; // Added useSafeArea prop
};

const SubpageHeader = ({ title, onBackPress, rightContent, useSafeArea = false }: SubpageHeaderProps) => {
  const insets = useSafeAreaInsets();
  const safeAreaTop = useSafeArea ? (Platform.OS === 'android' ? Math.max(insets.top, 24) : insets.top) : 0;
  const verticalPadding = Platform.OS === 'android' ? 24 : 16; // copied from old Header component for consistency

  return (
    <View style={[
      styles.container,
      {
        paddingTop: safeAreaTop + verticalPadding,
        paddingBottom: verticalPadding,
      }
    ]}>
      <TouchableOpacity onPress={onBackPress} style={styles.leftIconContainer}>
        {onBackPress && <BackIcon width={24} height={24} />}
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {rightContent ? (
        <View style={styles.rightContentContainer}>
          {rightContent}
        </View>
      ) : (
        <View style={styles.rightContentPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    // paddingVertical: spacing.sm, // Removed and handled by dynamic paddingTop/Bottom
  },
  leftIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.body1,
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  rightContentContainer: {
    minWidth: 24,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  rightContentPlaceholder: {
    width: 24,
  },
});

export default SubpageHeader;
