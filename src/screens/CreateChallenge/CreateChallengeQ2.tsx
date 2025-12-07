import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { openCamera, openGallery } from '../../libs/imagePicker';
import { RootStackParamList } from '../../navigation/types';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { colors } from '../../design/tokens';
import CameraIcon from '../../../assets/icons/challenge-create/camera.svg';
import ChevronRightIcon from '../../../assets/icons/chevron-right-ic-grey.svg';
import ChevronDownIcon from '../../../assets/icons/chevron-down-ic-grey.svg';
import { VerificationMethodSheet } from '../../components/CreateChallenge/VerificationMethodSheet';
import { VerificationDaysSheet } from '../../components/CreateChallenge/VerificationDaysSheet';
import { TimePickerSheet } from '../../components/CreateChallenge/TimePickerSheet';

type CreateChallengeQ2NavigationProp = StackNavigationProp<RootStackParamList>;

export const CreateChallengeQ2 = () => {
  const navigation = useNavigation<CreateChallengeQ2NavigationProp>();

  // 입력 상태들
  const [challengeName, setChallengeName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'photo' | 'text' | ''>('');
  const [verificationDays, setVerificationDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<{ period: 'AM' | 'PM'; hour: string; minute: string } | null>(null);
  const [endTime, setEndTime] = useState<{ period: 'AM' | 'PM'; hour: string; minute: string } | null>(null);
  const [maxParticipants, setMaxParticipants] = useState<number>(0);
  const [challengeRules, setChallengeRules] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);

  // 바텀시트 상태들
  const [showMethodSheet, setShowMethodSheet] = useState(false);
  const [showDaysSheet, setShowDaysSheet] = useState(false);
  const [showTimeSheet, setShowTimeSheet] = useState<'start' | 'end' | null>(null);
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);

  // 모든 필드가 채워졌는지 확인
  const isNextEnabled =
    challengeName.trim() !== '' &&
    oneLiner.trim() !== '' &&
    verificationMethod !== '' &&
    verificationDays.length > 0 &&
    startTime !== null &&
    endTime !== null &&
    maxParticipants > 0 &&
    challengeRules.trim() !== '';

  const handleNext = () => {
    if (isNextEnabled) {
      try {
        navigation.navigate('CreateChallengeQ3');
      } catch (error) {
        // Navigation failed
      }
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      '챌린지 프로필 선택',
      '프로필로 사용할 이미지를 선택해 주세요.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '카메라',
          onPress: async () => {
            const asset = await openCamera();
            if (asset?.uri) {
              setThumbnailImage(asset.uri);
            }
          },
        },
        {
          text: '갤러리',
          onPress: async () => {
            const asset = await openGallery();
            if (asset?.uri) {
              setThumbnailImage(asset.uri);
            }
          },
        },
      ]
    );
  };

  // 요일 변환 함수
  const formatDays = (days: string[]) => {
    const dayMap: Record<string, string> = {
      MONDAY: '월',
      TUESDAY: '화',
      WEDNESDAY: '수',
      THURSDAY: '목',
      FRIDAY: '금',
      SATURDAY: '토',
      SUNDAY: '일',
    };

    // 요일 순서 정의 (월요일부터 시작)
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    // 선택된 요일을 요일 순서대로 정렬
    const sortedDays = days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    return sortedDays.map(d => dayMap[d]).join('/');
  };

  // 인증시간대가 모두 설정되면 자동으로 확장
  useEffect(() => {
    if (startTime && endTime) {
      setIsTimeExpanded(true);
    }
  }, [startTime, endTime]);

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
          {thumbnailImage ? (
            <Image source={{ uri: thumbnailImage }} style={styles.thumbnailImage} />
          ) : (
            <CameraIcon width={24} height={24} />
          )}
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
        <View style={[
          styles.selectionContainer,
          isTimeExpanded && styles.selectionContainerExpanded
        ]}>
          {/* 인증수단 */}
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => setShowMethodSheet(true)}
            activeOpacity={0.7}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              인증수단
            </Text>
            <View style={styles.selectionRight}>
              <Text
                variant="smReg"
                color={verificationMethod ? colors.text.primary : colors.icon.gray}
              >
                {verificationMethod === 'photo' ? '사진' : verificationMethod === 'text' ? '글' : '선택'}
              </Text>
              <ChevronRightIcon width={4} height={8} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 인증요일 */}
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => setShowDaysSheet(true)}
            activeOpacity={0.7}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              인증요일
            </Text>
            <View style={styles.selectionRight}>
              <Text
                variant="smReg"
                color={verificationDays.length > 0 ? colors.text.primary : colors.icon.gray}
              >
                {verificationDays.length === 7 ? '매일' : verificationDays.length > 0 ? formatDays(verificationDays) : '선택'}
              </Text>
              <ChevronRightIcon width={4} height={8} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 인증시간대 */}
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => {
              if (startTime && endTime) {
                setIsTimeExpanded(!isTimeExpanded);
              } else {
                setShowTimeSheet('start');
              }
            }}
            activeOpacity={0.7}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              인증시간대
            </Text>
            <View style={[
              styles.chevronContainer,
              isTimeExpanded && styles.chevronRotated
            ]}>
              <ChevronDownIcon width={8} height={4} />
            </View>
          </TouchableOpacity>

          {/* 인증시간대 확장 영역 */}
          {isTimeExpanded && startTime && endTime && (
            <>
              <View style={styles.timeDisplayContainer}>
                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => setShowTimeSheet('start')}
                  activeOpacity={0.7}
                >
                  <Text variant="smMd" color={colors.text.secondary}>
                    {startTime.period} {startTime.hour}:{startTime.minute}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => setShowTimeSheet('end')}
                  activeOpacity={0.7}
                >
                  <Text variant="smMd" color={colors.text.secondary}>
                    {endTime.period} {endTime.hour}:{endTime.minute}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timeNoticeContainer}>
                <Text variant="xxs" color={colors.icon.gray} style={styles.timeNotice}>
                  미설정 시 24시간으로 자동 설정돼요
                </Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* 정원 */}
          <View style={styles.selectionRow}>
            <Text variant="smReg" color={colors.text.tertiary}>
              정원
            </Text>
            <View style={styles.participantsInputContainer}>
              <TextInput
                style={styles.participantsInput}
                value={maxParticipants > 0 ? String(maxParticipants) : ''}
                onChangeText={(text) => {
                  const number = parseInt(text) || 0;
                  if (number >= 0 && number <= 30) {
                    setMaxParticipants(number);
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="00"
                placeholderTextColor={colors.icon.gray}
              />
              <Text variant="smReg" color={colors.icon.gray}>
                {' / 30'}
              </Text>
            </View>
          </View>
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

      {/* 바텀시트들 */}
      <VerificationMethodSheet
        visible={showMethodSheet}
        onClose={() => setShowMethodSheet(false)}
        selectedMethod={verificationMethod}
        onSelect={(method) => setVerificationMethod(method)}
      />

      <VerificationDaysSheet
        visible={showDaysSheet}
        onClose={() => setShowDaysSheet(false)}
        selectedDays={verificationDays}
        onConfirm={(days) => setVerificationDays(days)}
      />

      <TimePickerSheet
        visible={showTimeSheet === 'start'}
        onClose={() => setShowTimeSheet(null)}
        title="시작 시간을 선택해 주세요"
        initialTime={startTime || { period: 'AM', hour: '12', minute: '00' }}
        onConfirm={(time) => {
          setStartTime(time);
          // 약간의 딜레이를 주어 부드러운 전환
          setTimeout(() => {
            setShowTimeSheet('end');
          }, 300);
        }}
      />

      <TimePickerSheet
        visible={showTimeSheet === 'end'}
        onClose={() => setShowTimeSheet(null)}
        title="마감 시간을 선택해 주세요"
        initialTime={endTime || { period: 'PM', hour: '11', minute: '50' }}
        onConfirm={(time) => setEndTime(time)}
      />
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
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
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
  selectionContainerExpanded: {
    height: 320,
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
  chevronContainer: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  timeDisplayContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  timeBox: {
    flex: 1,
    height: 46,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeNoticeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  timeNotice: {
    lineHeight: 12,
  },
  participantsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsInput: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
    padding: 0,
    minWidth: 30,
    textAlign: 'right',
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
