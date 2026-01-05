import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Text } from '../common/Text';
import { colors, typography, spacing, radius } from '../../design/tokens';
import { ReportReason, ReportReasonStep } from './ReportReasonStep';
import { ReportDetailStep } from './ReportDetailStep';
import BackIcon from '../../../assets/icons/back.svg';

interface ReportUserBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, detail: string) => void;
}

const REPORT_REASONS: ReportReason[] = [
    { key: 'ABUSIVE_LANGUAGE', label: '욕설 및 비하성 사용' },
    { key: 'SEXUAL_OR_OBSCENE', label: '성희롱 및 불쾌한 발언' },
    { key: 'SPAM_OR_SCAM', label: '스팸 또는 도배' },
    { key: 'PERSONAL_INFO_REQUEST', label: '개인정보 노출 요구' },
    { key: 'ILLEGAL_CONTENT_SHARE', label: '불법 및 유해 콘텐츠 공유' },
    { key: 'OTHER', label: '기타 (직접 입력)' },
];

export const ReportUserBottomSheet: React.FC<ReportUserBottomSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [detailText, setDetailText] = useState('');

  const handleClose = () => {
    // Reset state on close
    setTimeout(() => {
        setStep(1);
        setSelectedReason(null);
        setDetailText('');
    }, 300); // After animation
    onClose();
  };
  
  const handleNext = () => {
    if (selectedReason) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (selectedReason) {
        onSubmit(selectedReason, detailText);
        handleClose();
    }
  };

  const isStep1Nextable = selectedReason !== null;
  const isStep2Submittable = detailText.trim().length > 0;

  const renderFooter = () => (
    <>
      <View style={styles.buttonDivider} />
      <View style={styles.buttonContainer}>
        <Button
            variant={ (step === 1 && isStep1Nextable) || (step === 2 && isStep2Submittable) ? 'black' : 'gray'}
            onPress={step === 1 ? handleNext : handleSubmit}
            disabled={ (step === 1 && !isStep1Nextable) || (step === 2 && !isStep2Submittable) }
        >
          신고하기
        </Button>
      </View>
    </>
  );

    return (
      <BottomSheet visible={visible} onClose={handleClose} height={step === 1 ? 500 : 400} footer={renderFooter()}>
        <View style={styles.header}>
          {step === 2 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <BackIcon />
              </TouchableOpacity>
          )}
          <Text variant="header4" color={colors.text.tertiary}>
            {step === 1 ? '사용자 신고 사유' : '신고할 문제를 작성해주세요'}
          </Text>
          {step === 2 && <View style={styles.backButton} />} 
        </View>
        <View style={styles.headerDivider} />
        
        {step === 1 ? (
          <ReportReasonStep 
              reasons={REPORT_REASONS}
              selectedReason={selectedReason}
              onSelectReason={setSelectedReason}
          />
        ) : (
          <ReportDetailStep 
              text={detailText}
              onChangeText={setDetailText}
          />
        )}
      </BottomSheet>
    );};

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: spacing.xs,
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  buttonDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
});
