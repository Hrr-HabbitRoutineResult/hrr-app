import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { colors } from '../../design/tokens';
import CameraIcon from '../../../assets/icons/challenge-create/camera.svg';
import ChevronRightIcon from '../../../assets/icons/chevron-right-ic-grey.svg';
import ChevronDownIcon from '../../../assets/icons/chevron-down-ic-grey.svg';

type CreateChallengeQ2NavigationProp = StackNavigationProp<RootStackParamList>;

export const CreateChallengeQ2 = () => {
  const navigation = useNavigation<CreateChallengeQ2NavigationProp>();

  // 입력 상태들
  const [challengeName, setChallengeName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [verificationDays, setVerificationDays] = useState('');
  const [verificationTime, setVerificationTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [challengeRules, setChallengeRules] = useState('');

  // 모든 필드가 채워졌는지 확인
  const isNextEnabled =
    challengeName.trim() !== '' &&
    oneLiner.trim() !== '' &&
    verificationMethod !== '' &&
    verificationDays !== '' &&
    verificationTime !== '' &&
    maxParticipants !== '' &&
    challengeRules.trim() !== '';

  const handleNext = () => {
    if (isNextEnabled) {
      // TODO: 다음 단계로 이동
      console.log('Form data:', {
        challengeName,
        oneLiner,
        verificationMethod,
        verificationDays,
        verificationTime,
        maxParticipants,
        challengeRules,
      });
    }
  };

  const handleImagePicker = () => {
    // TODO: 카메라/갤러리 연동
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <Header
        onBack={() => navigation.goBack()}
        title="챌린지 개설"
      />

      {/* 진행률 표시줄 */}
      <ProgressBar currentStep={2} totalSteps={4} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 카메라 이미지 박스 */}
        <TouchableOpacity
          style={styles.imageBox}
          onPress={handleImagePicker}
          activeOpacity={0.7}
        >
          <CameraIcon width={24} height={24} />
        </TouchableOpacity>

        {/* 챌린지명 / 한줄소개 컨테이너 */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="챌린지명을 적어주세요"
              placeholderTextColor={colors.icon.gray}
              value={challengeName}
              onChangeText={setChallengeName}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="한줄소개를 적어주세요"
              placeholderTextColor={colors.icon.gray}
              value={oneLiner}
              onChangeText={setOneLiner}
            />
          </View>
        </View>

        {/* 인증 정보 선택 컨테이너 */}
        <View style={styles.selectionContainer}>
          {/* 인증수단 */}
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => {
              // TODO: 바텀시트 열기
            }}
            activeOpacity={0.7}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              인증수단
            </Text>
            <View style={styles.selectionRight}>
              <Text
                variant="smReg"
                color={colors.icon.gray}
              >
                {verificationMethod || '선택'}
              </Text>
              <ChevronRightIcon width={4} height={8} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 인증요일 */}
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => {
              // TODO: 바텀시트 열기
            }}
            activeOpacity={0.7}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              인증요일
            </Text>
            <View style={styles.selectionRight}>
              <Text
                variant="smReg"
                color={colors.icon.gray}
              >
                {verificationDays || '선택'}
              </Text>
              <ChevronRightIcon width={4} height={8} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 인증시간대 */}
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => {
              // TODO: 바텀시트 열기
            }}
            activeOpacity={0.7}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              인증시간대
            </Text>
            <View style={styles.selectionRight}>
              <Text
                variant="smReg"
                color={colors.icon.gray}
              >
                {verificationTime || ''}
              </Text>
              <ChevronDownIcon width={8} height={4} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 정원 */}
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => {
              // TODO: 바텀시트 열기
            }}
            activeOpacity={0.7}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              정원
            </Text>
            <Text
              variant="smReg"
              color={colors.icon.gray}
            >
              {maxParticipants ? `${maxParticipants} / 30` : '00 / 30'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 챌린지 규칙 입력 박스 */}
        <View style={styles.rulesContainer}>
          <TextInput
            style={styles.rulesInput}
            placeholder="챌린지 규칙을 설명해 주세요 (진행 방식 등)"
            placeholderTextColor={colors.icon.gray}
            value={challengeRules}
            onChangeText={setChallengeRules}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* TIP 섹션 */}
        <View style={styles.tipContainer}>
          <View style={styles.tipHeader}>
            <View style={styles.tipBadge}>
              <Text variant="xsMd" color={colors.white}>
                TIP
              </Text>
            </View>
            <Text variant="xsMd" color={colors.text.secondary} style={styles.tipTitle}>
              이런 내용을 적으면 좋아요
            </Text>
          </View>
          <View style={styles.tipList}>
            <View style={styles.tipItemContainer}>
              <View style={styles.tipBullet} />
              <Text variant="xxs" color={colors.text.tertiary} style={styles.tipItem}>
                인증할 때 필수로 올려야 하는 내용이 있나요?
              </Text>
            </View>
            <View style={styles.tipItemContainer}>
              <View style={styles.tipBullet} />
              <Text variant="xxs" color={colors.text.tertiary} style={styles.tipItem}>
                어떤 사람들과 함께 하고 싶나요?
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  inputContainer: {
    height: 108,
    backgroundColor: colors.background,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  inputRow: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
    padding: 0,
    minHeight: 40,
  },
  selectionContainer: {
    height: 216,
    backgroundColor: colors.background,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  selectionRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  selectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
  rulesContainer: {
    height: 208,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 18,
    marginBottom: 20,
  },
  rulesInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.secondary,
    padding: 0,
  },
  tipContainer: {
    marginBottom: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  tipBadge: {
    width: 37,
    height: 22,
    backgroundColor: colors.primary.main,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    lineHeight: 20,
  },
  tipList: {
    gap: 4,
  },
  tipItemContainer: {
    paddingLeft: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  tipBullet: {
    alignSelf: 'center',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.text.tertiary,
  },
  tipItem: {
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
});
