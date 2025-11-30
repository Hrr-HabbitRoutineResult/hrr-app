import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { TextField } from '../../components/common/TextField';
import { Button } from '../../components/common/Button';
import { colors } from '../../design/tokens';
import BackIcon from '../../../assets/icons/back.svg';
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
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState<NicknameStatus>('idle');

  const MAX_LENGTH = 10;
  const isNicknameValid = nickname.length > 0 && status === 'success';

  const handleNicknameChange = (text: string) => {
    // 최대 길이 제한
    if (text.length > MAX_LENGTH) return;

    setNickname(text);

    // 입력이 변경되면 상태 초기화
    if (status !== 'idle') {
      setStatus('idle');
    }
  };

  const handleCheckNickname = () => {
    if (nickname.length === 0) return;

    // TODO:  API 호출로 닉네임 중복 확인
    // 임시로 "김흐르"일 때 에러, 그 외에는 성공으로 처리
    if (nickname === '김흐르') {
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  const handleComplete = () => {
    if (isNicknameValid) {
      onComplete(nickname);
    }
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
            onBlur={handleCheckNickname}
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
          disabled={!isNicknameValid}
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
  },
  titleContainer: {
    marginBottom: 28,
  },
  title: {
    lineHeight: 30,
    includeFontPadding: false,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textFieldContainer: {
    width: 350,
  },
  textFieldInputContainer: {
    height: 60,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
});
