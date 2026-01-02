import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Dimensions, ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import SubpageHeader from '../components/common/SubpageHeader';
import { Text } from '../components/common/Text'; // Added Text import
import { colors, spacing, typography } from '../design/tokens';

// Define ParticipatingChallengeItem type (copied from ParticipatingChallengeSection.tsx)
export type ParticipatingChallengeItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  roundText: string;
};

// Define mock data (copied from MyScreen.tsx)
const mockParticipatingChallenges: ParticipatingChallengeItem[] = [
  {
    id: 'p1',
    title: '매일 아침 운동',
    subtitle: '7시 기상 후 헬스장 가기',
    imageUrl: 'https://picsum.photos/id/237/200/300',
    roundText: '6R째 진행 중',
  },
  {
    id: 'p2',
    title: '하루 물 2L 마시기',
    subtitle: '꾸준한 수분 섭취로 건강 UP!',
    imageUrl: 'https://picsum.photos/id/238/200/300',
    roundText: '3R째 진행 중',
  },
  {
    id: 'p3',
    title: '주 3회 독서',
    subtitle: '지적 성장 챌린지',
    imageUrl: 'https://picsum.photos/id/239/200/300',
    roundText: '1R째 진행 중',
  },
  {
    id: 'p4',
    title: '매일 아침 운동 2',
    subtitle: '7시 기상 후 헬스장 가기 2',
    imageUrl: 'https://picsum.photos/id/240/200/300',
    roundText: '6R째 진행 중',
  },
  {
    id: 'p5',
    title: '하루 물 2L 마시기 2',
    subtitle: '꾸준한 수분 섭취로 건강 UP! 2',
    imageUrl: 'https://picsum.photos/id/241/200/300',
    roundText: '3R째 진행 중',
  },
  {
    id: 'p6',
    title: '주 3회 독서 2',
    subtitle: '지적 성장 챌린지 2',
    imageUrl: 'https://picsum.photos/id/242/200/300',
    roundText: '1R째 진행 중',
  },
];

const CARD_MARGIN = spacing.md; // Define margin for cards
const CARD_PADDING = spacing.xs; // Define padding for cards inside container
const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - (CARD_MARGIN * 2) - CARD_PADDING) / 2; // Calculate width for 2 columns with spacing

const ParticipatingChallengeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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

  return (
    <View style={styles.container}>
      <SubpageHeader
        title="참가중인 챌린지"
        onBackPress={() => navigation.goBack()}
        useSafeArea={true}
      />
      <FlatList
        data={mockParticipatingChallenges}
        renderItem={renderParticipatingChallengeItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
      />
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
