import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text } from '../common/Text';
import { colors, spacing, typography } from '../../design/tokens';

interface ReportDetailStepProps {
  text: string;
  onChangeText: (text: string) => void;
}

export const ReportDetailStep: React.FC<ReportDetailStepProps> = ({ text, onChangeText }) => {
  return (
    <View style={styles.container}>
      <Text variant="xsReg" color={colors.text.tertiary} style={styles.hint}>
        최대 200자까지 작성 가능합니다.
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={onChangeText}
          placeholder="신고 내용을 입력해주세요."
          placeholderTextColor={colors.text.tertiary}
          multiline
          maxLength={200}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  hint: {
    marginBottom: spacing.sm,
  },
  inputContainer: {
    height: 160,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
  },
  textInput: {
    flex: 1,
    ...typography.smReg,
    color: colors.text.primary,
  },
});
