import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { Text } from '../../components/common/Text';
import { TextField } from '../../components/common/TextField';
import { TimePickerSheet } from '../../components/create-challenge/TimePickerSheet';
import { VerificationDaysSheet } from '../../components/create-challenge/VerificationDaysSheet';
import { VerificationMethodSheet } from '../../components/create-challenge/VerificationMethodSheet';
import { OptionGroup } from '../../components/onboarding/OptionGroup';
import { colors } from '../../design/tokens';
import {
  ChallengeCategory,
  ChallengeEditInfo,
  ChallengeVerificationType,
  getChallengeEditInfo,
  updateChallenge,
} from '../../libs/api/challenge';
import { openCamera, openGallery } from '../../libs/imagePicker';
import { uploadImageToS3 } from '../../libs/s3Upload';
import { RootStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../utils/errorHandler';
import { scale, verticalScale } from '../../utils/scaling';
import CameraIcon from '../../../assets/icons/challenge-create/camera.svg';
import ChevronRightIcon from '../../../assets/icons/chevron-right-ic-grey.svg';
import RadioCheckedIcon from '../../../assets/icons/radio-checked.svg';
import RadioUncheckedIcon from '../../../assets/icons/radio-unchecked.svg';

type ChallengeEditRouteProp = RouteProp<RootStackParamList, 'ChallengeEdit'>;
type ChallengeEditNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeEdit'
>;
type PickerTime = { period: 'AM' | 'PM'; hour: string; minute: string };

const CATEGORY_OPTIONS = [
  { id: 'HEALTH', label: '운동' },
  { id: 'STUDY', label: '학업' },
  { id: 'HOBBY', label: '취미' },
  { id: 'CAREER', label: '취업준비' },
  { id: 'HABIT', label: '생활습관' },
];

const DAY_LABELS: Record<string, string> = {
  SUNDAY: '일',
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
};

const DAY_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const parseServerTime = (
  value: ChallengeEditInfo['verifyStartTime'],
): PickerTime => {
  let hour = 0;
  let minute = 0;

  if (typeof value === 'string') {
    const [hourText = '0', minuteText = '0'] = value.split(':');
    hour = Number(hourText);
    minute = Number(minuteText);
  } else {
    hour = value.hour;
    minute = value.minute;
  }

  const period: PickerTime['period'] = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return {
    period,
    hour: String(displayHour).padStart(2, '0'),
    minute: String(minute).padStart(2, '0'),
  };
};

const to24Hour = (time: PickerTime): number => {
  const hour = Number(time.hour);
  if (time.period === 'PM' && hour !== 12) return hour + 12;
  if (time.period === 'AM' && hour === 12) return 0;
  return hour;
};

const toMinutesOfDay = (time: PickerTime): number =>
  to24Hour(time) * 60 + Number(time.minute);

const formatTimeForApi = (time: PickerTime): string =>
  `${String(to24Hour(time)).padStart(2, '0')}:${time.minute}:00`;

const parseLocalDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (date: Date): string =>
  `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;

const getMinimumStartDate = (): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date;
};

// 서버가 요일을 중복해서 내려주는 케이스가 있어 표시/저장 전에 항상 중복을 제거한다.
const dedupeDays = (days: string[]): string[] => Array.from(new Set(days));

const formatDays = (days: string[]): string => {
  const uniqueDays = dedupeDays(days);
  if (uniqueDays.length === 7) return '매일';
  return uniqueDays
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
    .map(day => DAY_LABELS[day])
    .join('/');
};

export const ChallengeEditScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeEditNavigationProp>();
  const route = useRoute<ChallengeEditRouteProp>();
  const { challengeId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<ChallengeCategory | ''>('');
  const [verificationType, setVerificationType] = useState<
    ChallengeVerificationType | ''
  >('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [maxParticipants, setMaxParticipants] = useState(0);
  const [isViewerMode, setIsViewerMode] = useState(false);
  const [rule, setRule] = useState('');
  const [verifyStartTime, setVerifyStartTime] = useState<PickerTime | null>(
    null,
  );
  const [verifyEndTime, setVerifyEndTime] = useState<PickerTime | null>(null);
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [imageKey, setImageKey] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [showMethodSheet, setShowMethodSheet] = useState(false);
  const [showDaysSheet, setShowDaysSheet] = useState(false);
  const [showTimeSheet, setShowTimeSheet] = useState<'start' | 'end' | null>(
    null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadEditInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const info = await getChallengeEditInfo(challengeId);
      setTitle(info.title);
      setDescription(info.description);
      setIsPublic(info.isPublic);
      setHasPassword(info.hasPassword);
      setPassword('');
      setCategory(info.category);
      setVerificationType(info.verificationType);
      setStartDate(parseLocalDate(info.startDate));
      setMaxParticipants(info.maxParticipants);
      setIsViewerMode(info.isPublic ? info.isViewerMode : false);
      setRule(info.rule || '');
      setVerifyStartTime(parseServerTime(info.verifyStartTime));
      setVerifyEndTime(parseServerTime(info.verifyEndTime));
      setDaysOfWeek(dedupeDays(info.daysOfWeek));
      setImageKey(info.imageKey);
      setImageUri(info.imageUrl);
    } catch (error: unknown) {
      setLoadError(
        getErrorMessage(error, '챌린지 수정 정보를 불러오지 못했습니다.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    loadEditInfo();
  }, [loadEditInfo]);

  const selectImage = async (source: 'camera' | 'gallery') => {
    try {
      setIsUploading(true);
      const asset =
        source === 'camera' ? await openCamera() : await openGallery();
      if (!asset?.uri) return;
      const { s3Key } = await uploadImageToS3(asset.uri, 'challenge-profile');
      setImageKey(s3Key);
      setImageUri(asset.uri);
    } catch (error: unknown) {
      Alert.alert(
        '오류',
        getErrorMessage(error, '이미지 업로드에 실패했습니다.'),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagePicker = () => {
    Keyboard.dismiss();
    Alert.alert(
      '챌린지 프로필 선택',
      '프로필로 사용할 이미지를 선택해 주세요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '카메라', onPress: () => selectImage('camera') },
        { text: '갤러리', onPress: () => selectImage('gallery') },
      ],
    );
  };

  const handlePrivacyChange = (value: string) => {
    const nextIsPublic = value === 'public';
    setIsPublic(nextIsPublic);
    if (nextIsPublic) {
      setPassword('');
    } else {
      setIsViewerMode(false);
    }
  };

  const validate = (): string | null => {
    if (!title.trim()) return '챌린지명을 입력해 주세요.';
    if (!description.trim()) return '한줄소개를 입력해 주세요.';
    if (!category || category === 'ALL') return '카테고리를 선택해 주세요.';
    if (!verificationType) return '인증수단을 선택해 주세요.';
    if (daysOfWeek.length === 0) return '인증요일을 선택해 주세요.';
    if (!verifyStartTime || !verifyEndTime)
      return '인증시간대를 선택해 주세요.';
    if (toMinutesOfDay(verifyEndTime) <= toMinutesOfDay(verifyStartTime)) {
      return '마감 시간은 시작 시간보다 늦게 설정해 주세요.';
    }
    if (!startDate) return '시작일을 선택해 주세요.';
    if (maxParticipants < 1 || maxParticipants > 30)
      return '정원은 1명 이상 30명 이하로 입력해 주세요.';
    if (!imageKey) return '챌린지 이미지를 선택해 주세요.';
    if (!isPublic && password.length > 0 && !/^\d{4}$/.test(password)) {
      return '비밀번호는 숫자 4자리로 입력해 주세요.';
    }
    if (!isPublic && !hasPassword && password.length === 0) {
      return '비공개 챌린지 비밀번호를 입력해 주세요.';
    }
    return null;
  };

  const handleSave = async () => {
    if (isSaving || isUploading) return;
    const validationMessage = validate();
    if (validationMessage) {
      Alert.alert('알림', validationMessage);
      return;
    }

    try {
      setIsSaving(true);
      await updateChallenge(challengeId, {
        title: title.trim(),
        description: description.trim(),
        isPublic,
        password: isPublic || password.length === 0 ? undefined : password,
        category: category as ChallengeCategory,
        verificationType: verificationType as ChallengeVerificationType,
        startDate: formatDateForApi(startDate!),
        maxParticipants,
        isViewerMode: isPublic ? isViewerMode : false,
        rule: rule.trim(),
        verifyStartTime: formatTimeForApi(verifyStartTime!),
        verifyEndTime: formatTimeForApi(verifyEndTime!),
        daysOfWeek: dedupeDays(daysOfWeek),
        imageKey,
      });
      Alert.alert('완료', '챌린지가 수정되었어요.');
      navigation.goBack();
    } catch (error: unknown) {
      Alert.alert(
        '오류',
        getErrorMessage(error, '챌린지 수정에 실패했습니다.'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header
          onBack={() => navigation.goBack()}
          title="챌린지 수정"
          showDivider
        />
        <View style={styles.centerContent}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header
          onBack={() => navigation.goBack()}
          title="챌린지 수정"
          showDivider
        />
        <View style={styles.centerContent}>
          <Text
            variant="smReg"
            color={colors.text.tertiary}
            style={styles.errorText}
          >
            {loadError}
          </Text>
          <Button variant="black" size="medium" onPress={loadEditInfo}>
            다시 시도
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        onBack={() => navigation.goBack()}
        title="챌린지 수정"
        showDivider
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.imageBox}
          onPress={handleImagePicker}
          activeOpacity={0.7}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color={colors.primary.main} />
          ) : imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <CameraIcon width={24} height={24} />
          )}
        </TouchableOpacity>

        <Text variant="xsReg" color={colors.text.tertiary} style={styles.label}>
          기본 정보
        </Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="챌린지명을 적어주세요"
            placeholderTextColor={colors.icon.gray}
            maxLength={10}
            allowFontScaling={false}
          />
          <View style={styles.divider} />
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="한줄소개를 적어주세요"
            placeholderTextColor={colors.icon.gray}
            maxLength={20}
            allowFontScaling={false}
          />
        </View>

        <OptionGroup
          title="카테고리"
          options={CATEGORY_OPTIONS}
          selectedOptions={category ? [category] : []}
          onOptionSelect={value => setCategory(value as ChallengeCategory)}
        />

        <OptionGroup
          title="공개 설정"
          options={[
            { id: 'public', label: '공개 챌린지' },
            { id: 'private', label: '비공개 챌린지' },
          ]}
          selectedOptions={[isPublic ? 'public' : 'private']}
          onOptionSelect={handlePrivacyChange}
        />

        {!isPublic && (
          <View style={styles.passwordSection}>
            <TextField
              variant="default"
              value={password}
              onChangeText={value =>
                setPassword(value.replace(/\D/g, '').slice(0, 4))
              }
              placeholder="새 비밀번호 (숫자 4자리)"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              inputContainerStyle={styles.passwordInput}
              message={
                hasPassword && password.length === 0
                  ? '비워두면 기존 비밀번호가 유지돼요'
                  : undefined
              }
            />
          </View>
        )}

        <Text variant="xsReg" color={colors.text.tertiary} style={styles.label}>
          인증 정보
        </Text>
        <View style={styles.selectionGroup}>
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => setShowMethodSheet(true)}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              인증수단
            </Text>
            <View style={styles.selectionValue}>
              <Text variant="smReg" color={colors.text.primary}>
                {verificationType === 'PHOTO' ? '사진' : '글'}
              </Text>
              <ChevronRightIcon width={4} height={8} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => setShowDaysSheet(true)}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              인증요일
            </Text>
            <View style={styles.selectionValue}>
              <Text variant="smReg" color={colors.text.primary}>
                {formatDays(daysOfWeek)}
              </Text>
              <ChevronRightIcon width={4} height={8} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => setShowTimeSheet('start')}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              시작 시간
            </Text>
            <View style={styles.selectionValue}>
              <Text variant="smReg" color={colors.text.primary}>
                {verifyStartTime
                  ? `${verifyStartTime.period} ${verifyStartTime.hour}:${verifyStartTime.minute}`
                  : '선택'}
              </Text>
              <ChevronRightIcon width={4} height={8} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => setShowTimeSheet('end')}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              마감 시간
            </Text>
            <View style={styles.selectionValue}>
              <Text variant="smReg" color={colors.text.primary}>
                {verifyEndTime
                  ? `${verifyEndTime.period} ${verifyEndTime.hour}:${verifyEndTime.minute}`
                  : '선택'}
              </Text>
              <ChevronRightIcon width={4} height={8} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.selectionRow}
            onPress={() => setShowDatePicker(true)}
          >
            <Text variant="smReg" color={colors.text.tertiary}>
              시작일
            </Text>
            <View style={styles.selectionValue}>
              <Text variant="smReg" color={colors.text.primary}>
                {startDate ? formatDateLabel(startDate) : '선택'}
              </Text>
              <ChevronRightIcon width={4} height={8} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.selectionRow}>
            <Text variant="smReg" color={colors.text.tertiary}>
              정원
            </Text>
            <View style={styles.participantInputRow}>
              <TextInput
                style={styles.participantInput}
                value={maxParticipants ? String(maxParticipants) : ''}
                onChangeText={value =>
                  setMaxParticipants(
                    Number(value.replace(/\D/g, '').slice(0, 2)) || 0,
                  )
                }
                keyboardType="number-pad"
                maxLength={2}
                allowFontScaling={false}
              />
              <Text variant="smReg" color={colors.icon.gray}>
                {' '}
                / 30
              </Text>
            </View>
          </View>
        </View>

        {showDatePicker && startDate && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={getMinimumStartDate()}
              onChange={handleDateChange}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.datePickerDone}
                onPress={() => setShowDatePicker(false)}
              >
                <Text variant="smMd" color={colors.primary.main}>
                  확인
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.observerCard, !isPublic && styles.disabledCard]}
          onPress={() => isPublic && setIsViewerMode(value => !value)}
          disabled={!isPublic}
          activeOpacity={0.7}
        >
          <View style={styles.observerText}>
            <Text
              variant="smMd"
              color={!isPublic ? colors.icon.gray : colors.text.secondary}
            >
              관찰자모드
            </Text>
            <Text
              variant="xxs"
              color={!isPublic ? colors.icon.gray : colors.text.tertiary}
              style={styles.observerDescription}
            >
              참가 전에도 챌린지 활동을 살펴볼 수 있도록 허용해요
            </Text>
          </View>
          {isViewerMode ? (
            <RadioCheckedIcon width={24} height={24} />
          ) : (
            <RadioUncheckedIcon width={24} height={24} />
          )}
        </TouchableOpacity>

        <Text variant="xsReg" color={colors.text.tertiary} style={styles.label}>
          챌린지 규칙
        </Text>
        <TextInput
          style={styles.ruleInput}
          value={rule}
          onChangeText={setRule}
          placeholder="챌린지 규칙을 설명해 주세요"
          placeholderTextColor={colors.icon.gray}
          multiline
          textAlignVertical="top"
          maxLength={200}
          allowFontScaling={false}
        />
      </ScrollView>

      <View style={styles.bottomButton}>
        <Button
          variant={!isSaving && !isUploading ? 'black' : 'gray'}
          size="medium"
          onPress={handleSave}
          disabled={isSaving || isUploading}
        >
          {isSaving ? '저장 중' : '수정 완료'}
        </Button>
      </View>

      <VerificationMethodSheet
        visible={showMethodSheet}
        onClose={() => setShowMethodSheet(false)}
        selectedMethod={
          verificationType === 'PHOTO'
            ? 'photo'
            : verificationType === 'TEXT'
            ? 'text'
            : ''
        }
        onSelect={method =>
          setVerificationType(method === 'photo' ? 'PHOTO' : 'TEXT')
        }
      />
      <VerificationDaysSheet
        visible={showDaysSheet}
        onClose={() => setShowDaysSheet(false)}
        selectedDays={daysOfWeek}
        onConfirm={days => setDaysOfWeek(dedupeDays(days))}
      />
      <TimePickerSheet
        visible={showTimeSheet === 'start'}
        onClose={() => setShowTimeSheet(null)}
        title="시작 시간을 선택해 주세요"
        initialTime={verifyStartTime || undefined}
        onConfirm={setVerifyStartTime}
      />
      <TimePickerSheet
        visible={showTimeSheet === 'end'}
        onClose={() => setShowTimeSheet(null)}
        title="마감 시간을 선택해 주세요"
        initialTime={verifyEndTime || undefined}
        onConfirm={setVerifyEndTime}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  errorText: { textAlign: 'center', marginBottom: verticalScale(24) },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
  },
  imageBox: {
    width: scale(96),
    height: verticalScale(96),
    borderRadius: scale(10),
    backgroundColor: colors.background,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: verticalScale(32),
  },
  image: { width: '100%', height: '100%' },
  label: { marginBottom: verticalScale(12) },
  inputGroup: {
    backgroundColor: colors.background,
    borderRadius: scale(10),
    overflow: 'hidden',
    marginBottom: verticalScale(32),
  },
  input: {
    height: verticalScale(54),
    paddingHorizontal: scale(16),
    paddingVertical: 0,
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
  },
  divider: { height: verticalScale(1), backgroundColor: colors.line },
  // 챌린지 생성 4단계의 비밀번호 필드와 동일한 간격 규격을 사용한다.
  passwordSection: { marginBottom: verticalScale(20) },
  passwordInput: { height: verticalScale(60) },
  selectionGroup: {
    backgroundColor: colors.background,
    borderRadius: scale(10),
    overflow: 'hidden',
    marginBottom: verticalScale(20),
  },
  selectionRow: {
    minHeight: verticalScale(54),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  participantInputRow: { flexDirection: 'row', alignItems: 'center' },
  participantInput: {
    minWidth: scale(28),
    padding: 0,
    textAlign: 'right',
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
  },
  datePickerContainer: {
    backgroundColor: colors.background,
    borderRadius: scale(10),
    padding: scale(12),
    marginBottom: verticalScale(20),
  },
  datePickerDone: { alignSelf: 'flex-end', padding: scale(8) },
  observerCard: {
    minHeight: verticalScale(80),
    borderRadius: scale(10),
    borderWidth: scale(1.5),
    borderColor: colors.line,
    padding: scale(16),
    marginBottom: verticalScale(32),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabledCard: { backgroundColor: colors.background },
  observerText: { flex: 1, marginRight: scale(12) },
  observerDescription: { marginTop: verticalScale(6) },
  ruleInput: {
    minHeight: verticalScale(160),
    borderRadius: scale(10),
    backgroundColor: colors.background,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
  },
  bottomButton: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(32),
    borderTopWidth: verticalScale(1),
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
});
