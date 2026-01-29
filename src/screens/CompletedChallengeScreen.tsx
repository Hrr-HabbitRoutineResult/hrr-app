import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Dimensions, ListRenderItemInfo, Alert } from 'react-native';
import { getErrorMessage } from '../utils/errorHandler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { Text } from '../components/common/Text';
import { colors, spacing, typography } from '../design/tokens';
import { getCompletedChallenges, ChallengeItem as ApiChallengeItem } from '../libs/api/user';
import CompleteIcon from '../../assets/icons/complete.svg';
import Search from '../../assets/icons/search-text-primay.svg';

export type CompletedChallengeItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
};

const CARD_MARGIN = spacing.md;
const CARD_PADDING = spacing.xs;
const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - (CARD_MARGIN * 2) - CARD_PADDING) / 2;

const CompletedChallengeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [challenges, setChallenges] = useState<ApiChallengeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const result = await getCompletedChallenges(1, 20); // TODO: Add pagination
      setChallenges(result.content);
    } catch (error) {
      const errorMessage = getErrorMessage(error, '종료한 챌린지 정보를 불러오는 데 실패했습니다.');
      Alert.alert('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchChallenges();
    }, [])
  );

  const completedChallenges: CompletedChallengeItem[] = useMemo(() => {
    return (challenges || []).map((item) => ({
      id: String(item.challengeId),
      title: item.title,
      subtitle: item.description,
      imageUrl: item.image,
    }));
  }, [challenges]);

  const renderChallengeItem = ({ item }: ListRenderItemInfo<CompletedChallengeItem>) => {
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
          <View style={styles.completeIconContainer}>
            <CompleteIcon width={80} height={80} />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCard}>
        <Search width={24} height={24} />
        <Text variant="smReg" color={colors.text.secondary} style={styles.emptyText}>
          아직 종료한 챌린지가 없어요
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="종료한 챌린지"
        onBack={() => navigation.goBack()}
        useSafeArea={true}
      />
      {completedChallenges.length > 0 ? (
        <FlatList
          data={completedChallenges}
          renderItem={renderChallengeItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          onRefresh={fetchChallenges}
          refreshing={isLoading}
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
  completeIconContainer: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 80,
    height: 80,
  },
});

export default CompletedChallengeScreen;
