import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../design/tokens';
import ChevronRightIcon from '../../../assets/icons/chevron-right-grey.svg';

type ComponentHeaderProps = {
  title: string;
  onPress?: () => void;
};

const ComponentHeader = ({ title, onPress }: ComponentHeaderProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} disabled={!onPress}>
      <Text style={styles.title}>{title}</Text>
      {onPress && <ChevronRightIcon width={16} height={16} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    // The user wants the icon right next to the text, so no space-between
  },
  title: {
    ...typography.header3,
    color: colors.text.primary,
    marginRight: spacing.xxs, // Small space between text and icon
  },
});

export default ComponentHeader;
