import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../design/tokens';
import { PointCriteriaType } from '../../types/ranking';
import { formatSignedPoints } from '../../utils/number';
import { scale, verticalScale } from '../../utils/scaling';
import { Text } from '../common/Text';
import { CriteriaIcon } from './criteriaIcons';

interface PointCriteriaRowProps {
  type: PointCriteriaType;
  title: string;
  points: number;
  description?: string;
}

export const PointCriteriaRow: React.FC<PointCriteriaRowProps> = ({
  type,
  title,
  points,
  description,
}) => (
  <View style={styles.row}>
    <View style={styles.iconWrap}>
      <CriteriaIcon
        type={type}
        width={scale(20)}
        height={scale(20)}
        color={colors.text.tertiary}
      />
    </View>
    <View style={styles.textWrap}>
      <Text variant="xsMd" color={colors.text.primary} numberOfLines={1}>
        {title}
      </Text>
      {description ? (
        <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
          {description}
        </Text>
      ) : null}
    </View>
    <Text variant="xsMd" color={colors.primary.sub} style={styles.points}>
      {formatSignedPoints(points)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    minHeight: verticalScale(62),
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: scale(22),
    height: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  textWrap: {
    flex: 1,
    gap: verticalScale(1),
  },
  points: {
    minWidth: scale(42),
    marginLeft: scale(12),
    textAlign: 'right',
  },
});
