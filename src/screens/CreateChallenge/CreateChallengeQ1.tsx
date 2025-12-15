import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { OptionGroup } from '../../components/onboarding/OptionGroup';
import { colors } from '../../design/tokens';
import { useCreateChallenge } from '../../contexts/CreateChallengeContext';
import PublicSelectedIcon from '../../../assets/icons/challenge-create/hobby-together-selected.svg';
import PublicUnselectedIcon from '../../../assets/icons/challenge-create/hobby-together-unselected.svg';
import PrivateSelectedIcon from '../../../assets/icons/challenge-create/private-selected.svg';
import PrivateUnselectedIcon from '../../../assets/icons/challenge-create/private-unselected.svg';

type CreateChallengeQ1NavigationProp = StackNavigationProp<RootStackParamList>;

interface PrivacyOption {
  id: 'public' | 'private';
  title: string;
  description: string;
  SelectedIcon: React.ComponentType<{ width?: number; height?: number }>;
  UnselectedIcon: React.ComponentType<{ width?: number; height?: number }>;
}

const PRIVACY_OPTIONS: PrivacyOption[] = [
  {
    id: 'public',
    title: '공개 챌린지',
    description: '다양한 챌린저와 챌린지를 수행하면서 동기부여를 받아요',
    SelectedIcon: PublicSelectedIcon,
    UnselectedIcon: PublicUnselectedIcon,
  },
  {
    id: 'private',
    title: '비공개 챌린지',
    description: '비밀번호를 설정해 프라이빗하게 챌린지를 진행해요',
    SelectedIcon: PrivateSelectedIcon,
    UnselectedIcon: PrivateUnselectedIcon,
  },
];

const categoryMap: Record<string, 'HEALTH' | 'STUDY' | 'HOBBY' | 'CAREER' | 'HABIT'> = {
  '운동': 'HEALTH',
  '학업': 'STUDY',
  '취미': 'HOBBY',
  '취업준비': 'CAREER',
  '생활습관': 'HABIT',
};

export const CreateChallengeQ1 = () => {
  const navigation = useNavigation<CreateChallengeQ1NavigationProp>();
  const { data, updateData, resetData } = useCreateChallenge();

  // 로컬 state 초기값 (항상 빈 값으로 시작)
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<'public' | 'private' | ''>('');

  // 초기화 여부 체크 (처음 진입 시에만 초기화, 뒤로가기로 돌아왔을 때는 초기화하지 않음)
  const [hasInitialized, setHasInitialized] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      if (!hasInitialized) {
        resetData();
        setHasInitialized(true);
        // 초기화 후 로컬 state도 빈 값으로 설정
        setSelectedCategory('');
        setSelectedPrivacy('');
      } else {
        // 뒤로가기로 돌아왔을 때는 Context 값으로 복원
        if (data.category) {
          const categoryKey = Object.keys(categoryMap).find(key => categoryMap[key] === data.category);
          if (categoryKey) {
            setSelectedCategory(categoryKey);
          }
        } else {
          setSelectedCategory('');
        }
        // 카테고리 및 공개/비공개 설정이 모두 있으면 복원
        if (data.category && data.isPublic !== null) {
          setSelectedPrivacy(data.isPublic ? 'public' : 'private');
        } else {
          setSelectedPrivacy('');
        }
      }
    }, [resetData, hasInitialized, data.category, data.isPublic, data.password])
  );

  const categoryOptions = ['운동', '학업', '취미', '취업준비', '생활습관'];

  const handleCategorySelect = (option: string) => {
    // 두 번 클릭 시 선택 취소
    if (selectedCategory === option) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(option);
    }
  };

  const handlePrivacySelect = (privacyId: 'public' | 'private') => {
    // 두 번 클릭 시 선택 취소
    if (selectedPrivacy === privacyId) {
      setSelectedPrivacy('');
    } else {
      setSelectedPrivacy(privacyId);
    }
  };

  const isNextEnabled = selectedCategory !== '' && selectedPrivacy !== '';

  const handleNext = () => {
    if (isNextEnabled) {
      // 다음 버튼 클릭 시 Context에 저장
      const apiCategory = categoryMap[selectedCategory];
      const isPublic = selectedPrivacy === 'public';

      updateData({
        category: apiCategory,
        isPublic: isPublic,
      });

      navigation.navigate('CreateChallengeQ2');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <Header
        onBack={() => navigation.goBack()}
        title="챌린지 개설"
      />

      {/* 진행률 표시줄 */}
      <ProgressBar currentStep={1} totalSteps={4} />

      <View style={styles.content}>
        {/* 타이틀 */}
        <View style={styles.titleContainer}>
          <Text variant="header1" color={colors.text.primary} style={styles.title}>
            챌린지 유형을 선택해 주세요
          </Text>
        </View>

        {/* 선택 옵션들 */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 카테고리 선택 */}
          <OptionGroup
            title="카테고리"
            options={categoryOptions}
            selectedOptions={selectedCategory ? [selectedCategory] : []}
            onOptionSelect={handleCategorySelect}
            multiSelect={false}
          />

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 공개/비공개 선택 */}
          <View style={styles.privacySection}>
            {PRIVACY_OPTIONS.map((option) => {
              const isSelected = selectedPrivacy === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.privacyCard,
                    isSelected && styles.privacyCardSelected,
                  ]}
                  onPress={() => handlePrivacySelect(option.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    {isSelected ? (
                      <option.SelectedIcon width={24} height={24} />
                    ) : (
                      <option.UnselectedIcon width={24} height={24} />
                    )}
                  </View>
                  <View style={styles.privacyTextContainer}>
                    <Text variant="smMd" color={colors.text.secondary} style={styles.privacyTitle}>
                      {option.title}
                    </Text>
                    <Text variant="xxs" color={colors.text.tertiary} style={styles.privacyDescription}>
                      {option.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <Button
          variant={isNextEnabled ? 'black' : 'gray'}
          size="medium"
          onPress={handleNext}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleContainer: {
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingBottom: 52,
  },
  title: {
    textAlign: 'left',
    lineHeight: 32,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginBottom: 36,
  },
  privacySection: {
    gap: 10,
  },
  privacyCard: {
    width: '100%',
    height: 80,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyCardSelected: {
    borderColor: colors.primary.main,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    marginBottom: 4,
    lineHeight: 20,
  },
  privacyDescription: {
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
});
