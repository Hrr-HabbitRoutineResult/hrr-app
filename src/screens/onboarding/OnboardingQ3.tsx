import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { OptionGroup } from '../../components/onboarding/OptionGroup';
import { colors } from '../../design/tokens';
import BackIcon from '../../../assets/icons/back.svg';

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
  const categoryOptions = ['운동', '학업', '취미', '취업준비', '생활습관'];

  const MAX_SELECTIONS = 3;

  const handleCategorySelect = (option: string) => {
    if (selectedCategories.includes(option)) {
      // 이미 선택된 카테고리 제거
      onCategoriesChange(selectedCategories.filter((item) => item !== option));
    } else {
      // 최대 3개까지만 선택 가능
      if (selectedCategories.length < MAX_SELECTIONS) {
        onCategoriesChange([...selectedCategories, option]);
      }
    }
  };

  const isNextEnabled = selectedCategories.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon width={9} height={18} />
        </TouchableOpacity>
        <View style={styles.backButtonPlaceholder} />
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text variant="xsReg" color={colors.text.primary}>
            건너뛰기
          </Text>
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: 24,
  },
  skipButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  q3TitleContainer: {
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingBottom: 40,
  },
  q3Title: {
    textAlign: 'left',
    lineHeight: 32,
    marginBottom: 12,
  },
  q3Subtitle: {
    textAlign: 'left',
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
    paddingTop: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

