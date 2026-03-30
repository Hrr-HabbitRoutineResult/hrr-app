import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { colors, radius, spacing } from '../../design/tokens';
import { Text } from '../common/Text';
import ComponentHeader from '../common/ComponentHeader';
import PlusIcon from '../../../assets/icons/plus.svg';
import { ChallengeCard, ChallengeCardItem } from '../challenge/ChallengeCard';
import { scale, verticalScale } from '../../utils/scaling';

export type ParticipatingChallengeItem = ChallengeCardItem;

type Props = {
  title?: string;
  items: ParticipatingChallengeItem[];
  onPressHeader?: () => void;
  onPressItem?: (item: ParticipatingChallengeItem) => void;
  onPressEmpty?: () => void;
};

const ParticipatingChallengeSection = ({
  title = '참가중인 챌린지',
  items,
  onPressHeader,
  onPressItem,
  onPressEmpty,
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

      {items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(it) => it.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: spacing.xs }} />}
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
});

