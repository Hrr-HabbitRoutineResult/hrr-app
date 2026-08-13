import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../design/tokens';
import { PointCriteria } from '../../types/ranking';
import { scale, verticalScale } from '../../utils/scaling';
import { BottomSheet } from '../common/BottomSheet';
import { Text } from '../common/Text';
import { PointCriteriaRow } from './PointCriteriaRow';

interface PointCriteriaSheetProps {
  visible: boolean;
  onClose: () => void;
  criteria: PointCriteria[];
}

export const PointCriteriaSheet: React.FC<PointCriteriaSheetProps> = ({
  visible,
  onClose,
  criteria,
}) => (
  <BottomSheet
    visible={visible}
    onClose={onClose}
    height={568}
    scrollEnabled={false}
  >
    <Text variant="smMd" color={colors.text.primary} style={styles.title}>
      포인트 적립 기준
    </Text>
    <View style={styles.divider} />
    <View style={styles.list}>
      {criteria.map(item => (
        <PointCriteriaRow
          key={item.type}
          type={item.type}
          title={item.title}
          description={item.description}
          points={item.points}
        />
      ))}
    </View>
  </BottomSheet>
);

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginTop: verticalScale(-8),
    marginBottom: verticalScale(14),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginHorizontal: scale(-20),
    marginBottom: verticalScale(4),
  },
  list: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
});
