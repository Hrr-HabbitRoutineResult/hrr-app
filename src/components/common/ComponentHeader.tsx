import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../design/tokens';
import ChevronRightIcon from '../../../assets/icons/chevron-right-ic-grey.svg';

type ComponentHeaderProps = {
  title: string;
  onPress?: () => void;
};

const ComponentHeader = ({ title, onPress }: ComponentHeaderProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} disabled={!onPress}>
      <Text style={styles.title}>{title}</Text>
      {onPress && (
        <View style={styles.chevronBox}>
          <ChevronRightIcon width={5} height={10} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    // The user wants the icon right next to the text, so no space-between
  },
  title: {
    ...typography.header3,
    color: colors.text.primary,
    marginRight: spacing.xxs, // Small space between text and icon
  },
  chevronBox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ComponentHeader;
