import React, { useState } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import { OnboardingIntro } from './OnboardingIntro';
import { OnboardingQ1 } from './OnboardingQ1';
import { OnboardingQ2 } from './OnboardingQ2';
import { OnboardingQ3 } from './OnboardingQ3';
import { OnboardingQ4 } from './OnboardingQ4';
import { OnboardingLoading } from './OnboardingLoading';
import { OnboardingResultScreen } from './OnboardingResultScreen';
import { RecommendedChallenge } from '../../libs/api/challenge';

export type OnboardingStep = 'intro' | 'q1' | 'q2' | 'q3' | 'q4' | 'loading' | 'challengeRecommendation' | 'end';

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('intro');

  // Q1 상태
  const [q1Gender, setQ1Gender] = useState<string>('');
  const [q1Age, setQ1Age] = useState<string>('');
  const [q1Occupation, setQ1Occupation] = useState<string>('');

  // Q2 상태
  const [q2TimeSlots, setQ2TimeSlots] = useState<Set<string>>(new Set());

  // Q3 상태
  const [q3Categories, setQ3Categories] = useState<string[]>([]);

  // Q4 상태
  const [q4Goal, setQ4Goal] = useState<string>('');

  // 추천 챌린지 결과
  const [recommendedChallenges, setRecommendedChallenges] = useState<RecommendedChallenge[]>([]);
  // API 재호출을 위한 refresh key
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSkip = () => {
    // 홈 화면으로 이동
    onComplete?.();
  };

  const handleStart = () => {
    // 모든 선택지 초기화
    setQ1Gender('');
    setQ1Age('');
    setQ1Occupation('');
    setQ2TimeSlots(new Set());
    setQ3Categories([]);
    setQ4Goal('');
    setCurrentStep('q1');
  };

  const handleBack = () => {
    setCurrentStep('intro');
  };

  const handleQ1Next = () => {
    setCurrentStep('q2');
  };

  const handleQ2Back = () => {
    setCurrentStep('q1');
  };

  const handleQ2Next = () => {
    setCurrentStep('q3');
  };

  const handleQ3Back = () => {
    setCurrentStep('q2');
  };

  const handleQ3Next = () => {
    setCurrentStep('q4');
  };

  const handleQ4Back = () => {
    setCurrentStep('q3');
  };

  const handleQ4Next = () => {
    // TODO: 온보딩 완료 처리
    setCurrentStep('loading');
  };

  const handleLoadingBack = () => {
    setCurrentStep('q4');
  };

  const handleLoadingComplete = () => {
    setCurrentStep('challengeRecommendation');
  };

  const handleGoHome = () => {
    // 홈 화면으로 이동
    onComplete?.();
  };

  const handleRefresh = () => {
    // 추천 챌린지 API 재호출
    setRefreshKey((prev) => prev + 1);
    setCurrentStep('loading');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <OnboardingIntro
            onSkip={handleSkip}
            onStart={handleStart}
          />
        );
      case 'q1':
        return (
          <OnboardingQ1
            onBack={handleBack}
            onSkip={handleSkip}
            onNext={handleQ1Next}
            selectedGender={q1Gender}
            selectedAge={q1Age}
            selectedOccupation={q1Occupation}
            onGenderChange={setQ1Gender}
            onAgeChange={setQ1Age}
            onOccupationChange={setQ1Occupation}
          />
        );
      case 'q2':
        return (
          <OnboardingQ2
            onBack={handleQ2Back}
            onSkip={handleSkip}
            onNext={handleQ2Next}
            selectedTimeSlots={q2TimeSlots}
            onTimeSlotsChange={setQ2TimeSlots}
          />
        );
      case 'q3':
        return (
          <OnboardingQ3
            onBack={handleQ3Back}
            onSkip={handleSkip}
            onNext={handleQ3Next}
            selectedCategories={q3Categories}
            onCategoriesChange={setQ3Categories}
          />
        );
      case 'q4':
        return (
          <OnboardingQ4
            onBack={handleQ4Back}
            onSkip={handleSkip}
            onNext={handleQ4Next}
            selectedGoal={q4Goal}
            onGoalChange={setQ4Goal}
          />
        );
      case 'loading':
        return (
          <OnboardingLoading
            onBack={handleLoadingBack}
            onComplete={handleLoadingComplete}
            q1Gender={q1Gender}
            q1Age={q1Age}
            q1Occupation={q1Occupation}
            q2TimeSlots={q2TimeSlots}
            q3Categories={q3Categories}
            q4Goal={q4Goal}
            onSetRecommendedChallenges={setRecommendedChallenges}
            refreshKey={refreshKey}
          />
        );
      case 'challengeRecommendation':
        return (
          <OnboardingResultScreen
            onGoHome={handleGoHome}
            onRefresh={handleRefresh}
            recommendedChallenges={recommendedChallenges}
          />
        );
      case 'end':
        // TODO: 추천 결과 화면 구현
        return null;
      default:
        return null;
    }
  };

  return renderCurrentStep();
};
