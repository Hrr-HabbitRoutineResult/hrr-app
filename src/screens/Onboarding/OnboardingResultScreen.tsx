import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { colors } from '../../design/tokens';
import LogoPrimarySvg from '../../../assets/images/logo-primary.svg';
import BackgroundBlur1Svg from '../../../assets/images/background-blur-1.svg';
import BackgroundBlur2Svg from '../../../assets/images/background-blur-2.svg';
import ChevronRightIcon from '../../../assets/icons/chevron-right-primary.svg';
import LikeSelectedIcon from '../../../assets/icons/like-selected-circle.svg';
import LikeUnselectedIcon from '../../../assets/icons/like-unselected-circle.svg';
import RefreshFabIcon from '../../../assets/icons/refresh-fab.svg';

interface OnboardingResultScreenProps {
  onGoHome: () => void;
  onRefresh: () => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
}

// 목 데이터
const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: '백준 실버3 코테',
    description: '백준 실버3 매일 풀고 공유',
  },
  {
    id: '2',
    title: '미라클 모닝',
    description: '매일 아침 6시에 기상한 후 인증샷 남기기',
  },
  {
    id: '3',
    title: '오운완',
    description: '매일 운동하고 인증하기',
  },
  {
    id: '4',
    title: '프로젝트 완성하기',
    description: '매일 최소 한 시간씩 개발 진행하기',
  },
  {
    id: '5',
    title: '일기쓰기',
    description: '자기 전에 일기쓰기',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 310;
const CARD_SPACING = 12;
// 첫 번째 카드가 화면 중앙에 오도록 하는 패딩 계산
const CENTER_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

export const OnboardingResultScreen: React.FC<OnboardingResultScreenProps> = ({
  onGoHome,
  onRefresh,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedChallenges, setLikedChallenges] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0); // 화면 새로고침을 위한 key
  const [bottomButtonTop, setBottomButtonTop] = useState(0); // 하단 버튼의 상단 위치
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const handleLikeToggle = (challengeId: string) => {
    const newLiked = new Set(likedChallenges);
    if (newLiked.has(challengeId)) {
      newLiked.delete(challengeId);
    } else {
      newLiked.add(challengeId);
    }
    setLikedChallenges(newLiked);
  };

  const handleRefresh = () => {
    // TODO: API 연동 후 API 재호출하는 로직으로 변경
    // 현재는 임시로 화면 새로고침
    setCurrentIndex(0);
    setLikedChallenges(new Set());
    setRefreshKey((prev) => prev + 1);
    // 캐러셀을 첫 번째로 스크롤
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
  };

  const renderChallengeCard = ({ item }: { item: Challenge }) => {
    const isLiked = likedChallenges.has(item.id);

    return (
      <View style={styles.cardContainer}>
        {/* 이미지 영역 - 회색 박스 + 하단 흰색 그라데이션 + 텍스트 오버레이 */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder} />
          {/* 그라데이션 효과를 위한 오버레이 */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
            style={styles.gradientOverlay}
          />
          {/* 좋아요 버튼 */}
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleLikeToggle(item.id)}
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
      </View>
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
          <FlatList
            key={refreshKey}
            ref={flatListRef}
            data={MOCK_CHALLENGES}
            renderItem={renderChallengeCard}
            keyExtractor={(item) => item.id}
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
            {MOCK_CHALLENGES.map((_, index) => {
              const isActive = index === currentIndex;
              const isEnd = index === 0 || index === MOCK_CHALLENGES.length - 1;

              // 현재 인덱스에 따라 스타일 결정
              let dotStyle;
              if (isActive) {
                // 현재 선택된 바
                dotStyle = styles.paginationDotActive;
              } else if (isEnd) {
                // 맨 끝 작은 원
                dotStyle = styles.paginationDotEnd;
              } else {
                // 양옆 원
                dotStyle = styles.paginationDot;
              }

              return (
                <View
                  key={index}
                  style={[
                    dotStyle,
                    index < MOCK_CHALLENGES.length - 1 && styles.paginationDotSpacing,
                  ]}
                />
              );
            })}
          </View>
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
    top: 48,
    left: 240,
    zIndex: 0,
  },
  backgroundBlur2: {
    position: 'absolute',
    top: 297,
    left: -66,
    zIndex: 0,
  },
  backgroundBlur3: {
    position: 'absolute',
    top: 477,
    left: 302,
    zIndex: 0,
  },
  header: {
    paddingHorizontal: 40,
    paddingTop: 15,
    zIndex: 1,
  },
  logoContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 18,
  },
  carouselContainer: {
    zIndex: 1,
    paddingTop: 35,
  },
  carouselContent: {
    paddingLeft: CENTER_PADDING,
    paddingRight: CENTER_PADDING,
    paddingBottom: 8,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 360,
    marginRight: CARD_SPACING,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 360,
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.line,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  likeButton: {
    position: 'absolute',
    top: 18,
    right: 14,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    padding: 24,
    zIndex: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  challengeTitle: {
    lineHeight: 24,
  },
  challengeDescription: {
    lineHeight: 18,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.button,
  },
  paginationDotActive: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.main,
  },
  paginationDotEnd: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.button,
  },
  paginationDotSpacing: {
    marginRight: 4,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
    zIndex: 1,
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    zIndex: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6, // Android
  },
});

