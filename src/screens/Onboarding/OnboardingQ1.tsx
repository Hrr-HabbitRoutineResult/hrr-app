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
  const genderOptions = [
    { id: 'MALE', label: '남성' },
    { id: 'FEMALE', label: '여성' },
  ];

  const ageOptions = [
    { id: 'TEENS', label: '10대' },
    { id: 'TWENTIES', label: '20대' },
    { id: 'THIRTIES', label: '30대' },
    { id: 'FORTIES', label: '40대' },
    { id: 'FIFTIES_PLUS', label: '50대 이상' },
  ];

  const occupationOptions = [
    { id: 'STUDENT_MIDDLE_HIGH', label: '중고등학생' },
    { id: 'STUDENT_UNIVERSITY', label: '대학생' },
    { id: 'JOB_SEEKER', label: '취준생' },
    { id: 'EMPLOYEE', label: '직장인' },
    { id: 'HOMEMAKER', label: '주부' },
    { id: 'ETC', label: '기타' },
  ];

  const isNextEnabled = selectedGender && selectedAge && selectedOccupation;

  return (
    <SafeAreaView style={styles.container}>
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
            onOptionSelect={(id) => onGenderChange(selectedGender === id ? '' : id)}
          />

          <OptionGroup
            title="연령대"
            options={ageOptions}
            selectedOptions={selectedAge ? [selectedAge] : []}
            onOptionSelect={(id) => onAgeChange(selectedAge === id ? '' : id)}
          />

          <OptionGroup
            title="직업"
            options={occupationOptions}
            selectedOptions={selectedOccupation ? [selectedOccupation] : []}
            onOptionSelect={(id) => onOccupationChange(selectedOccupation === id ? '' : id)}
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
  q1TitleContainer: {
    alignItems: 'flex-start',
    paddingTop: verticalScale(39),
    marginBottom: verticalScale(48),
  },
  q1Title: {
    textAlign: 'left',
    lineHeight: verticalScale(32),
    marginBottom: verticalScale(12),
  },
  q1Subtitle: {
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
