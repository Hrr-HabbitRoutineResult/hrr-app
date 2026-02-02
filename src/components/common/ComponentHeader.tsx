import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../design/tokens';
import { scale, verticalScale } from '../../utils/scaling';
import ChevronRightIcon from '../../../assets/icons/chevron-right-ic-grey.svg';

type ComponentHeaderProps = {
  title: string;
  onPress?: () => void;
};

const ComponentHeader = ({ title, onPress }: ComponentHeaderProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} disabled={!onPress}>
      <Text style={styles.title} allowFontScaling={false}>{title}</Text>
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
    paddingVertical: verticalScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(15),
    marginBottom: verticalScale(4),
  },
  title: {
    ...typography.header4,
    color: colors.text.primary,
  },
  chevronBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ComponentHeader;
