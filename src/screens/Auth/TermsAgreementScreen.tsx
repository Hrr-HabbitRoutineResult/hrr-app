import React, { useState, useEffect } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { colors } from '../../design/tokens';
import { agreeTerms } from '../../libs/api/auth';
import CheckboxCheckedIcon from '../../../assets/icons/checkbox-checked.svg';
import CheckboxUncheckedIcon from '../../../assets/icons/checkbox-unchecked.svg';
import RadioCheckedIcon from '../../../assets/icons/radio-checked.svg';
import RadioUncheckedIcon from '../../../assets/icons/radio-unchecked.svg';
import ChevronRightIcon from '../../../assets/icons/chevron-right-grey.svg';

interface TermsAgreementScreenProps {
  onBack: () => void;
  onNext: () => void;
}

type TermId = 'age' | 'service' | 'privacy' | 'marketing';

interface Term {
  id: TermId;
  label: string;
  required: boolean;
}

const TERMS: Term[] = [
  { id: 'age', label: '만 14세 이상입니다.', required: true },
  { id: 'service', label: '서비스 이용 약관', required: true },
  { id: 'privacy', label: '개인정보 수집 및 이용 동의', required: true },
  { id: 'marketing', label: '마케팅 개인정보 제3자 제공 동의', required: false },
];

// 로컬 약관 ID를 서버 약관 ID로 매핑
const TERM_ID_MAP: Record<TermId, number> = {
  'age': 1,
  'service': 2,
  'privacy': 3,
  'marketing': 4,
};

export const TermsAgreementScreen: React.FC<TermsAgreementScreenProps> = ({
  onBack,
  onNext,
}) => {
  const [agreedTerms, setAgreedTerms] = useState<Set<TermId>>(new Set());
  const [isAllAgreed, setIsAllAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 컴포넌트 마운트 시 저장된 약관 선택 상태 복원
  useEffect(() => {
    const restoreAgreedTerms = async () => {
      try {
        // 이전에 선택했던 약관 ID 배열 복원
        const savedAgreedTermsJson = await AsyncStorage.getItem('savedAgreedTerms');
        if (savedAgreedTermsJson) {
          const savedTermIds = JSON.parse(savedAgreedTermsJson) as TermId[];
          setAgreedTerms(new Set(savedTermIds));
        }
      } catch (error) {
        // 복원 실패 시 무시
      }
    };
    restoreAgreedTerms();
  }, []);

  // 필수 약관 체크
  const requiredTerms = TERMS.filter((term) => term.required);
  const isAllRequiredAgreed = requiredTerms.every((term) =>
    agreedTerms.has(term.id)
  );

  // 전체 동의 상태 업데이트
  useEffect(() => {
    const allTermsIds = new Set(TERMS.map((term) => term.id));
    setIsAllAgreed(
      agreedTerms.size === TERMS.length &&
      Array.from(agreedTerms).every((id) => allTermsIds.has(id))
    );
  }, [agreedTerms]);

  // 약관 선택 상태가 변경될 때마다 AsyncStorage에 저장
  useEffect(() => {
    const saveAgreedTerms = async () => {
      try {
        if (agreedTerms.size > 0) {
          // 선택한 약관 ID 배열을 JSON으로 저장
          const agreedTermsArray = Array.from(agreedTerms);
          await AsyncStorage.setItem('savedAgreedTerms', JSON.stringify(agreedTermsArray));
        } else {
          // 선택한 약관이 없으면 저장된 값 제거
          await AsyncStorage.removeItem('savedAgreedTerms');
        }
      } catch (error) {
        // 저장 실패 시 무시
      }
    };
    saveAgreedTerms();
  }, [agreedTerms]);

  // 전체 동의 토글
  const handleToggleAll = () => {
    if (isAllAgreed) {
      setAgreedTerms(new Set());
    } else {
      const allTermIds = TERMS.map((term) => term.id);
      setAgreedTerms(new Set(allTermIds));
    }
  };

  // 개별 약관 토글
  const handleToggleTerm = (termId: TermId) => {
    const newAgreed = new Set(agreedTerms);
    if (newAgreed.has(termId)) {
      newAgreed.delete(termId);
    } else {
      newAgreed.add(termId);
    }
    setAgreedTerms(newAgreed);
  };

  /**
   * 선택한 약관 ID 배열을 서버에 전달해 약관 동의 처리
   */
  const handleSubmit = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      Alert.alert('오류', '로그인 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    // 로컬 약관 ID를 서버 약관 ID로 매핑
    const agreedTermIds = Array.from(agreedTerms).map((termId) => TERM_ID_MAP[termId]);

    try {
      setIsSubmitting(true);

      // 약관 동의 API 호출
      const response = await agreeTerms(accessToken, agreedTermIds);

      if (response.isSuccess) {
        // 약관 동의 완료 플래그 저장
        await AsyncStorage.setItem('termsAgreed', 'true');
        setTimeout(() => {
          onNext();
        }, 100);
      } else {
        Alert.alert('오류', response.message || '약관 동의에 실패했습니다.');
      }
    } catch (apiError: any) {
      // API 에러 발생 시 에러 메시지 표시
      Alert.alert('오류', apiError?.response?.data?.message || '약관 동의 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTermDetail = (termId: TermId) => {
    // TODO: 약관 상세 화면으로 이동하기
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <Header
        title="회원가입"
        onBack={onBack}
        showDivider
      />

      {/* 컨텐츠 */}
      <View style={styles.content}>
        {/* 상단 컨텐츠 */}
        <View style={styles.topContent}>
          {/* 타이틀 */}
          <View style={styles.titleContainer}>
            <Text variant="header1" color={colors.text.primary} style={styles.title}>
              서비스 이용 약관에
            </Text>
            <Text variant="header1" color={colors.text.primary} style={styles.title}>
              <Text variant="header1" color={colors.primary.sub}>
                동의
              </Text>
              가 필요해요
            </Text>
          </View>

          {/* 디스크립션 */}
          <View style={styles.descriptionContainer}>
            <Text variant="xxs" color={colors.text.tertiary} style={styles.description}>
              '선택' 항목에 동의하지 않아도 서비스 이용이 가능합니다.
            </Text>
            <Text variant="xxs" color={colors.text.tertiary} style={styles.description}>
              개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으며
            </Text>
            <Text variant="xxs" color={colors.text.tertiary} style={styles.description}>
              동의 거부 시 회원제 서비스 이용이 제한됩니다.
            </Text>
          </View>
        </View>

        {/* 약관 동의 섹션 */}
        <View style={styles.agreementSection}>
          {/* 전체 동의  */}
          <TouchableOpacity
            style={styles.allAgreeContainer}
            onPress={handleToggleAll}
            activeOpacity={0.7}
          >
            <View style={styles.allAgreeContent}>
              {isAllAgreed ? (
                <RadioCheckedIcon width={24} height={24} />
              ) : (
                <RadioUncheckedIcon width={24} height={24} />
              )}
              <Text variant="header4" color={colors.text.primary} style={styles.allAgreeText}>
                모든 약관에 동의합니다
              </Text>
            </View>
          </TouchableOpacity>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 개별 약관 */}
          <View style={styles.termsList}>
            {TERMS.map((term) => {
              const isAgreed = agreedTerms.has(term.id);
              return (
                <TouchableOpacity
                  key={term.id}
                  style={styles.termItem}
                  onPress={() => handleToggleTerm(term.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.termContent}>
                    {isAgreed ? (
                      <CheckboxCheckedIcon width={12} height={10} />
                    ) : (
                      <CheckboxUncheckedIcon width={12} height={10} />
                    )}
                    <View style={styles.termTextContainer}>
                      <Text variant="md" color={colors.text.primary} style={styles.termText}>
                        {term.label}
                      </Text>
                      <Text
                        variant="xsMd"
                        color={colors.text.tertiary}
                        style={styles.termRequired}
                      >
                        ({term.required ? '필수' : '선택'})
                      </Text>
                    </View>
                  </View>
                  {term.id !== 'age' && (
                    <TouchableOpacity
                      onPress={() => handleViewTermDetail(term.id)}
                      activeOpacity={0.7}
                    >
                      <ChevronRightIcon width={4} height={8} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* 다음 버튼 */}
      <View style={styles.buttonContainer}>
        <Button
          variant={isAllRequiredAgreed ? 'black' : 'gray'}
          size="medium"
          onPress={handleSubmit}
          disabled={!isAllRequiredAgreed || isSubmitting}
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
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(40),
    justifyContent: 'space-between',
  },
  topContent: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: verticalScale(28),
  },
  title: {
    lineHeight: verticalScale(30),
    includeFontPadding: false,
  },
  descriptionContainer: {
    marginBottom: verticalScale(32),
  },
  description: {
    lineHeight: verticalScale(18),
    includeFontPadding: false,
  },
  agreementSection: {
    marginBottom: verticalScale(60),
  },
  allAgreeContainer: {
    marginBottom: verticalScale(0),
  },
  allAgreeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allAgreeText: {
    flex: 1,
    marginLeft: scale(12),
    lineHeight: verticalScale(16),
  },
  divider: {
    height: verticalScale(1),
    backgroundColor: colors.line,
    marginTop: verticalScale(12),
    marginBottom: verticalScale(30),
  },
  termsList: {
    gap: scale(20),
    marginLeft: scale(10),
    marginRight: scale(16),
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  termContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  termTextContainer: {
    marginLeft: scale(14),
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  termText: {
    marginRight: scale(4),
    lineHeight: verticalScale(16),
  },
  termRequired: {
    lineHeight: verticalScale(13),
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
});
