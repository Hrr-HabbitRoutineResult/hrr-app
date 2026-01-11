import React, { useState, useEffect, useRef } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RNBlobUtil from 'react-native-blob-util';
import { openCamera, openGallery } from '../../libs/imagePicker';
import { RootStackParamList } from '../../navigation/types';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { colors } from '../../design/tokens';
import { useCreateChallenge } from '../../contexts/CreateChallengeContext';
import { getPresignedUrl } from '../../libs/api/challenge';
import CameraIcon from '../../../assets/icons/challenge-create/camera.svg';
import ChevronRightIcon from '../../../assets/icons/chevron-right-ic-grey.svg';
import ChevronDownIcon from '../../../assets/icons/chevron-down-ic-grey.svg';
import { VerificationMethodSheet } from '../../components/create-challenge/VerificationMethodSheet';
import { VerificationDaysSheet } from '../../components/create-challenge/VerificationDaysSheet';
import { TimePickerSheet } from '../../components/create-challenge/TimePickerSheet';

type CreateChallengeQ2NavigationProp = StackNavigationProp<RootStackParamList>;

export const CreateChallengeQ2 = () => {
  const navigation = useNavigation<CreateChallengeQ2NavigationProp>();
  const { data, updateData } = useCreateChallenge();


  // 입력 상태들
  const [challengeName, setChallengeName] = useState(data.challengeName);
  const [oneLiner, setOneLiner] = useState(data.oneLiner);
  const [verificationMethod, setVerificationMethod] = useState<'photo' | 'text' | ''>(data.verificationMethod);
  const [verificationDays, setVerificationDays] = useState<string[]>(data.verificationDays);
  const [startTime, setStartTime] = useState<{ period: 'AM' | 'PM'; hour: string; minute: string } | null>(data.startTime);
  const [endTime, setEndTime] = useState<{ period: 'AM' | 'PM'; hour: string; minute: string } | null>(data.endTime);
  const [maxParticipants, setMaxParticipants] = useState<number>(data.maxParticipants);
  const [challengeRules, setChallengeRules] = useState(data.challengeRules);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(data.thumbnailImageUri);
  const [isUploading, setIsUploading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const rulesInputY = useRef<number>(0);

  // 키보드 높이를 감지하여 ScrollView 하단에 동적 패딩 추가
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // 챌린지 규칙 입력창 포커스 시 화면 상단으로 자동 스크롤
  const handleRulesFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: rulesInputY.current - verticalScale(40),
        animated: true,
      });
    }, 300);
  };

  // 바텀시트 상태들
  const [showMethodSheet, setShowMethodSheet] = useState(false);
  const [showDaysSheet, setShowDaysSheet] = useState(false);
  const [showTimeSheet, setShowTimeSheet] = useState<'start' | 'end' | null>(null);
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);

  // 모든 필드가 채워졌는지 확인
  const isNextEnabled =
    thumbnailImage !== null &&
    challengeName.trim() !== '' &&
    oneLiner.trim() !== '' &&
    verificationMethod !== '' &&
    verificationDays.length > 0 &&
    startTime !== null &&
    endTime !== null &&
    maxParticipants >= 1 &&
    maxParticipants <= 30 &&
    challengeRules.trim() !== '';

  const handleNext = () => {
    if (isNextEnabled) {
      // Context에 데이터 저장
      updateData({
        challengeName,
        oneLiner,
        verificationMethod,
        verificationDays,
        startTime,
        endTime,
        maxParticipants,
        challengeRules,
        thumbnailImageUri: thumbnailImage,
      });

      try {
        navigation.navigate('CreateChallengeQ3');
      } catch (error) {
        // Navigation failed
      }
    }
  };

  // MIME type 결정
  const getMimeType = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
  };

  /**
   * S3 presigned PUT 업로드
   * - Android: fetch(file://)가 실패하므로 react-native-blob-util 사용
   * - iOS: 기존 fetch 방식
   */
  const uploadImageToS3 = async (imageUri: string): Promise<string | null> => {
    try {
      setIsUploading(true);

      // Android: URI에 file:// prefix가 없을 수 있어 보정
      let normalizedUri = imageUri;
      if (
        Platform.OS === 'android' &&
        !normalizedUri.startsWith('file://') &&
        !normalizedUri.startsWith('content://')
      ) {
        normalizedUri = `file://${normalizedUri}`;
      }

      const fileExtension = normalizedUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `challenge-profile-${Date.now()}.${fileExtension}`;
      const mimeType = getMimeType(fileExtension);

      const { presignedUrl, s3Key } = await getPresignedUrl(fileName);

      const uploadHeaders: Record<string, string> = {
        'Content-Type': mimeType,
      };

      // x-amz-acl 헤더 (서명에 포함되어 있으면 추가)
      try {
        const urlParts = presignedUrl.split('?');
        if (urlParts.length > 1) {
          const params = urlParts[1];
          if (params.includes('X-Amz-SignedHeaders') && params.includes('x-amz-acl')) {
            uploadHeaders['x-amz-acl'] = 'public-read';
          }
        }
      } catch (e) {
        // 파싱 실패 시에도 업로드 가능하므로 무시
      }

      const localPath = normalizedUri.startsWith('file://')
        ? normalizedUri.replace(/^file:\/\//, '')
        : normalizedUri;

      if (Platform.OS === 'android') {
        const resp = await RNBlobUtil.fetch('PUT', presignedUrl, uploadHeaders, RNBlobUtil.wrap(localPath));
        const status = resp.info().status;
        if (status !== 200 && status !== 204) {
          throw new Error(`업로드 실패 (${status})`);
        }
      } else {
        const response = await fetch(normalizedUri);
        if (!response.ok) throw new Error('이미지 로드 실패');
        const blob = await response.blob();
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: blob,
          headers: uploadHeaders,
        });
        if (!uploadResponse.ok) {
          throw new Error(`업로드 실패 (${uploadResponse.status})`);
        }
      }

      return s3Key;
    } catch (error: any) {
      const errorMessage = error.message || '알 수 없는 오류';
      Alert.alert('이미지 업로드 실패', errorMessage);
      return null;
    } finally {
      setIsUploading(false);
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
              updateData({ thumbnailImageUri: asset.uri });

              // 이미지 업로드
              const s3Key = await uploadImageToS3(asset.uri);
              if (s3Key) {
                updateData({ imageKey: s3Key });
              }
            }
          },
        },
        {
          text: '갤러리',
          onPress: async () => {
            const asset = await openGallery();
            if (asset?.uri) {
              setThumbnailImage(asset.uri);
              updateData({ thumbnailImageUri: asset.uri });

              // 이미지 업로드
              const s3Key = await uploadImageToS3(asset.uri);
              if (s3Key) {
                updateData({ imageKey: s3Key });
              }
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <Header
        onBack={() => navigation.goBack()}
        title="챌린지 개설"
      />

      {/* 진행률 표시줄 */}
      <ProgressBar currentStep={2} totalSteps={4} />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight : verticalScale(40) }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 카메라 이미지 박스 */}
        <TouchableOpacity
          style={styles.imageBox}
          onPress={() => {
            Keyboard.dismiss();
            handleImagePicker();
          }}
          activeOpacity={0.7}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="large" color={colors.primary.main} />
          ) : thumbnailImage ? (
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
              onChangeText={(text) => {
                // 10자 이내로 제한
                const limitedText = text.length > 10 ? text.substring(0, 10) : text;
                setChallengeName(limitedText);
                updateData({ challengeName: limitedText });
              }}
              maxLength={10}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="한줄소개를 적어주세요"
              placeholderTextColor={colors.icon.gray}
              value={oneLiner}
              onChangeText={(text) => {
                // 20자 이내로 제한
                const limitedText = text.length > 20 ? text.substring(0, 20) : text;
                setOneLiner(limitedText);
                updateData({ oneLiner: limitedText });
              }}
              maxLength={20}
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
            style={[styles.selectionRow, styles.selectionRowDivider]}
            onPress={() => {
              Keyboard.dismiss();
              setShowMethodSheet(true);
            }}
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

          {/* 인증요일 */}
          <TouchableOpacity
            style={[styles.selectionRow, styles.selectionRowDivider]}
            onPress={() => {
              Keyboard.dismiss();
              setShowDaysSheet(true);
            }}
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

          {/* 인증시간대 */}
          <TouchableOpacity
            style={[
              styles.selectionRow,
              !isTimeExpanded && styles.selectionRowDivider,
            ]}
            onPress={() => {
              Keyboard.dismiss();
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
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowTimeSheet('start');
                  }}
                  activeOpacity={0.7}
                >
                  <Text variant="smMd" color={colors.text.secondary}>
                    {startTime.period} {startTime.hour}:{startTime.minute}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowTimeSheet('end');
                  }}
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
              <View style={styles.divider} />
            </>
          )}

          {/* 정원 */}
          <View style={styles.selectionRow}>
            <Text variant="smReg" color={colors.text.tertiary}>
              정원
            </Text>
            <View style={styles.participantsInputContainer}>
              <TextInput
                style={styles.participantsInput}
                value={maxParticipants >= 1 ? String(maxParticipants) : ''}
                onChangeText={(text) => {
                  const number = parseInt(text) || 0;
                  // 1 이상 30 이하로 제한
                  if (number >= 1 && number <= 30) {
                    setMaxParticipants(number);
                    updateData({ maxParticipants: number });
                  } else if (number === 0) {
                    // 0 입력 시 빈 값으로 설정
                    setMaxParticipants(0);
                    updateData({ maxParticipants: 0 });
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
        <View
          style={styles.rulesContainer}
          onLayout={(e) => {
            rulesInputY.current = e.nativeEvent.layout.y;
          }}
        >
          <TextInput
            style={styles.rulesInput}
            placeholder="챌린지 규칙을 설명해 주세요 (진행 방식 등)"
            placeholderTextColor={colors.icon.gray}
            value={challengeRules}
            onChangeText={(text) => {
              // 200자 이내로 제한
              const limitedText = text.length > 200 ? text.substring(0, 200) : text;
              setChallengeRules(limitedText);
              updateData({ challengeRules: limitedText });
            }}
            multiline
            textAlignVertical="top"
            maxLength={200}
            onFocus={handleRulesFocus}
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
        onClose={() => {
          Keyboard.dismiss();
          setShowMethodSheet(false);
        }}
        selectedMethod={verificationMethod}
        onSelect={(method) => {
          setVerificationMethod(method);
          updateData({ verificationMethod: method });
          Keyboard.dismiss();
        }}
      />

      <VerificationDaysSheet
        visible={showDaysSheet}
        onClose={() => {
          Keyboard.dismiss();
          setShowDaysSheet(false);
        }}
        selectedDays={verificationDays}
        onConfirm={(days) => {
          setVerificationDays(days);
          updateData({ verificationDays: days });
          Keyboard.dismiss();
        }}
      />

      <TimePickerSheet
        visible={showTimeSheet === 'start'}
        onClose={() => {
          Keyboard.dismiss();
          setShowTimeSheet(null);
        }}
        title="시작 시간을 선택해 주세요"
        initialTime={startTime || { period: 'AM', hour: '12', minute: '00' }}
        onConfirm={(time) => {
          setStartTime(time);
          updateData({ startTime: time });
          Keyboard.dismiss();
          // 약간의 딜레이를 주어 부드러운 전환
          setTimeout(() => {
            setShowTimeSheet('end');
          }, 300);
        }}
      />

      <TimePickerSheet
        visible={showTimeSheet === 'end'}
        onClose={() => {
          Keyboard.dismiss();
          setShowTimeSheet(null);
        }}
        title="마감 시간을 선택해 주세요"
        initialTime={endTime || { period: 'PM', hour: '11', minute: '50' }}
        onConfirm={(time) => {
          setEndTime(time);
          updateData({ endTime: time });
          Keyboard.dismiss();
        }}
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
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(40),
  },
  imageBox: {
    width: scale(80),
    height: verticalScale(80),
    borderRadius: scale(10),
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
    alignSelf: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    height: verticalScale(108),
    backgroundColor: colors.background,
    borderRadius: scale(10),
    marginBottom: verticalScale(20),
    overflow: 'hidden',
  },
  inputRow: {
    flex: 1,
    paddingHorizontal: scale(16),
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
    height: verticalScale(216),
    backgroundColor: colors.background,
    borderRadius: scale(10),
    marginBottom: verticalScale(20),
    overflow: 'hidden',
  },
  selectionContainerExpanded: {
    height: verticalScale(320),
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: verticalScale(54),
    paddingHorizontal: scale(16),
  },
  selectionRowDivider: {
    borderBottomWidth: verticalScale(1),
    borderBottomColor: colors.line,
  },
  selectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  chevronContainer: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  timeDisplayContainer: {
    flexDirection: 'row',
    gap: scale(12),
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(18),
  },
  timeBox: {
    flex: 1,
    height: verticalScale(46),
    borderRadius: scale(6),
    backgroundColor: colors.line,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: scale(20),
  },
  timeNoticeContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(18),
  },
  timeNotice: {
    lineHeight: verticalScale(12),
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
    height: verticalScale(1),
    backgroundColor: colors.line,
  },
  rulesContainer: {
    height: verticalScale(208),
    backgroundColor: colors.background,
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
    marginBottom: verticalScale(20),
  },
  rulesInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.secondary,
    padding: 0,
  },
  tipContainer: {
    marginBottom: verticalScale(20),
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: verticalScale(10),
  },
  tipBadge: {
    width: scale(37),
    height: verticalScale(22),
    backgroundColor: colors.primary.main,
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    lineHeight: verticalScale(20),
  },
  tipList: {
    gap: scale(4),
  },
  tipItemContainer: {
    paddingLeft: scale(18),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(6),
  },
  tipBullet: {
    alignSelf: 'center',
    width: scale(2),
    height: verticalScale(2),
    borderRadius: scale(1),
    backgroundColor: colors.text.tertiary,
  },
  tipItem: {
    flex: 1,
    lineHeight: verticalScale(20),
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
});
