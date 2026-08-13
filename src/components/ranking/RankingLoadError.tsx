import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../../design/tokens';
import { scale, verticalScale } from '../../utils/scaling';
import { Text } from '../common/Text';

interface RankingLoadErrorProps {
  message: string;
  onRetry: () => void;
}

export const RankingLoadError: React.FC<RankingLoadErrorProps> = ({
  message,
  onRetry,
}) => (
  <View style={styles.container} testID="ranking-load-error">
    <Text variant="smReg" color={colors.text.tertiary}>
      {message}
    </Text>
    <TouchableOpacity
      onPress={onRetry}
      style={styles.retryButton}
      testID="ranking-retry-button"
    >
      <Text variant="xsMd" color={colors.primary.main}>
        다시 시도
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(18),
    paddingHorizontal: scale(20),
  },
  retryButton: {
    minWidth: scale(140),
    height: verticalScale(44),
    borderWidth: scale(1),
    borderColor: colors.primary.main,
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
