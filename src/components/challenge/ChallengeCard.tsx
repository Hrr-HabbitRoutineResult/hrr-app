import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../design/tokens';
import { scale } from '../../utils/scaling';
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
const HORIZONTAL_PADDING = scale(20);
const CARD_PADDING = spacing.xs;
const CARD_WIDTH = (screenWidth - (HORIZONTAL_PADDING * 2) - CARD_PADDING) / 2;

export const ChallengeCard = ({ item, onPress }: Props) => {

  const cardStyle = {
    width: CARD_WIDTH,
    height: 148,
  };

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
            variant="smMd"
            color={colors.white}
            style={styles.cardTitle}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            variant="xxs"
            color={colors.white}
            style={styles.cardSubtitle}
            numberOfLines={1}
          >
            {item.subtitle}
          </Text>
        </View>

        <View style={styles.pill}>
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
    borderRadius: scale(10),
    overflow: 'hidden',
  },
  cardImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardImageStyle: {
    borderRadius: scale(10),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  cardTextArea: {
    paddingLeft: 16,
    paddingRight: 12,
    paddingTop: 23.5,
  },
  cardTitle: {
    lineHeight: 18,
  },
  cardSubtitle: {
    marginTop: 4,
    opacity: 0.9,
  },
  pill: {
    marginBottom: scale(12),
    marginHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(14),
    backgroundColor: colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    ...typography.xsReg,
    textAlign: 'center',
  },
});
