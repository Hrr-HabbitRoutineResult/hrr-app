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

interface OnboardingQ2Props {
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  selectedTimeSlots: Set<string>;
  onTimeSlotsChange: (timeSlots: Set<string>) => void;
}

interface TimeSlotOption {
  id: string;
  timeRange: string;
  description: string;
}

const TIME_SLOT_OPTIONS: TimeSlotOption[] = [
  {
    id: 'EARLY_MORNING',
    timeRange: '오전 05:00 - 오전 09:00',
    description: '상쾌하게 하루를 시작하며 출근·등교 전 참여해요',
  },
  {
    id: 'MORNING',
    timeRange: '오전 09:00 - 오후 12:00',
    description: '집중력 좋은 시간에 가벼운 활동을 실행해요',
  },
  {
    id: 'LUNCH',
    timeRange: '오후 12:00 - 오후 02:00',
    description: '식사 후 짧게 참여하며 휴식과 함께 즐겨요',
  },
  {
    id: 'AFTERNOON',
    timeRange: '오후 02:00 - 오후 06:00',
    description: '일과 사이에 활력을 더하며 꾸준히 이어가요',
  },
  {
    id: 'EVENING',
    timeRange: '오후 06:00 - 오후 09:00',
    description: '퇴근·하교 후 여유롭게 친구와 함께 해요',
  },
  {
    id: 'NIGHT',
    timeRange: '오후 09:00 - 오전 12:00',
    description: '하루를 마무리하며 오늘을 체크해요',
  },
  {
    id: 'LATE_NIGHT',
    timeRange: '오전 12:00 - 오전 05:00',
    description: '야행성 혹은 해외에서도 함께 해요',
  },
];

export const OnboardingQ2: React.FC<OnboardingQ2Props> = ({
  onBack,
  onSkip,
  onNext,
  selectedTimeSlots,
  onTimeSlotsChange,
}) => {
  const handleTimeSlotToggle = (id: string) => {
    const newSelected = new Set(selectedTimeSlots);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onTimeSlotsChange(newSelected);
  };

  const isNextEnabled = selectedTimeSlots.size > 0;

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
      <ProgressBar currentStep={2} totalSteps={4} />

      <View style={styles.content}>
        {/* Q2 타이틀 */}
        <View style={styles.q2TitleContainer}>
          <Text variant="header1" color={colors.text.primary} style={styles.q2Title}>
            챌린지에 참여하기 좋은{'\n'}시간대는 언제인가요?
          </Text>
          <Text variant="xsReg" color={colors.text.tertiary} style={styles.q2Subtitle}>
            가능한 시간대를 모두 선택해 주세요
          </Text>
        </View>

        {/* 선택 옵션들 */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {TIME_SLOT_OPTIONS.map((option) => {
            const isSelected = selectedTimeSlots.has(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.timeSlotCard,
                  isSelected && styles.timeSlotCardSelected,
                ]}
                onPress={() => handleTimeSlotToggle(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.timeRangeContainer}>
                  {(() => {
                    const [startTime, endTime] = option.timeRange.split(' - ');
                    return (
                      <>
                        <Text variant="smMd" color={colors.text.secondary} style={styles.timeText}>
                          {startTime}
                        </Text>
                        <View style={styles.timeSeparator} />
                        <Text variant="smMd" color={colors.text.secondary} style={styles.timeText}>
                          {endTime}
                        </Text>
                      </>
                    );
                  })()}
                </View>
                <Text variant="xxs" color={colors.text.tertiary} style={styles.description}>
                  {option.description}
                </Text>
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
    justifyContent: 'space-between',
  },
  q2TitleContainer: {
    alignItems: 'flex-start',
    paddingTop: verticalScale(39),
    paddingBottom: verticalScale(39),
  },
  q2Title: {
    textAlign: 'left',
    lineHeight: verticalScale(32),
    marginBottom: verticalScale(12),
  },
  q2Subtitle: {
    textAlign: 'left',
    lineHeight: verticalScale(22),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: verticalScale(0),
    paddingBottom: verticalScale(39),
    gap: scale(10),
    alignItems: 'center',
  },
  timeSlotCard: {
    width: '100%',
    maxWidth: scale(350),
    height: verticalScale(80),
    borderRadius: scale(20),
    borderWidth: scale(1.5),
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    justifyContent: 'center',
  },
  timeSlotCardSelected: {
    borderColor: colors.primary.main,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  timeText: {
    lineHeight: verticalScale(20),
  },
  timeSeparator: {
    width: scale(8),
    height: verticalScale(1),
    backgroundColor: colors.button,
    marginHorizontal: scale(8),
  },
  description: {
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
  disabledButton: {
    opacity: 0.5,
  },
});

