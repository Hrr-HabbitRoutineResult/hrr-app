import React, { useState } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { OptionGroup } from '../../components/onboarding/OptionGroup';
import { colors } from '../../design/tokens';

interface OnboardingQ3Props {
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export const OnboardingQ3: React.FC<OnboardingQ3Props> = ({
  onBack,
  onSkip,
  onNext,
  selectedCategories,
  onCategoriesChange,
}) => {
  const categoryOptions = [
    { id: 'HEALTH', label: '운동' },
    { id: 'STUDY', label: '학업' },
    { id: 'HOBBY', label: '취미' },
    { id: 'CAREER', label: '취업준비' },
    { id: 'HABIT', label: '생활습관' },
  ];

  const MAX_SELECTIONS = 3;

  const handleCategorySelect = (id: string) => {
    if (selectedCategories.includes(id)) {
      // 이미 선택된 카테고리 제거
      onCategoriesChange(selectedCategories.filter((item) => item !== id));
    } else {
      // 최대 3개까지만 선택 가능
      if (selectedCategories.length < MAX_SELECTIONS) {
        onCategoriesChange([...selectedCategories, id]);
      }
    }
  };

  const isNextEnabled = selectedCategories.length > 0;

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
      <ProgressBar currentStep={3} totalSteps={4} />

      <View style={styles.content}>
        {/* Q3 타이틀 */}
        <View style={styles.q3TitleContainer}>
          <Text variant="header1" color={colors.text.primary} style={styles.q3Title}>
            평소 관심있는 분야는 {'\n'}무엇인가요?
          </Text>
          <Text variant="xsReg" color={colors.text.tertiary} style={styles.q3Subtitle}>
            최대 3개까지 선택할 수 있어요
          </Text>
        </View>

        {/* 선택 옵션들 */}
        <View style={styles.optionsContainer}>
          <OptionGroup
            title="카테고리"
            options={categoryOptions}
            selectedOptions={selectedCategories}
            onOptionSelect={handleCategorySelect}
            multiSelect={true}
          />
        </View>

        {/* 다음 버튼 */}
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
  q3TitleContainer: {
    alignItems: 'flex-start',
    paddingTop: verticalScale(39),
    marginBottom: verticalScale(39),
  },
  q3Title: {
    textAlign: 'left',
    marginBottom: verticalScale(12),
  },
  q3Subtitle: {
    textAlign: 'left',
    lineHeight: verticalScale(22),
  },
  optionsContainer: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

