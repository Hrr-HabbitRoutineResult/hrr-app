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

interface OnboardingQ1Props {
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  selectedGender: string;
  selectedAge: string;
  selectedOccupation: string;
  onGenderChange: (gender: string) => void;
  onAgeChange: (age: string) => void;
  onOccupationChange: (occupation: string) => void;
}

export const OnboardingQ1: React.FC<OnboardingQ1Props> = ({
  onBack,
  onSkip,
  onNext,
  selectedGender,
  selectedAge,
  selectedOccupation,
  onGenderChange,
  onAgeChange,
  onOccupationChange,
}) => {

  const genderOptions = ['남성', '여성'];
  const ageOptions = ['10대', '20대', '30대', '40대', '50대 이상'];
  const occupationOptions = ['중고등학생', '대학생', '취준생', '직장인', '주부', '기타'];

  const isNextEnabled = selectedGender && selectedAge && selectedOccupation;

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
      <ProgressBar currentStep={1} totalSteps={4} />

      <View style={styles.content}>
        {/* Q1 타이틀 */}
        <View style={styles.q1TitleContainer}>
          <Text variant="header1" color={colors.text.primary} style={styles.q1Title}>
            안녕하세요!
          </Text>
          <Text variant="xsReg" color={colors.text.tertiary} style={styles.q1Subtitle}>
            알맞은 챌린지를 알려드리기 위해 몇 가지 물어볼 게 있어요
          </Text>
        </View>

        {/* 선택 옵션들 */}
        <View style={styles.optionsContainer}>
          <OptionGroup
            title="성별"
            options={genderOptions}
            selectedOptions={selectedGender ? [selectedGender] : []}
            onOptionSelect={(option) => onGenderChange(selectedGender === option ? '' : option)}
          />

          <OptionGroup
            title="연령대"
            options={ageOptions}
            selectedOptions={selectedAge ? [selectedAge] : []}
            onOptionSelect={(option) => onAgeChange(selectedAge === option ? '' : option)}
          />

          <OptionGroup
            title="직업"
            options={occupationOptions}
            selectedOptions={selectedOccupation ? [selectedOccupation] : []}
            onOptionSelect={(option) => onOccupationChange(selectedOccupation === option ? '' : option)}
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
  q1TitleContainer: {
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingBottom: 40,
  },
  q1Title: {
    textAlign: 'left',
    lineHeight: 32,
    marginBottom: 12,
  },
  q1Subtitle: {
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
