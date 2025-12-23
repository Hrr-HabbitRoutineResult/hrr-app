import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { colors, typography, spacing } from '../../design/tokens';

type SectionHeaderProps = {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
};

const SectionHeader = ({ title, actionText, onActionPress }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
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
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.header3,
    color: colors.text.primary,
  },
  actionText: {
    ...typography.smMd,
    color: colors.text.secondary,
  },
});

export default SectionHeader;
