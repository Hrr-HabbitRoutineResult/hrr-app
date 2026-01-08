import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Dimensions, ListRenderItemInfo, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { Text } from '../components/common/Text';
import { colors, spacing, typography } from '../design/tokens';
import { useUserStore } from '../store/userSlice';
import { getOngoingChallengesById, OngoingChallengeItem as ApiChallengeItem } from '../libs/api/user';
import PlusIcon from '../../assets/icons/plus.svg';

export type ParticipatingChallengeItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  roundText: string;
};

const CARD_MARGIN = spacing.md;
const CARD_PADDING = spacing.xs;
const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - (CARD_MARGIN * 2) - CARD_PADDING) / 2;

type ParticipatingChallengeScreenRouteProp = RouteProp<RootStackParamList, 'ParticipatingChallenge'>;

const ParticipatingChallengeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ParticipatingChallengeScreenRouteProp>();
  const userId = route.params?.userId;
  const isMe = !userId;

  // State for other user's challenges
  const [otherUserChallenges, setOtherUserChallenges] = useState<ApiChallengeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Global state for logged-in user
  const { myOngoingChallenges, fetchMyOngoingChallenges } = useUserStore();
  
  useFocusEffect(
    useCallback(() => {
      if (isMe) {
        if (myOngoingChallenges.length === 0) {
          fetchMyOngoingChallenges();
        }
      } else {
        const fetchOtherUserChallenges = async () => {
          setIsLoading(true);
          try {
            const result = await getOngoingChallengesById(userId);
            setOtherUserChallenges(result.content);
          } catch (error) {
            Alert.alert('오류', '챌린지 정보를 불러오는 데 실패했습니다.');
          } finally {
            setIsLoading(false);
          }
        };
        fetchOtherUserChallenges();
      }
    }, [isMe, userId, fetchMyOngoingChallenges, myOngoingChallenges.length])
  );

  const challengesSource = isMe ? myOngoingChallenges : otherUserChallenges;

  const participatingChallenges: ParticipatingChallengeItem[] = useMemo(() => {
    return (challengesSource || []).map((item) => ({
      id: String(item.challengeId),
      title: item.title,
      subtitle: item.description,
      imageUrl: item.image,
      roundText: `${item.currentRound}R째 진행 중`,
    }));
  }, [challengesSource]);

  const renderParticipatingChallengeItem = ({ item }: ListRenderItemInfo<ParticipatingChallengeItem>) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => navigation.navigate('ChallengeProfile', { challengeId: Number(item.id) })}
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}
        >
          <View style={styles.overlay} />

          <View style={styles.cardTextArea}>
            <Text
              variant="smReg"
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

          <View style={styles.pill}>
            <Text variant="xsReg" color={colors.white} style={styles.pillText} numberOfLines={1}>
              {item.roundText}
            </Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
        {isMe ? (
            <TouchableOpacity style={styles.emptyCard} onPress={() => navigation.navigate('ChallengeList')} activeOpacity={0.8}>
                <PlusIcon width={24} height={24} fill={colors.text.secondary} />
                <Text variant="smReg" color={colors.text.secondary} style={styles.emptyText}>
                새로운 챌린지에 가입해보세요
                </Text>
            </TouchableOpacity>
        ) : (
            <Text style={styles.emptyText}>참가중인 챌린지가 없습니다.</Text>
        )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="참가중인 챌린지"
        onBack={() => navigation.goBack()}
        useSafeArea={true}
      />
      {participatingChallenges.length > 0 ? (
        <FlatList
          data={participatingChallenges}
          renderItem={renderParticipatingChallengeItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: spacing.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  card: {
    width: CARD_WIDTH,
    height: 148,
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 1,
    top: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: CARD_MARGIN,
    paddingTop: spacing.lg,
  },
  emptyCard: {
    width: '100%',
    height: 148,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.text.secondary,
  },
  cardImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardImageStyle: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cardTextArea: {
    paddingHorizontal: spacing.sm,
    paddingTop: 24,
    left: 8,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 18,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
  },
  pill: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    width: 148,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    ...typography.xsReg,
    textAlign: 'center',
  },
});

export default ParticipatingChallengeScreen;
