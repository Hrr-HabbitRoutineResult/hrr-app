import React from 'react';
import { View, Image } from 'react-native';
import PlusIcon from '../../../assets/icons/plus.svg';
import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../design/tokens';

export interface BadgeImage {
  uri: string;
}

type BadgeRowProps = {
  badges?: BadgeImage[];
};

export const BadgeRow = ({ badges = [] }: BadgeRowProps) => {
  const hasBadges = badges.length > 0;

  return (
    <View style={styles.midPanel}>
      {hasBadges ? (
        <View style={styles.badgeRow}>
          {badges.map((badge, idx) => (
            <View key={idx} style={styles.badgeItem}>
              <Image source={{ uri: badge.uri }} style={styles.badgeImage} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.plusCenter}>
          <PlusIcon width={20} height={20} fill={colors.text.secondary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  midPanel: {
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    width: 350, // Added to match large button size
    height: 56, // Changed from minHeight to fixed height
    justifyContent: 'center',
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  badgeItem: {
    // badge 컴포넌트 사이 여백을 더 세밀히 제어하고 싶으면 여기서
  },

  plusCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeImage: {
    width: 40, // Example size, adjust as needed
    height: 40, // Example size, adjust as needed
    borderRadius: 20, // Half of width/height to make it round
    // Add any other image specific styles here
  },
});