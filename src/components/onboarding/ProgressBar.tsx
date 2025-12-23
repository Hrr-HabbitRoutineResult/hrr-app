import React from 'react';
import { View, StyleSheet } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { colors } from '../../design/tokens';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            index < currentStep ? styles.activeSegment : styles.inactiveSegment,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: scale(6),
    paddingHorizontal: scale(20),
    marginTop: verticalScale(12),
  },
  segment: {
    flex: 1,
    height: verticalScale(6),
    borderRadius: scale(3),
  },
  activeSegment: {
    backgroundColor: colors.primary.main,
  },
  inactiveSegment: {
    backgroundColor: colors.line,
  },
});
