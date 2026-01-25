import React, { useState, useEffect } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { TextField } from '../../components/common/TextField';
import { colors } from '../../design/tokens';
import { useCreateChallenge } from '../../contexts/CreateChallengeContext';
import { createChallenge, CreateChallengeRequest } from '../../libs/api/challenge';
import RadioCheckedIcon from '../../../assets/icons/radio-checked.svg';
import RadioUncheckedIcon from '../../../assets/icons/radio-unchecked.svg';
import CheckboxCheckedIcon from '../../../assets/icons/checkbox-checked.svg';

type CreateChallengeQ4NavigationProp = StackNavigationProp<RootStackParamList>;

export const CreateChallengeQ4 = () => {
  const navigation = useNavigation<CreateChallengeQ4NavigationProp>();
  const { data, updateData, resetData } = useCreateChallenge();


  const [isObserverModeEnabled, setIsObserverModeEnabled] = useState(data.isObserverModeEnabled);
  const [password, setPassword] = useState(data.password);
  const [isCreating, setIsCreating] = useState(false);

  // 비공개 챌린지는 비밀번호 필수, 공개 챌린지는 불필요
  // 관찰자모드는 사용자 선택사항 (버튼 활성화에 영향 X)
  const isPasswordRequired = data.isPublic === false;
  const isCompleteEnabled = !isPasswordRequired || password.length === 4;
  const isObserverModeDisabled = data.isPublic === false; // 비공개 챌린지는 관찰자모드 비활성화

  // 관찰자모드 토글 핸들러
  const handleObserverModeToggle = () => {
    if (isObserverModeDisabled) {
      Alert.alert('알림', '비공개 챌린지는 관찰자모드를 사용할 수 없습니다.');
      return;
    }
    setIsObserverModeEnabled(!isObserverModeEnabled);
  };

  // 시간 포맷 변환 (AM/PM HH:mm -> HH:mm:ss)
  const formatTimeTo24Hour = (time: { period: 'AM' | 'PM'; hour: string; minute: string }): string => {
    let hour24 = parseInt(time.hour);
    if (time.period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (time.period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    return `${String(hour24).padStart(2, '0')}:${time.minute}:00`;
  };

  // 날짜 포맷 변환 (Date -> YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleComplete = async () => {
    if (!isCompleteEnabled || isCreating) {
      return;
    }

    // 필수 데이터 검증
    const validationErrors: string[] = [];

    if (!data.category) {
      validationErrors.push('카테고리');
    }
    if (data.isPublic === null) {
      validationErrors.push('공개/비공개 설정');
    }
    if (!data.challengeName || data.challengeName.trim() === '') {
      validationErrors.push('챌린지명');
    }
    if (!data.oneLiner || data.oneLiner.trim() === '') {
      validationErrors.push('한줄소개');
    }
    if (!data.verificationMethod) {
      validationErrors.push('인증수단');
    }
    if (!data.verificationDays || data.verificationDays.length === 0) {
      validationErrors.push('인증요일');
    }
    if (!data.startTime) {
      validationErrors.push('시작시간');
    }
    if (!data.endTime) {
      validationErrors.push('마감시간');
    }
    if (!data.startDate) {
      validationErrors.push('시작일');
    }
    if (!data.imageKey || data.imageKey === '') {
      validationErrors.push('이미지');
    }
    if (isPasswordRequired && (!password || password.length !== 4)) {
      validationErrors.push('비밀번호');
    }
    if (data.maxParticipants < 1 || data.maxParticipants > 30) {
      validationErrors.push('참여인원(1-30명)');
    }

    if (validationErrors.length > 0) {
      Alert.alert('오류', `다음 항목을 입력해주세요: ${validationErrors.join(', ')}`);
      return;
    }

    try {
      setIsCreating(true);
      updateData({ isObserverModeEnabled, password });

      // API 요청 데이터 구성
      const requestData: CreateChallengeRequest = {
        title: data.challengeName,
        description: data.oneLiner,
        isPublic: data.isPublic === true,
        password: data.isPublic === true ? undefined : password,
        category: data.category as 'HEALTH' | 'STUDY' | 'HOBBY' | 'CAREER' | 'HABIT',
        verificationType: data.verificationMethod === 'photo' ? 'PHOTO' : 'TEXT',
        startDate: formatDate(data.startDate!),
        maxParticipants: data.maxParticipants,
        isViewerMode: isObserverModeEnabled, // API 필수 필드: 사용자가 체크하지 않으면 false
        rule: data.challengeRules || '',
        verifyStartTime: formatTimeTo24Hour(data.startTime!),
        verifyEndTime: formatTimeTo24Hour(data.endTime!),
        daysOfWeek: data.verificationDays,
        imageKey: data.imageKey!,
      };

      const result = await createChallenge(requestData);

      // 성공 시 Context 초기화 및 챌린지 프로필로 이동
      resetData();
      navigation.reset({
        index: 0,
        routes: [
          { name: 'HomeTabs' },
          { name: 'ChallengeProfile', params: { challengeId: result.id } },
        ],
      });
    } catch (error: any) {
      // 서버에서 반환한 상세 에러 정보 추출
      const errorData = error.response?.data;
      let errorMessage = '챌린지 생성에 실패했습니다.';
      let errorTitle = '오류';

      if (errorData) {
        // 서버 응답이 있는 경우 상세 정보 표시
        errorTitle = errorData.status || '오류';
        errorMessage = errorData.message || error.message || errorMessage;

        // 에러 코드가 있으면 함께 표시
        if (errorData.code) {
          errorMessage = `[${errorData.code}]\n${errorMessage}`;
        }
      } else if (error.message) {
        // 네트워크 에러 등 기타 에러
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    updateData({ isObserverModeEnabled, password });
  }, [isObserverModeEnabled, password]);

  // 비공개 챌린지로 진입 시 관찰자모드 강제 비활성화
  useEffect(() => {
    if (isObserverModeDisabled && isObserverModeEnabled) {
      setIsObserverModeEnabled(false);
    }
  }, [isObserverModeDisabled]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        onBack={() => navigation.goBack()}
        title="챌린지 개설"
      />
      <ProgressBar currentStep={4} totalSteps={4} />

      <View style={styles.content}>
        <Text variant="header1" color={colors.text.primary} style={styles.title}>
          마지막 단계예요
        </Text>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 관찰자모드 섹션 */}
          <TouchableOpacity
            style={[
              styles.observerModeCard,
              isObserverModeEnabled && styles.observerModeCardSelected,
              isObserverModeDisabled && styles.observerModeCardDisabled,
            ]}
            onPress={handleObserverModeToggle}
            activeOpacity={0.7}
          >
            <View style={styles.observerModeContent}>
              <View style={styles.observerModeTextContainer}>
                <Text
                  variant="md"
                  color={isObserverModeDisabled ? colors.icon.gray : colors.text.primary}
                  style={styles.observerModeTitle}
                >
                  관찰자모드
                </Text>
                <Text
                  variant="xxs"
                  color={isObserverModeDisabled ? colors.icon.gray : colors.text.tertiary}
                  style={styles.observerModeDescription}
                >
                  다른 챌린저들이 내 챌린지에 입장하기 전에{'\n'}활동 모습을 살펴볼 수 있는 기능이에요
                </Text>
              </View>
              <View style={styles.radioIconContainer}>
                {isObserverModeEnabled ? (
                  <RadioCheckedIcon width={24} height={24} />
                ) : (
                  <RadioUncheckedIcon width={24} height={24} />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* 비밀번호 입력 필드 - 비공개 챌린지일 때만 표시 */}
          {isPasswordRequired && (
            <View style={styles.passwordContainer}>
              <TextField
                variant="default"
                placeholder="비밀번호 (숫자 4자리)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  updateData({ password: text });
                }}
                keyboardType="number-pad"
                maxLength={4}
                rightIcon={
                  password.length === 4 ? (
                    <CheckboxCheckedIcon width={12} height={10} />
                  ) : undefined
                }
                containerStyle={styles.passwordFieldContainer}
                inputContainerStyle={styles.passwordInputContainer}
              />
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant={isCompleteEnabled && !isCreating ? 'black' : 'gray'}
          size="medium"
          onPress={handleComplete}
          disabled={!isCompleteEnabled || isCreating}
        >
          완료
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
    paddingTop: verticalScale(24),
  },
  title: {
    marginBottom: verticalScale(40),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
  observerModeCard: {
    backgroundColor: colors.white,
    borderRadius: scale(10),
    padding: 20,
    marginBottom: verticalScale(20),
    borderWidth: scale(1.5),
    borderColor: colors.line,
  },
  observerModeCardSelected: {
    borderColor: colors.primary.main,
  },
  observerModeCardDisabled: {
    opacity: 0.5,
  },
  observerModeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  observerModeTextContainer: {
    flex: 1,
    marginRight: scale(16),
  },
  observerModeTitle: {
    marginBottom: verticalScale(8),
  },
  observerModeDescription: {
    lineHeight: verticalScale(18),
  },
  radioIconContainer: {
    marginTop: verticalScale(2),
  },
  passwordContainer: {
    marginBottom: verticalScale(20),
  },
  passwordFieldContainer: {
    marginBottom: verticalScale(0),
  },
  passwordInputContainer: {
    height: verticalScale(60),
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
});
