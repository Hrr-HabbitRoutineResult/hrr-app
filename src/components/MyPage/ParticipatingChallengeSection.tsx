// src/components/MyPage/ParticipatingChallengeSection.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../design/tokens';
import { Text } from '../common/Text';
import ComponentHeader from '../common/ComponentHeader';

export type ParticipatingChallengeItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  roundText: string; // 예: "6R째 진행 중"
};

type Props = {
  title?: string; // 기본: "참가중인 챌린지"
  items: ParticipatingChallengeItem[];
  onPressHeader?: () => void;
  onPressItem?: (item: ParticipatingChallengeItem) => void;
};

const ParticipatingChallengeSection = ({
  title = '참가중인 챌린지',
  items,
  onPressHeader,
  onPressItem,
}: Props) => {
  const renderItem = ({ item }: ListRenderItemInfo<ParticipatingChallengeItem>) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => onPressItem?.(item)}
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}
        >
          <View style={styles.overlay} />

          <View style={styles.cardTextArea}>
            <Text variant="smMd" color={colors.white} style={styles.cardTitle}>
              {item.title}
            </Text>
            <Text variant="xsReg" color={colors.white} style={styles.cardSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>

          <View style={styles.pill}>
            <Text variant="xsReg" color={colors.white} style={styles.pillText}>
              {item.roundText}
            </Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ComponentHeader title={title} onPress={onPressHeader} />

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(it) => it.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: spacing.xs }} />}
      />
    </View>
  );
};

export default ParticipatingChallengeSection;

const CARD_W = 171;
const CARD_H = 148;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },

  listContent: {
    // paddingHorizontal is now handled by the main container
  },

  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },

  cardImage: {
    flex: 1,
    justifyContent: 'space-between',
  },

  cardImageStyle: {
    borderRadius: radius.lg,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  cardTextArea: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },

  cardTitle: {
    ...typography.smMd,
  },

  cardSubtitle: {
    marginTop: 4,
    opacity: 0.9,
  },

  pill: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  pillText: {
    ...typography.xsReg,
  },
});
