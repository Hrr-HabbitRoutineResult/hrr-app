import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Challenge } from '../../store/challengeSlice';
import { RootStackParamList } from '../../navigation/types';
import { tokens } from '../../design/tokens';
import { formatParticipants } from '../../libs/format';
import SectionHeader from '../common/SectionHeader';

type PopularListProps = {
  challenges: Challenge[];
};

const PopularList = ({ challenges }: PopularListProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSeeMore = () => {
    navigation.navigate('ChallengeList', { category: 'popular' });
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="오늘의 인기 챌린지" actionText="상세보기" onActionPress={handleSeeMore} />
      {challenges.slice(0, 3).map((challenge) => (
        <TouchableOpacity key={challenge.id} style={styles.card}>
          <Image source={{ uri: challenge.thumbnail }} style={styles.thumbnail} />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={styles.subText}>{challenge.cadence}</Text>
          </View>
          <View style={styles.participantsBadge}>
            <Text style={styles.participantsText}>{formatParticipants(challenge.participants)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.md,
    marginRight: tokens.spacing.sm,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    ...tokens.typography.md,
    color: tokens.color.text.primary,
    marginBottom: tokens.spacing.xxs,
  },
  subText: {
    ...tokens.typography.xsReg,
    color: tokens.color.text.secondary,
  },
  participantsBadge: {
    backgroundColor: tokens.color.background,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs,
    borderRadius: tokens.radius.sm,
  },
  participantsText: {
    ...tokens.typography.caption,
    color: tokens.color.text.secondary,
  },
});

export default PopularList;
