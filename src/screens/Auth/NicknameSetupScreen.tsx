import React, { useState, useEffect } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '../../components/common/Text';
import { TextField } from '../../components/common/TextField';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { colors } from '../../design/tokens';
import { checkNickname, setNickname } from '../../libs/api/auth';
import CheckIcon from '../../../assets/icons/checkbox-checked.svg';

interface NicknameSetupScreenProps {
  onBack: () => void;
  onComplete: (nickname: string) => void;
}

type NicknameStatus = 'idle' | 'error' | 'success';

export const NicknameSetupScreen: React.FC<NicknameSetupScreenProps> = ({
  onBack,
  onComplete,
}) => {
  const [nickname, setNicknameValue] = useState('');
  const [status, setStatus] = useState<NicknameStatus>('idle');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const MAX_LENGTH = 10;
  const isNicknameValid = nickname.length > 0 && status === 'success';

  const handleNicknameChange = (text: string) => {
    // 최대 길이 제한
    if (text.length > MAX_LENGTH) {
      return;
    }

    setNicknameValue(text);

    // 입력이 변경되면 상태 초기화
    if (status !== 'idle') {
      setStatus('idle');
    }
  };

  // 닉네임 중복 확인 -> 디바운스 방식으로 자동 호출
  useEffect(() => {
    // 닉네임이 비어있으면 idle 상태로
    if (nickname.length === 0) {
      setStatus('idle');
      return;
    }

    // 0.5초 동안 추가 입력이 없으면 중복 확인 실행
    const timer = setTimeout(async () => {
      try {
        setIsChecking(true);
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (!accessToken) {
          setStatus('error');
          return;
        }

        // 닉네임 중복 확인 API 호출
        const response = await checkNickname(accessToken, nickname);

        if (response.isSuccess && response.result === true) {
          // 닉네임 사용 가능
          setStatus('success');
        } else {
          // 닉네임 중복 또는 사용 불가
          setStatus('error');
        }
      } catch (error) {
        // API 호출 실패 시 에러 상태로 표시
        setStatus('error');
      } finally {
        setIsChecking(false);
      }
    }, 500);

    // 새로운 입력이 들어오면 이전 타이머 취소
    return () => clearTimeout(timer);
  }, [nickname]);

  // 닉네임 설정 완료
  const handleComplete = async () => {
    if (!isNicknameValid) {
      return;
    }

    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      return;
    }

    try {
      setIsSubmitting(true);

      // 닉네임 설정 API 호출
      const response = await setNickname(accessToken, nickname);

      if (response.isSuccess) {
        // 닉네임 저장 성공 -> AsyncStorage에 저장하고 다음 단계로 이동
        await AsyncStorage.setItem('nickname', response.result.nickname);
        onComplete(nickname);
      } else {
        Alert.alert('오류', response.message || '닉네임 설정에 실패했습니다.');
      }
    } catch (error: any) {
      // 서버에서 오는 에러 메시지가 있으면 우선 표시, 없으면 기본 메시지
      const errorMessage = error?.response?.data?.message ||
        error?.response?.data?.error ||
        '닉네임 설정 중 문제가 발생했습니다. 다시 시도해주세요.';
      Alert.alert('오류', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
        <View style={styles.titleContainer}>
          <Text variant="header1" color={colors.text.primary} style={styles.title}>
            닉네임을
          </Text>
          <Text variant="header1" color={colors.text.primary} style={styles.title}>
            설정해 주세요
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextField
            variant="default"
            placeholder="닉네임"
            value={nickname}
            onChangeText={handleNicknameChange}
            error={status === 'error' ? '해당 닉네임은 이미 등록되어 있어요!' : undefined}
            message={
              status === 'success'
                ? '사용 가능한 닉네임이에요'
                : nickname.length === 0 && status === 'idle'
                  ? '최대 10자까지 입력 가능해요'
                  : undefined
            }
            rightIcon={
              status === 'success' ? (
                <CheckIcon width={14} height={12} />
              ) : undefined
            }
            maxLength={MAX_LENGTH}
            containerStyle={styles.textFieldContainer}
            inputContainerStyle={styles.textFieldInputContainer}
          />
        </View>
      </View>

      {/* 완료 버튼 */}
      <View style={styles.buttonContainer}>
        <Button
          variant={isNicknameValid ? 'black' : 'gray'}
          size="medium"
          onPress={handleComplete}
          disabled={!isNicknameValid || isSubmitting || isChecking}
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
    paddingTop: verticalScale(40),
  },
  titleContainer: {
    marginBottom: verticalScale(28),
  },
  title: {
    lineHeight: verticalScale(30),
    includeFontPadding: false,
  },
  inputContainer: {
    marginBottom: verticalScale(16),
  },
  textFieldContainer: {
    width: '100%',
    maxWidth: scale(350),
  },
  textFieldInputContainer: {
    height: verticalScale(60),
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
});