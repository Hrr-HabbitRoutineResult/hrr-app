import React, { useEffect, useRef } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { Header } from '../../components/common/Header';
import { colors } from '../../design/tokens';
import LoadingImage from '../../../assets/images/onboarding-loading.svg';
import { getChallengeRecommendations, RecommendedChallenge } from '../../libs/api/challenge';
import { getUserMe } from '../../libs/api/user';

interface OnboardingLoadingProps {
  onBack: () => void;
  onComplete: () => void;
  q1Gender: string;
  q1Age: string;
  q1Occupation: string;
  q2TimeSlots: Set<string>;
  q3Categories: string[];
  q4Goal: string;
  onSetRecommendedChallenges: (challenges: RecommendedChallenge[]) => void;
  refreshKey: number;
}

export const OnboardingLoading: React.FC<OnboardingLoadingProps> = ({
  onBack,
  onComplete,
  q1Gender,
  q1Age,
  q1Occupation,
  q2TimeSlots,
  q3Categories,
  q4Goal,
  onSetRecommendedChallenges,
  refreshKey,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const imageWidth = 220;
  const gap = 12;
  const totalImages = 5;

  useEffect(() => {
    // 오->왼 무한 스와이프 애니메이션
    let animation: Animated.CompositeAnimation | null = null;

    const startAnimation = () => {
      const animate = () => {
        slideAnim.setValue(0);
        animation = Animated.timing(slideAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        });
        animation.start(() => {
          // 애니메이션이 완료되면 다시 시작
          animate();
        });
      };
      animate();
    };

    startAnimation();

    // 클린업 함수
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, []);

  // API 호출하여 추천 챌린지 받기
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // 사용자 정보 가져오기
        const userInfo = await getUserMe();
        const userId = userInfo.userId;


        // TODO: 시간대 다중 선택 지원 필요 -> 백엔드 API 확인 수정 필요
        const firstTimeSlot = q2TimeSlots.size > 0 ? Array.from(q2TimeSlots)[0] : 'MORNING';
        
        // 카테고리 배열
        const categories = q3Categories.length > 0 
          ? q3Categories
          : ['ALL'];

        // API 요청 데이터 구성
        const request = {
          userId,
          gender: q1Gender as 'MALE' | 'FEMALE',
          ageGroup: q1Age as 'TEENS' | 'TWENTIES' | 'THIRTIES' | 'FORTIES' | 'FIFTIES_PLUS',
          job: q1Occupation as 'STUDENT_MIDDLE_HIGH' | 'STUDENT_UNIVERSITY' | 'JOB_SEEKER' | 'EMPLOYEE' | 'HOMEMAKER' | 'ETC',
          availableTime: firstTimeSlot as 'EARLY_MORNING' | 'MORNING' | 'LUNCH' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'LATE_NIGHT',
          category: categories,
          goal: q4Goal as 'BUILD_EXERCISE_HABIT' | 'HEALTHY_DAY' | 'EXAM_CAREER_PREP' | 'FIND_NEW_HOBBY' | 'ENJOY_HOBBY_TOGETHER' | 'FOCUS_ON_MYSELF' | 'KEEP_GOING',
        };

        // API 호출
        const recommendations = await getChallengeRecommendations(request);
        
        // 결과 저장
        onSetRecommendedChallenges(recommendations);
        
        // 완료 처리
        onComplete();
      } catch (error) {
        // 일단은 에러 발생 시에도 다음 화면으로 이동
        console.error('추천 챌린지 조회 실패:', error);
        onSetRecommendedChallenges([]);
        onComplete();
      }
    };

    fetchRecommendations();
  }, [q1Gender, q1Age, q1Occupation, q2TimeSlots, q3Categories, q4Goal, onComplete, onSetRecommendedChallenges, refreshKey]);

  // 이미지 위치 계산
  const getImageTranslateX = (index: number) => {
    // 화면 중앙을 기준으로 이미지 배치
    const baseOffset = (imageWidth + gap) * (index - 2); // 중앙(index 2) 기준으로 배치
    const moveDistance = imageWidth + gap; // 한 이미지 너비 + 간격만큼 이동
    return slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [baseOffset, baseOffset - moveDistance],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <Header onBack={onBack} />

      <View style={styles.content}>
        {/* 타이틀 */}
        <View style={styles.titleContainer}>
          <Text variant="header1" color={colors.text.primary} style={styles.title}>
            추천드릴 챌린지를{'\n'}탐색 중이에요
          </Text>
          <Text variant="xsReg" color={colors.text.tertiary} style={styles.subtitle}>
            잠시만 기다려주시면 바로 알려드릴게요!
          </Text>
        </View>
      </View>

      {/* 로딩 이미지 캐러셀 - 화면 전체 너비 사용 */}
      <View style={styles.imageContainer}>
        {Array.from({ length: totalImages }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.animatedImage,
              {
                transform: [{ translateX: getImageTranslateX(index) }],
              },
            ]}
          >
            <LoadingImage width={220} height={320} />
          </Animated.View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(20),
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: verticalScale(0),
    width: '100%',
  },
  title: {
    textAlign: 'left',
    lineHeight: verticalScale(32),
    marginBottom: verticalScale(12),
  },
  subtitle: {
    textAlign: 'left',
    lineHeight: verticalScale(22),
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    marginTop: -100,
  },
  animatedImage: {
    position: 'absolute',
    width: scale(220),
    height: verticalScale(320),
  },
});

