import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Dimensions, ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { Text } from '../components/common/Text';
import { colors, spacing, typography } from '../design/tokens';
import { useUserStore } from '../store/userSlice';
import PlusIcon from '../../assets/icons/plus.svg';

// Define ParticipatingChallengeItem type
export type ParticipatingChallengeItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  roundText: string;
};

const CARD_MARGIN = spacing.md; // Define margin for cards
const CARD_PADDING = spacing.xs; // Define padding for cards inside container
const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - (CARD_MARGIN * 2) - CARD_PADDING) / 2; // Calculate width for 2 columns with spacing

const ParticipatingChallengeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { myOngoingChallenges, fetchMyOngoingChallenges } = useUserStore();

  useEffect(() => {
    // Data is already fetched by HomeScreen or MyScreen, but we can call it here as a fallback
    // or if this screen can be accessed independently.
    if (myOngoingChallenges.length === 0) {
      fetchMyOngoingChallenges();
    }
  }, [fetchMyOngoingChallenges, myOngoingChallenges.length]);

  const participatingChallenges: ParticipatingChallengeItem[] = useMemo(() => {
    return myOngoingChallenges.map((item) => ({
      id: String(item.challengeId),
      title: item.title,
      subtitle: item.description,
      imageUrl: item.image,
      roundText: `${item.currentRound}R째 진행 중`,
    }));
  }, [myOngoingChallenges]);

  const renderParticipatingChallengeItem = ({ item }: ListRenderItemInfo<ParticipatingChallengeItem>) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => console.log('Participating Challenge Item Pressed:', item.title)} // Add onPress handler
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
      <TouchableOpacity style={styles.emptyCard} onPress={() => navigation.navigate('ChallengeList')} activeOpacity={0.8}>
        <PlusIcon width={24} height={24} fill={colors.text.secondary} />
        <Text variant="smReg" color={colors.text.secondary} style={styles.emptyText}>
          새로운 챌린지에 가입해보세요
        </Text>
      </TouchableOpacity>
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
    height: 148, // Fixed height for cards, adjust as needed
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 1,
    top: 0.5,
  },
  emptyContainer: {
    flex: 1,
    // justifyContent: 'center', // Removed to align to top
    alignItems: 'center',
    paddingHorizontal: CARD_MARGIN,
    paddingTop: spacing.lg, // Add some padding to the top
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
