// src/components/MyPage/ParticipatingChallengeSection.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../design/tokens';
import { Text } from '../common/Text';
import ComponentHeader from '../common/ComponentHeader';
import PlusIcon from '../../../assets/icons/plus.svg';
import { ChallengeCard, ChallengeCardItem } from '../challenge/ChallengeCard';

export type ParticipatingChallengeItem = ChallengeCardItem;

type Props = {
  title?: string; // 기본: "참가중인 챌린지"
  items: ParticipatingChallengeItem[];
  onPressHeader?: () => void;
  onPressItem?: (item: ParticipatingChallengeItem) => void;
  onPressEmpty?: () => void; // Empty state card press handler
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

  const renderEmptyState = () => (
    <TouchableOpacity style={styles.emptyCard} onPress={onPressEmpty} activeOpacity={0.8}>
      <View style={styles.emptyContent}>
        <PlusIcon width={24} height={24} fill={colors.text.secondary} />
        <Text variant="smReg" color={colors.text.secondary} style={styles.emptyText}>
          새로운 챌린지에 가입해보세요
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ComponentHeader title={title} onPress={onPressHeader} />

      {items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(it) => it.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ width: spacing.xs }} />}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

export default ParticipatingChallengeSection;

const CARD_H = 148;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },

  listContent: {
    // paddingHorizontal is now handled by the main container
  },

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

  emptyText: {
    color: colors.text.secondary,
  },
});

