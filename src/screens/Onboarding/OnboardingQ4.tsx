import React from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { colors } from '../../design/tokens';
import ExerciseSelectedIcon from '../../../assets/icons/goal/exercise-selected.svg';
import ExerciseUnselectedIcon from '../../../assets/icons/goal/exercise-unselected.svg';
import HealthSelectedIcon from '../../../assets/icons/goal/health-selected.svg';
import HealthUnselectedIcon from '../../../assets/icons/goal/health-unselected.svg';
import StudySelectedIcon from '../../../assets/icons/goal/study-selected.svg';
import StudyUnselectedIcon from '../../../assets/icons/goal/study-unselected.svg';
import HobbyNewSelectedIcon from '../../../assets/icons/goal/hobby-new-selected.svg';
import HobbyNewUnselectedIcon from '../../../assets/icons/goal/hobby-new-unselected.svg';
import HobbyTogetherSelectedIcon from '../../../assets/icons/goal/hobby-together-selected.svg';
import HobbyTogetherUnselectedIcon from '../../../assets/icons/goal/hobby-together-unselected.svg';
import FocusSelectedIcon from '../../../assets/icons/goal/focus-selected.svg';
import FocusUnselectedIcon from '../../../assets/icons/goal/focus-unselected.svg';
import ConsistencySelectedIcon from '../../../assets/icons/goal/consistency-selected.svg';
import ConsistencyUnselectedIcon from '../../../assets/icons/goal/consistency-unselected.svg';

interface OnboardingQ4Props {
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  selectedGoal: string;
  onGoalChange: (goal: string) => void;
}

interface GoalOption {
  id: string;
  title: string;
  description: string;
  SelectedIcon: React.ComponentType<{ width?: number; height?: number }>;
  UnselectedIcon: React.ComponentType<{ width?: number; height?: number }>;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'BUILD_EXERCISE_HABIT',
    title: '운동 습관 만들기',
    description: '가볍게 몸을 움직이며 활력을 채워가요',
    SelectedIcon: ExerciseSelectedIcon,
    UnselectedIcon: ExerciseUnselectedIcon,
  },
  {
    id: 'HEALTHY_DAY',
    title: '건강한 하루 챙기기',
    description: '식단 등 건강 관리로 균형 잡힌 하루를 만들어요',
    SelectedIcon: HealthSelectedIcon,
    UnselectedIcon: HealthUnselectedIcon,
  },
  {
    id: 'EXAM_CAREER_PREP',
    title: '시험·취업 준비하기',
    description: '자격증·시험·취업을 향해 차근차근 준비해요',
    SelectedIcon: StudySelectedIcon,
    UnselectedIcon: StudyUnselectedIcon,
  },
  {
    id: 'FIND_NEW_HOBBY',
    title: '새로운 취미 발견하기',
    description: '낯선 활동에 도전하며 새로운 나를 만나봐요',
    SelectedIcon: HobbyNewSelectedIcon,
    UnselectedIcon: HobbyNewUnselectedIcon,
  },
  {
    id: 'ENJOY_HOBBY_TOGETHER',
    title: '함께 취미 즐기기',
    description: '독서·그림 등 좋아하는 활동을 공유하며 즐겨요',
    SelectedIcon: HobbyTogetherSelectedIcon,
    UnselectedIcon: HobbyTogetherUnselectedIcon,
  },
  {
    id: 'FOCUS_ON_MYSELF',
    title: '나에게 몰입하기',
    description: '글쓰기·명상 같은 활동에 집중하며 여유를 찾아가요',
    SelectedIcon: FocusSelectedIcon,
    UnselectedIcon: FocusUnselectedIcon,
  },
  {
    id: 'KEEP_GOING',
    title: '꾸준함 이어가기',
    description: '작심삼일을 넘어서 습관을 흐름처럼 지켜가요',
    SelectedIcon: ConsistencySelectedIcon,
    UnselectedIcon: ConsistencyUnselectedIcon,
  },
];

export const OnboardingQ4: React.FC<OnboardingQ4Props> = ({
  onBack,
  onSkip,
  onNext,
  selectedGoal,
  onGoalChange,
}) => {
  const isNextEnabled = selectedGoal !== '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <Header
        onBack={onBack}
        rightContent={
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text variant="xsReg" color={colors.text.primary}>
              건너뛰기
            </Text>
          </TouchableOpacity>
        }
      />

      {/* 진행률 표시줄 */}
      <ProgressBar currentStep={4} totalSteps={4} />

      <View style={styles.content}>
        {/* Q4 타이틀 */}
        <View style={styles.q4TitleContainer}>
          <Text variant="header1" color={colors.text.primary} style={styles.q4Title}>
            챌린지로 이루고 싶은{'\n'}나의 목표는...
          </Text>
          <Text variant="xsReg" color={colors.text.tertiary} style={styles.q4Subtitle}>
            하나의 목표를 선택할 수 있어요
          </Text>
        </View>

        {/* 선택 옵션들 */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {GOAL_OPTIONS.map((option) => {
            const isSelected = selectedGoal === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardSelected,
                ]}
                onPress={() => onGoalChange(isSelected ? '' : option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  {isSelected ? (
                    <option.SelectedIcon width={24} height={24} />
                  ) : (
                    <option.UnselectedIcon width={24} height={24} />
                  )}
                </View>
                <View style={styles.goalTextContainer}>
                  <Text variant="smMd" color={colors.text.secondary} style={styles.goalTitle}>
                    {option.title}
                  </Text>
                  <Text variant="xxs" color={colors.text.tertiary} style={styles.goalDescription}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonDivider} />
      <View style={styles.buttonContainer}>
        <Button
          variant={isNextEnabled ? 'black' : 'gray'}
          size="medium"
          onPress={onNext}
          disabled={!isNextEnabled}
        >
          다음
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipButton: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(8),
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  q4TitleContainer: {
    alignItems: 'flex-start',
    paddingTop: verticalScale(39),
    marginBottom: verticalScale(39),
  },
  q4Title: {
    textAlign: 'left',
    lineHeight: verticalScale(32),
    marginBottom: verticalScale(12),
  },
  q4Subtitle: {
    textAlign: 'left',
    lineHeight: verticalScale(22),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: verticalScale(0),
    paddingBottom: verticalScale(20),
    gap: scale(10),
    alignItems: 'center',
  },
  goalCard: {
    width: '100%',
    maxWidth: scale(350),
    height: verticalScale(80),
    borderRadius: scale(20),
    borderWidth: scale(1.5),
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalCardSelected: {
    borderColor: colors.primary.main,
  },
  iconContainer: {
    width: scale(24),
    height: verticalScale(24),
    marginRight: scale(12),
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    marginBottom: verticalScale(4),
    lineHeight: verticalScale(20),
  },
  goalDescription: {
    lineHeight: verticalScale(18),
  },
  buttonDivider: {
    height: verticalScale(1),
    backgroundColor: colors.line,
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    paddingTop: verticalScale(12),
    alignItems: 'center',
  },
});

