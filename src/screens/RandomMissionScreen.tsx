import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert, Platform, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { scale, verticalScale } from '../utils/scaling';
import { getErrorMessage } from '../utils/errorHandler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import RNBlobUtil from 'react-native-blob-util';
import { Button } from '../components/common/Button';
import { Text } from '../components/common/Text';
import { colors, typography } from '../design/tokens';
import BackIcon from '../../assets/icons/back.svg';
import IconExercise from '../../assets/icons/homescreen/categorychips/ic_exercise.svg';
import IconStudy from '../../assets/icons/homescreen/categorychips/ic_study.svg';
import IconHobby from '../../assets/icons/homescreen/categorychips/ic_hobby.svg';
import IconJob from '../../assets/icons/homescreen/categorychips/ic_job.svg';
import IconLifestyle from '../../assets/icons/homescreen/categorychips/ic_lifestyle.svg';
import MissionArrivedIcon from '../../assets/images/random-mission-arrived.svg';
import MissionCompleteIcon from '../../assets/images/random-mission-complete.svg';
import {
  getDailyMission,
  DailyMissionInfo,
  getPresignedUrl,
  verifyDailyMission,
} from '../libs/api/challenge';
import { openCamera } from '../libs/imagePicker';
import { useUserStore } from '../store/userSlice';

const RandomMissionScreen = () => {
  const navigation = useNavigation();
  const { setRandomMissionCompleted, randomMissionCompleted } = useUserStore();
  const [missionData, setMissionData] = useState<DailyMissionInfo | null>(null);
  const [, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTimestamp, setImageTimestamp] = useState<Date | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const data = await getDailyMission();
        setMissionData(data);
      } catch {
        // 네트워크/서버 오류가 나더라도 화면은 유지하고 로딩 상태만 해제
      } finally {
        setIsLoading(false);
      }
    };

    fetchMission();
  }, []);

  const handleBack = () => {
    if (selectedImage) {
      // 이미지 선택 화면에서 뒤로가기 시 이미지 초기화
      setSelectedImage(null);
      setImageTimestamp(null);
    } else {
      navigation.goBack();
    }
  };

  const handleImagePicker = async () => {
    const asset = await openCamera();
    if (asset?.uri) {
      setSelectedImage(asset.uri);
      const capturedAt = asset.timestamp ? new Date(asset.timestamp) : null;
      setImageTimestamp(
        capturedAt && !Number.isNaN(capturedAt.getTime()) ? capturedAt : new Date(),
      );
    }
  };

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
   * - Android: `fetch(file://...)`가 실패하므로 react-native-blob-util 사용
   * - iOS: 기존 fetch + blob 방식
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
      const fileName = `image.${fileExtension}`;
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
      } catch {
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
      const errorMessage = getErrorMessage(error, '이미지 업로드에 실패했습니다.');
      Alert.alert('이미지 업로드 실패', errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCertify = async () => {
    if (!selectedImage) {
      // 이미지가 선택되지 않은 경우 이미지 선택 화면으로
      handleImagePicker();
      return;
    }

    if (!missionData) {
      Alert.alert('오류', '미션 정보를 불러올 수 없습니다.');
      return;
    }

    try {
      setIsUploading(true);

      // 1. S3에 이미지 업로드
      const s3Key = await uploadImageToS3(selectedImage);
      if (!s3Key) {
        return; // 업로드 실패 시 에러는 uploadImageToS3에서 이미 표시됨
      }

      // 2. 랜덤 미션 인증 API 호출
      await verifyDailyMission({
        missionId: missionData.missionId,
        imageKey: s3Key,
      });

      // 3. 랜덤 미션 완료 상태 업데이트
      setRandomMissionCompleted(true);

      // 성공 팝업 대신 시안의 미션 완료 상태를 바로 보여준다.
      setSelectedImage(null);
      setImageTimestamp(null);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, '인증에 실패했습니다.');
      Alert.alert('인증 실패', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    handleImagePicker();
  };

  const formatTimestamp = (date: Date): string => {
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day}  |  ${hours}:${minutes}`;
  };

  // 이미지가 선택된 경우 인증 화면 표시
  if (selectedImage) {
    return (
      <SafeAreaView style={styles.certificationContainer} edges={['top', 'left', 'right']}>
        <View style={styles.certificationContent}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="촬영 닫기"
            onPress={handleBack}
            style={styles.cameraClose}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text variant="header2" color={colors.white} style={styles.cameraCloseText}>×</Text>
          </TouchableOpacity>
          {/* 이미지 썸네일 */}
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
            {/* 타임스탬프 오버레이 */}
            {imageTimestamp && (
              <View style={styles.timestampContainer}>
                {Platform.OS === 'ios' ? (
                  <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={20}
                    reducedTransparencyFallbackColor="black"
                  />
                ) : (
                  <>
                    {/* 어두운 블러 효과 시뮬레이션 레이어 */}
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        styles.cameraShade,
                      ]}
                    />
                    {/* 밝은 블러 효과 시뮬레이션 레이어 */}
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        styles.cameraHighlight,
                      ]}
                    />
                  </>
                )}
                <Text variant="xsReg" color={colors.white} style={styles.timestampText}>
                  {formatTimestamp(imageTimestamp)}
                </Text>
              </View>
            )}
          </View>

          {/* 버튼 컨테이너 */}
          <View style={styles.certificationButtonContainer}>
            <Button
              variant="white"
              onPress={handleRetake}
              style={styles.retakeButton}
              disabled={isUploading}
            >
              재촬영하기
            </Button>
            <Button
              variant="primary"
              onPress={handleCertify}
              style={styles.certifyButton}
              disabled={isUploading}
            >
              {isUploading ? '업로드 중...' : '인증하기'}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 기본 미션 화면
  const missionCompleted = randomMissionCompleted || missionData?.isCompleted;
  const missionTitle = missionData?.title || '건강식 한 끼 먹기';
  const missionDescription = missionData?.content || '오늘의 한 끼는 건강하게 챙겨보세요!';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <BackIcon width={9} height={18} />
        </TouchableOpacity>
        <Text variant="header4" color={colors.text.primary} style={styles.headerTitle}>
          랜덤미션
        </Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <Text variant="header2" color={colors.text.primary} style={styles.mainTitle}>
          {missionCompleted ? '미션을 완료했어요!' : '오늘의 랜덤미션이 도착했어요!'}
        </Text>

        <View style={styles.missionCard}>
          {missionCompleted ? (
            <>
              <View style={styles.completedMissionText}>
                <Text variant="header2" color={colors.text.primary} style={styles.missionTitle}>
                  {missionTitle}
                </Text>
                <Text variant="xsReg" color={colors.text.tertiary} style={styles.missionDescription}>
                  {missionDescription}
                </Text>
              </View>
              <View style={styles.completeIllustration}>
                <MissionCompleteIcon width={scale(240)} height={scale(240)} />
              </View>
              <View style={styles.completedFooter}>
                <View style={styles.cardDivider} />
                <Text variant="smMd" color={colors.text.primary} style={styles.completeMessage}>
                  내일 새로운 미션으로 다시 만나요
                </Text>
                <View style={styles.cardDivider} />
              </View>
            </>
          ) : (
            <>
              <MissionArrivedIcon width={scale(152)} height={scale(152)} />
              <View style={styles.missionText}>
                <Text variant="header2" color={colors.text.primary} style={styles.missionTitle}>
                  {missionTitle}
                </Text>
                <Text variant="xsReg" color={colors.text.tertiary} style={styles.missionDescription}>
                  {missionDescription}
                </Text>
              </View>
              <View style={styles.categoryFooter}>
                <View style={styles.cardDivider} />
                <View style={styles.categoryIconRow}>
                  <IconExercise width={24} height={24} />
                  <IconStudy width={24} height={24} />
                  <IconHobby width={24} height={24} />
                  <IconJob width={24} height={24} />
                  <IconLifestyle width={24} height={24} />
                </View>
                <View style={styles.cardDivider} />
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant={missionCompleted ? 'gray' : 'black'}
          onPress={handleCertify}
          disabled={missionCompleted}
        >
          {missionCompleted ? '완료' : '인증하기'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.lightest,
  },
  header: {
    height: verticalScale(72),
    paddingHorizontal: scale(20),
    borderBottomWidth: scale(1),
    borderBottomColor: colors.primary.lighter,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: scale(48),
    height: verticalScale(48),
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    alignItems: 'center',
  },
  mainTitle: {
    marginTop: verticalScale(30),
    marginBottom: verticalScale(24),
    textAlign: 'center',
    lineHeight: typography.header2.lineHeight,
  },
  missionCard: {
    width: '100%',
    height: verticalScale(400),
    borderRadius: scale(20),
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingTop: verticalScale(40),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: scale(10),
    elevation: 4,
  },
  missionText: {
    marginTop: verticalScale(8),
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: scale(24),
  },
  completedMissionText: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: scale(24),
  },
  missionTitle: {
    textAlign: 'center',
    marginBottom: verticalScale(6),
  },
  missionDescription: {
    textAlign: 'center',
    lineHeight: typography.xsReg.lineHeight,
  },
  categoryFooter: {
    position: 'absolute',
    bottom: verticalScale(28),
    alignItems: 'center',
  },
  categoryIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    marginVertical: verticalScale(10),
  },
  cardDivider: {
    width: scale(290),
    height: scale(1),
    backgroundColor: colors.primary.light,
  },
  completeIllustration: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedFooter: {
    alignItems: 'center',
    marginBottom: verticalScale(28),
  },
  completeMessage: {
    textAlign: 'center',
    marginVertical: verticalScale(12),
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
  // 인증 화면 스타일
  certificationContainer: {
    flex: 1,
    backgroundColor: colors.text.primary,
  },
  certificationContent: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(28),
    justifyContent: 'space-between',
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
  cameraClose: {
    position: 'absolute',
    top: verticalScale(16),
    left: scale(20),
    zIndex: 2,
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCloseText: {
    fontSize: scale(30),
    lineHeight: scale(32),
    fontFamily: 'Pretendard-Light',
    fontWeight: '300',
  },
  thumbnailContainer: {
    width: '100%',
    maxWidth: scale(350),
    height: verticalScale(350),
    borderRadius: scale(20),
    overflow: 'hidden',
    position: 'relative',
    marginTop: verticalScale(80),
  },
  thumbnailImage: {
    width: '100%',
    maxWidth: scale(350),
    height: verticalScale(350),
  },
  timestampContainer: {
    position: 'absolute',
    bottom: verticalScale(16),
    right: scale(16),
    width: scale(137),
    height: verticalScale(32),
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  timestampText: {
    color: colors.white,
  },
  cameraShade: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: scale(10),
  },
  cameraHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: scale(10),
  },
  certificationButtonContainer: {
    width: '100%',
    maxWidth: scale(350),
    gap: verticalScale(10),
    paddingBottom: verticalScale(32),
  },
  retakeButton: {
    marginBottom: 0,
  },
  certifyButton: {
    marginBottom: 0,
  },
});

export default RandomMissionScreen;
