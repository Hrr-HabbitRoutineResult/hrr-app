import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Platform, Keyboard, Alert, KeyboardAvoidingView } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Text } from './Text';
import { colors, typography } from '../../design/tokens';
import { ReportReason } from '../../libs/api/challenge';
import RadioCheckedIcon from '../../../assets/icons/radio-checked.svg';
import RadioUncheckedIcon from '../../../assets/icons/radio-unchecked.svg';

interface ReportBottomSheetProps {
  visible: boolean;
  type: 'post' | 'user'; // 게시글 신고 or 사용자 신고
  onClose: () => void;
  onSubmit: (reason: ReportReason, description: string) => Promise<void>;
}

export const ReportBottomSheet: React.FC<ReportBottomSheetProps> = ({
  visible,
  type,
  onClose,
  onSubmit,
}) => {
  const [selectedReportReason, setSelectedReportReason] = useState<ReportReason | null>(null);
  const [reportReasonDetail, setReportReasonDetail] = useState('');
  const [isTextInputMode, setIsTextInputMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 신고 사유 목록
  const reportReasons: Array<{ label: string; value: ReportReason }> = [
    { label: '욕설 및 비속어 사용', value: 'ABUSIVE_LANGUAGE' },
    { label: '성희롱 및 음란 발언', value: 'SEXUAL_OR_OBSCENE' },
    { label: '스팸 또는 도배', value: 'SPAM_OR_SCAM' },
    { label: '개인정보 노출 요구', value: 'PERSONAL_INFO_REQUEST' },
    { label: '불법 및 유해 콘텐츠 공유', value: 'ILLEGAL_CONTENT_SHARE' },
    { label: '기타 (직접 입력)', value: 'OTHER' },
  ];

  // 신고 사유 선택
  const handleSelectReportReason = (reason: ReportReason) => {
    setSelectedReportReason(reason);
  };

  // 신고 버튼 활성화 여부
  const isReportButtonEnabled = () => {
    if (!selectedReportReason) return false;
    // 기타 선택 시 텍스트 입력 모드일 때는 글자가 있어야 함
    if (isTextInputMode) {
      return reportReasonDetail.trim().length > 0;
    }
    // 그 외에는 선택만 하면 활성화
    return true;
  };

  // 바텀시트 닫기
  const handleClose = () => {
    // 텍스트 입력 모드에서 작성 중인 내용이 있으면 경고
    if (isTextInputMode && reportReasonDetail.trim().length > 0) {
      Alert.alert(
        '작성 취소',
        '작성 중이던 내용이 사라집니다.\n작성을 멈추시겠습니까?',
        [
          { text: '계속 작성', style: 'cancel' },
          {
            text: '작성 취소',
            style: 'destructive',
            onPress: () => {
              resetState();
              onClose();
            }
          }
        ]
      );
    } else {
      resetState();
      onClose();
    }
  };

  // State 초기화
  const resetState = () => {
    setSelectedReportReason(null);
    setReportReasonDetail('');
    setIsTextInputMode(false);
  };

  // 신고 제출
  const handleSubmit = async () => {
    if (!isReportButtonEnabled()) return;

    // 기타 선택 + 아직 텍스트 입력 모드가 아니면 텍스트 입력 모드로 전환
    if (selectedReportReason === 'OTHER' && !isTextInputMode) {
      setIsTextInputMode(true);
      return;
    }

    try {
      setIsSubmitting(true);

      // 부모 컴포넌트의 onSubmit 호출
      const description = selectedReportReason === 'OTHER' ? reportReasonDetail : '';
      await onSubmit(selectedReportReason!, description);

      // 제출 성공 후 state 초기화
      resetState();
    } catch (error) {
      // 에러는 부모 컴포넌트에서 처리
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 제목 텍스트
  const getTitle = () => {
    if (isTextInputMode) {
      return '신고할 문제를 작성해 주세요';
    }
    return type === 'post' ? '게시글 신고 사유' : '사용자 신고 사유';
  };

  return (
    <BottomSheet
      visible={visible}
      height={560}
      scrollEnabled={false}
      onClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Text variant="header4" color={colors.text.tertiary} style={styles.title}>
            {getTitle()}
          </Text>
          <View style={styles.divider} />

          <View style={styles.body}>
            {isTextInputMode ? (
              /* 기타 선택 시 텍스트 입력 필드 */
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="최대 200자까지 작성 가능합니다."
                    placeholderTextColor={colors.icon.gray}
                    value={reportReasonDetail}
                    onChangeText={setReportReasonDetail}
                    multiline
                    textAlignVertical="top"
                    maxLength={200}
                    autoFocus
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
                <Text variant="xsReg" color={colors.text.tertiary} style={styles.characterCount}>
                  {reportReasonDetail.length}/200
                </Text>
              </>
            ) : (
              /* 라디오 버튼 목록 */
              reportReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.reasonItem}
                  activeOpacity={0.7}
                  onPress={() => handleSelectReportReason(reason.value)}
                >
                  {selectedReportReason === reason.value ? (
                    <RadioCheckedIcon width={24} height={24} />
                  ) : (
                    <RadioUncheckedIcon width={24} height={24} />
                  )}
                  <Text variant="md" color={colors.text.primary} style={styles.reasonText}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <Button
              variant="black"
              onPress={handleSubmit}
              disabled={!isReportButtonEnabled() || isSubmitting}
            >
              신고하기
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginHorizontal: scale(-20),
    marginTop: verticalScale(-16),
  },
  title: {
    textAlign: 'center',
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(16),
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: scale(20),
  },
  body: {
    flex: 1,
    paddingHorizontal: scale(32),
    paddingTop: verticalScale(20),
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14.5),
  },
  reasonText: {
    marginLeft: scale(13),
  },
  inputContainer: {
    height: verticalScale(208),
    backgroundColor: colors.background,
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
    marginBottom: verticalScale(8),
  },
  input: {
    flex: 1,
    ...typography.smReg,
    color: colors.text.secondary,
    padding: 0,
  },
  characterCount: {
    textAlign: 'right',
    paddingRight: scale(4),
    marginBottom: verticalScale(12),
  },
  footer: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(12),
    alignItems: 'center',
  },
});

