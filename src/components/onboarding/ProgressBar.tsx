import React from 'react';
import { View, StyleSheet } from 'react-native';
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
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  activeSegment: {
    backgroundColor: colors.primary.main,
  },
  inactiveSegment: {
    backgroundColor: colors.line,
  },
});
