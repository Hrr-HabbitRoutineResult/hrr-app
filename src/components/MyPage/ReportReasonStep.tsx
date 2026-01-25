import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../common/Text';
import { colors, spacing } from '../../design/tokens';
import RadioCheckedIcon from '../../../assets/icons/radio-checked.svg';
import RadioUncheckedIcon from '../../../assets/icons/radio-unchecked.svg';

export interface ReportReason {
  key: string;
  label: string;
}

interface ReportReasonStepProps {
  reasons: ReportReason[];
  selectedReason: string | null;
  onSelectReason: (reasonKey: string) => void;
}

export const ReportReasonStep: React.FC<ReportReasonStepProps> = ({
  reasons,
  selectedReason,
  onSelectReason,
}) => {
  return (
    <View style={styles.container}>
      {reasons.map((reason) => (
        <TouchableOpacity
          key={reason.key}
          style={styles.reasonItem}
          onPress={() => onSelectReason(reason.key)}
          activeOpacity={0.7}
        >
          {selectedReason === reason.key ? <RadioCheckedIcon /> : <RadioUncheckedIcon />}
          <Text variant="smReg" color={colors.text.primary}>
            {reason.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
