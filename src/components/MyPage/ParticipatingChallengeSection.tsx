import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing } from '../../design/tokens';
import { Text } from '../common/Text';
import ComponentHeader from '../common/ComponentHeader';
import PlusIcon from '../../../assets/icons/plus.svg';
import { ChallengeCard, ChallengeCardItem } from '../challenge/ChallengeCard';
import { scale, verticalScale } from '../../utils/scaling';

export type ParticipatingChallengeItem = ChallengeCardItem;

const ChallengeSeparator = () => <View style={{ width: spacing.xs }} />;

type Props = {
  title?: string;
  items: ParticipatingChallengeItem[];
  onPressHeader?: () => void;
  onPressItem?: (item: ParticipatingChallengeItem) => void;
  onPressEmpty?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const ParticipatingChallengeSection = ({
  title = '참가중인 챌린지',
  items,
  onPressHeader,
  onPressItem,
  onPressEmpty,
  isLoading = false,
  error,
  onRetry,
}: Props) => {
  const renderItem = ({ item }: ListRenderItemInfo<ParticipatingChallengeItem>) => {
    return <ChallengeCard item={item} onPress={onPressItem} />;
  };

  const renderEmptyState = () => {
    if (onPressEmpty) {
      return (
        <TouchableOpacity style={styles.emptyCard} onPress={onPressEmpty} activeOpacity={0.8}>
          <View style={styles.emptyContent}>
            <PlusIcon width={scale(20)} height={scale(20)} fill={colors.text.tertiary} />
            <Text variant="xsReg" color={colors.text.tertiary}>
              새로운 챌린지에 가입해 보세요
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.emptyCard}>
        <Text variant="xsReg" color={colors.text.tertiary}>
          아직 참가중인 챌린지가 없어요!
        </Text>
      </View>
    );
  };

  return (
    <View>
      <ComponentHeader title={title} onPress={onPressHeader} />

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      ) : error ? (
        <TouchableOpacity
          style={styles.stateCard}
          activeOpacity={onRetry ? 0.8 : 1}
          onPress={onRetry}
          disabled={!onRetry}
        >
          <Text variant="xsReg" color={colors.text.tertiary}>
            참가중인 챌린지를 불러오지 못했어요
          </Text>
          {onRetry && (
            <Text variant="xxs" color={colors.primary.main}>
              다시 시도
            </Text>
          )}
        </TouchableOpacity>
      ) : items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(it) => it.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={ChallengeSeparator}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

export default ParticipatingChallengeSection;

const CARD_H = verticalScale(148);

const styles = StyleSheet.create({
  emptyCard: {
    width: '100%',
    height: CARD_H,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  stateCard: {
    width: '100%',
    height: CARD_H,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
