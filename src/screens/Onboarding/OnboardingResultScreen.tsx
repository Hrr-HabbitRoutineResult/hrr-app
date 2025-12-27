import React, { useState, useRef } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { CarouselPagination } from '../../components/common/CarouselPagination';
import { colors } from '../../design/tokens';
import LogoPrimarySvg from '../../../assets/images/logo-primary.svg';
import BackgroundBlur1Svg from '../../../assets/images/background-blur-1.svg';
import BackgroundBlur2Svg from '../../../assets/images/background-blur-2.svg';
import ChevronRightIcon from '../../../assets/icons/chevron-right-primary.svg';
import LikeSelectedIcon from '../../../assets/icons/like-selected-circle.svg';
import LikeUnselectedIcon from '../../../assets/icons/like-unselected-circle.svg';
import RefreshFabIcon from '../../../assets/icons/refresh-fab.svg';
import { RecommendedChallenge, trackChallengeClick } from '../../libs/api/challenge';
import { getS3ImageUrl } from '../../libs/s3';
import { RootStackParamList } from '../../navigation/types';

interface OnboardingResultScreenProps {
  onGoHome: () => void;
  onRefresh: () => void;
  recommendedChallenges: RecommendedChallenge[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 310;
const CARD_SPACING = 12;
// 첫 번째 카드가 화면 중앙에 오도록 하는 패딩 계산
const CENTER_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

export const OnboardingResultScreen: React.FC<OnboardingResultScreenProps> = ({
  onGoHome,
  onRefresh,
  recommendedChallenges,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedChallenges, setLikedChallenges] = useState<Set<number>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0); // 화면 새로고침을 위한 key
  const [bottomButtonTop, setBottomButtonTop] = useState(0); // 하단 버튼의 상단 위치
  const flatListRef = useRef<FlatList>(null);

  // 추천 챌린지가 없을 경우 빈 배열 사용
  const challenges = recommendedChallenges.length > 0 ? recommendedChallenges : [];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const handleLikeToggle = (challengeId: number) => {
    const newLiked = new Set(likedChallenges);
    if (newLiked.has(challengeId)) {
      newLiked.delete(challengeId);
    } else {
      newLiked.add(challengeId);
    }
    setLikedChallenges(newLiked);
  };

  const handleRefresh = () => {
    // API 재호출을 위해 상위 컴포넌트의 onRefresh 호출
    setCurrentIndex(0);
    setLikedChallenges(new Set());
    setRefreshKey((prev) => prev + 1);
    // 캐러셀을 첫 번째로 스크롤
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    onRefresh();
  };

  const renderChallengeCard = ({ item }: { item: RecommendedChallenge }) => {
    const isLiked = likedChallenges.has(item.challengeId);
    const imageUrl = getS3ImageUrl(item.image_key);

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.9}
        onPress={() => {
          trackChallengeClick(item.challengeId);
          navigation.navigate('ChallengeProfile', { challengeId: item.challengeId });
        }}
      >
        {/* 이미지 영역 - 회색 박스 + 하단 흰색 그라데이션 + 텍스트 오버레이 */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.challengeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          {/* 그라데이션 효과를 위한 오버레이 */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
            style={styles.gradientOverlay}
          />
          {/* 좋아요 버튼 */}
          <TouchableOpacity
            style={styles.likeButton}
            onPress={(e) => {
              e.stopPropagation();
              handleLikeToggle(item.challengeId);
            }}
            activeOpacity={0.7}
          >
            {isLiked ? (
              <LikeSelectedIcon width={48} height={48} />
            ) : (
              <LikeUnselectedIcon width={48} height={48} />
            )}
          </TouchableOpacity>
          {/* 텍스트 영역 - 이미지 위에 오버레이 */}
          <View style={styles.textOverlay}>
            <View style={styles.titleRow}>
              <Text variant="header2" color={colors.text.primary} style={styles.challengeTitle}>
                {item.title}
              </Text>
              <ChevronRightIcon width={4} height={8} />
            </View>
            <Text variant="xsReg" color={colors.text.tertiary} style={styles.challengeDescription}>
              {item.description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 배경 블러 효과들 */}
      <View style={styles.backgroundBlur1}>
        <BackgroundBlur1Svg width={280} height={280} />
      </View>
      <View style={styles.backgroundBlur2}>
        <BackgroundBlur1Svg width={270} height={270} />
      </View>
      <View style={styles.backgroundBlur3}>
        <BackgroundBlur2Svg width={200} height={200} />
      </View>

      {/* 상단 전체 콘텐츠 래퍼 */}
      <View style={styles.content}>
        {/* 왼쪽 상단 로고 */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LogoPrimarySvg width={28} height={28} />
          </View>
        </View>

        {/* 타이틀 영역 */}
        <View style={styles.titleSection}>
          <Text variant="header1" color={colors.text.primary} style={styles.title}>
            이런 챌린지 어떠세요?
          </Text>
          <Text variant="xsReg" color={colors.text.tertiary} style={styles.subtitle}>
            비슷한 챌린저들이 참여중인 챌린지예요
          </Text>
        </View>

        {/* 캐러셀 영역 */}
        <View style={styles.carouselContainer}>
          {challenges.length > 0 ? (
            <>
              <FlatList
                key={refreshKey}
                ref={flatListRef}
                data={challenges}
                renderItem={renderChallengeCard}
                keyExtractor={(item) => item.challengeId.toString()}
                horizontal
                pagingEnabled={false}
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                style={{ height: 360 }}
                contentContainerStyle={styles.carouselContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />
              {/* 페이지네이션 */}
              <View style={styles.paginationContainer}>
                <CarouselPagination
                  currentIndex={currentIndex}
                  totalItems={challenges.length}
                />
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="md" color={colors.text.secondary}>
                추천 챌린지가 없습니다
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 하단 버튼 */}
      <View
        style={styles.bottomButtonContainer}
        onLayout={(e) => {
          const { y } = e.nativeEvent.layout;
          // 화면 하단 기준으로 하단 버튼의 상단 위치 계산
          const { height: screenHeight } = Dimensions.get('window');
          setBottomButtonTop(screenHeight - y);
        }}
      >
        <Button
          variant="black"
          size="medium"
          onPress={onGoHome}
        >
          홈으로 가기
        </Button>
      </View>

      {/* 우측 하단 플로팅 버튼 */}
      <TouchableOpacity
        style={[
          styles.fabButton,
          bottomButtonTop > 0 && { bottom: bottomButtonTop + 24 },
        ]}
        onPress={handleRefresh}
        activeOpacity={0.7}
      >
        <RefreshFabIcon width={56} height={56} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  backgroundBlur1: {
    position: 'absolute',
    top: verticalScale(48),
    left: scale(240),
    zIndex: 0,
  },
  backgroundBlur2: {
    position: 'absolute',
    top: verticalScale(297),
    left: -66,
    zIndex: 0,
  },
  backgroundBlur3: {
    position: 'absolute',
    top: verticalScale(477),
    left: scale(302),
    zIndex: 0,
  },
  header: {
    paddingHorizontal: scale(40),
    paddingTop: verticalScale(15),
    zIndex: 1,
  },
  logoContainer: {
    width: scale(28),
    height: verticalScale(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(40),
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    textAlign: 'center',
    lineHeight: verticalScale(30),
    marginBottom: verticalScale(6),
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: verticalScale(18),
  },
  carouselContainer: {
    zIndex: 1,
    paddingTop: verticalScale(35),
  },
  carouselContent: {
    paddingLeft: CENTER_PADDING,
    paddingRight: CENTER_PADDING,
    paddingBottom: verticalScale(8),
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: verticalScale(360),
    marginRight: CARD_SPACING,
    backgroundColor: colors.white,
    borderRadius: scale(20),
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: verticalScale(360),
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.line,
  },
  challengeImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: verticalScale(0),
    left: scale(0),
    right: scale(0),
    height: '50%',
  },
  likeButton: {
    position: 'absolute',
    top: verticalScale(18),
    right: scale(14),
    width: scale(48),
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  textOverlay: {
    position: 'absolute',
    bottom: verticalScale(10),
    left: scale(0),
    right: scale(0),
    padding: 24,
    zIndex: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
    gap: scale(12),
  },
  challengeTitle: {
    lineHeight: verticalScale(24),
  },
  challengeDescription: {
    lineHeight: verticalScale(18),
  },
  paginationContainer: {
    marginTop: verticalScale(24),
  },
  emptyContainer: {
    height: verticalScale(360),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    alignItems: 'center',
    zIndex: 1,
  },
  fabButton: {
    position: 'absolute',
    right: scale(20),
    width: scale(56),
    height: verticalScale(56),
    zIndex: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: scale(0),
      height: verticalScale(3),
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6, // Android
  },
});

