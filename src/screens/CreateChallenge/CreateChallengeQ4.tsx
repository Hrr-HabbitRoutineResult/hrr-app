import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
import RadioCheckedIcon from '../../../assets/icons/radio-checked.svg';
import RadioUncheckedIcon from '../../../assets/icons/radio-unchecked.svg';
import CheckboxCheckedIcon from '../../../assets/icons/checkbox-checked.svg';

type CreateChallengeQ4NavigationProp = StackNavigationProp<RootStackParamList>;

export const CreateChallengeQ4 = () => {
  const navigation = useNavigation<CreateChallengeQ4NavigationProp>();

  const [isObserverModeEnabled, setIsObserverModeEnabled] = useState(false);
  const [password, setPassword] = useState('');

  const isCompleteEnabled = isObserverModeEnabled && password.length === 4;

  const handleComplete = () => {
    if (isCompleteEnabled) {
      // TODO: 챌린지 생성 API 연동
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            ]}
            onPress={() => setIsObserverModeEnabled(!isObserverModeEnabled)}
            activeOpacity={0.7}
          >
            <View style={styles.observerModeContent}>
              <View style={styles.observerModeTextContainer}>
                <Text variant="md" color={colors.text.primary} style={styles.observerModeTitle}>
                  관찰자모드
                </Text>
                <Text variant="xxs" color={colors.text.tertiary} style={styles.observerModeDescription}>
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

          {/* 비밀번호 입력 필드 */}
          <View style={styles.passwordContainer}>
            <TextField
              variant="default"
              placeholder="비밀번호 (숫자 4자리)"
              value={password}
              onChangeText={setPassword}
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
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant={isCompleteEnabled ? 'black' : 'gray'}
          size="medium"
          onPress={handleComplete}
          disabled={!isCompleteEnabled}
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
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    marginBottom: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  observerModeCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  observerModeCardSelected: {
    borderColor: colors.primary.main,
  },
  observerModeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  observerModeTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  observerModeTitle: {
    marginBottom: 8,
  },
  observerModeDescription: {
    lineHeight: 18,
  },
  radioIconContainer: {
    marginTop: 2,
  },
  passwordContainer: {
    marginBottom: 20,
  },
  passwordFieldContainer: {
    marginBottom: 0,
  },
  passwordInputContainer: {
    height: 60,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
