import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../../design/tokens';

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
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  title: {
    ...tokens.typography.header3,
    color: tokens.color.text.primary,
  },
  actionText: {
    ...tokens.typography.smMd,
    color: tokens.color.text.secondary,
  },
});

export default SectionHeader;
