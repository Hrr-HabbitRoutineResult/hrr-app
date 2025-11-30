import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { colors } from '../../design/tokens';
import BackIcon from '../../../assets/icons/back.svg';
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

export const TermsAgreementScreen: React.FC<TermsAgreementScreenProps> = ({
  onBack,
  onNext,
}) => {
  const [agreedTerms, setAgreedTerms] = useState<Set<TermId>>(new Set());
  const [isAllAgreed, setIsAllAgreed] = useState(false);

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

  // 전체 동의 토글
  const handleToggleAll = () => {
    if (isAllAgreed) {
      setAgreedTerms(new Set());
    } else {
      setAgreedTerms(new Set(TERMS.map((term) => term.id)));
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

  // 약관 상세 보기 (임시)
  const handleViewTermDetail = (termId: TermId) => {
    // TODO: 약관 상세 화면으로 이동하기
    console.log('약관 상세 보기:', termId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon width={9} height={18} />
        </TouchableOpacity>
        <Text variant="md" color={colors.text.primary} style={styles.headerTitle}>
          회원가입
        </Text>
        <View style={styles.backButtonPlaceholder} />
      </View>
      {/* 헤더 구분선 */}
      <View style={styles.headerDivider} />

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
          onPress={onNext}
          disabled={!isAllRequiredAgreed}
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'space-between',
  },
  topContent: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 28,
  },
  title: {
    lineHeight: 30,
    includeFontPadding: false,
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  description: {
    lineHeight: 18,
    includeFontPadding: false,
  },
  agreementSection: {
    marginBottom: 60,
  },
  allAgreeContainer: {
    marginBottom: 0,
  },
  allAgreeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allAgreeText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginTop: 12,
    marginBottom: 30,
  },
  termsList: {
    gap: 20,
    marginLeft: 10,
    marginRight: 16,
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
    marginLeft: 14,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  termText: {
    marginRight: 4,
    lineHeight: 16,
  },
  termRequired: {
    lineHeight: 13,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
});

