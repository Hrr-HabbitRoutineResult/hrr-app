// src/components/challenge/ChallengeCard.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../design/tokens';
import { Text } from '../common/Text';

export type ChallengeCardItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  roundText: string;
};

type Props = {
  item: ChallengeCardItem;
  onPress?: (item: ChallengeCardItem) => void;
};

const { width: screenWidth } = Dimensions.get('window');
const CARD_MARGIN = spacing.md;
const CARD_PADDING = spacing.xs;
const CARD_WIDTH = (screenWidth - (CARD_MARGIN * 2) - CARD_PADDING) / 2; // Unified card width

export const ChallengeCard = ({ item, onPress }: Props) => {

  const cardStyle = {
    width: CARD_WIDTH,
    height: 148,
  };

  const pillWidth = CARD_WIDTH * 0.9; // Pill is 90% of card width

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, cardStyle]}
      onPress={() => onPress?.(item)}
    >
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.cardImage}
        imageStyle={styles.cardImageStyle}
      >
        <View style={styles.overlay} />

        <View style={styles.cardTextArea}>
          <Text
            variant="smMd" // Changed to smMd for bolder text
            color={colors.white}
            style={styles.cardTitle}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            variant="xsReg"
            color={colors.white}
            style={styles.cardSubtitle}
            numberOfLines={1}
          >
            {item.subtitle}
          </Text>
        </View>

        <View style={[styles.pill, { width: pillWidth }]}>
          <Text variant="xsReg" color={colors.white} style={styles.pillText} numberOfLines={1}>
            {item.roundText}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  cardTextArea: {
    paddingHorizontal: spacing.sm,
    paddingTop: 24,
    left: 8,
  },
  cardTitle: {
    lineHeight: 18,
  },
  cardSubtitle: {
    marginTop: 4,
    opacity: 0.9,
  },
  pill: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
    paddingVertical: 4, // Vertically shorter
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    ...typography.xsReg,
    textAlign: 'center',
  },
});
