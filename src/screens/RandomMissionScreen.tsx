import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { scale, verticalScale } from '../utils/scaling';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import RNBlobUtil from 'react-native-blob-util';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Text } from '../components/common/Text';
import { colors } from '../design/tokens';
import RandomMissionFrame from '../../assets/images/random-mission-frame.svg';
import MissionCompleteSvg from '../../assets/images/mission-complete.svg';
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTimestamp, setImageTimestamp] = useState<Date | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const data = await getDailyMission();
        setMissionData(data);
      } catch (error) {
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
      setImageTimestamp(new Date());
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
      const result = await verifyDailyMission({
        missionId: missionData.missionId,
        imageKey: s3Key,
      });

      // 3. 랜덤 미션 완료 상태 업데이트
      setRandomMissionCompleted(true);

      Alert.alert('인증 완료', result, [
        {
          text: '확인',
          onPress: () => {
            // 인증 완료 후 화면 초기화 및 뒤로가기
            setSelectedImage(null);
            setImageTimestamp(null);
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.message || '인증에 실패했습니다.';
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
      <SafeAreaView style={styles.certificationContainer}>
        <View style={styles.certificationContent}>
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
  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={handleBack} title="랜덤미션" showDivider />

      <View style={styles.content}>
        <Text variant="header1" color={colors.text.primary} style={styles.mainTitle}>
          {randomMissionCompleted || missionData?.isCompleted
            ? '미션을 완료했어요!\n내일 새로운 미션으로 만나요'
            : '미션에 참여하고\n플로우 스코어를 받아요!'}
        </Text>

        {/* 이미지 + 오버레이 + 텍스트 컨테이너 */}
        <View style={styles.imageContainer}>
          {/* 미션 이미지 */}
          {missionData?.imageUrl ? (
            <Image
              source={{ uri: missionData.imageUrl }}
              style={styles.missionImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder} />
          )}

          {/* 그라데이션 오버레이 */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.16)', 'rgba(0, 0, 0, 0.8)']}
            style={styles.gradientOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* 프레임 오버레이 */}
          <View style={styles.frameOverlay}>
            <RandomMissionFrame width="90%" height="90%" preserveAspectRatio="none" />
          </View>

          {/* 미션 인증 완료 오버레이 */}
          {(randomMissionCompleted || missionData?.isCompleted) && (
            <View style={styles.completeOverlay}>
              <MissionCompleteSvg width="100%" height="100%" preserveAspectRatio="none" />
            </View>
          )}

          {/* 텍스트 오버레이 */}
          <View style={styles.textOverlay}>
            <Text variant="header1" color={colors.white} style={styles.missionTitle}>
              {missionData?.title || '로딩 중...'}
            </Text>
            <Text variant="smMd" color={colors.white} style={styles.missionDescription}>
              {missionData?.content || ''}
            </Text>
          </View>
        </View>

        {/* 완료 상태 안내 텍스트 */}
        {(randomMissionCompleted || missionData?.isCompleted) && (
          <Text variant="xsReg" color={colors.text.secondary} style={styles.completeMessage}>
            인증 내용을 확인 후 플로우 스코어 1점을 드릴게요
          </Text>
        )}
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          onPress={handleCertify}
          disabled={randomMissionCompleted || missionData?.isCompleted}
        >
          인증하기
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
    paddingHorizontal: scale(20),
  },
  mainTitle: {
    marginTop: verticalScale(28),
    marginBottom: verticalScale(32),
    lineHeight: verticalScale(30),
  },
  imageContainer: {
    width: '100%',
    height: verticalScale(400),
    borderRadius: scale(20),
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.line,
  },
  missionImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  frameOverlay: {
    paddingLeft: scale(30),
    paddingTop: verticalScale(32),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  completeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 4,
  },
  textOverlay: {
    position: 'absolute',
    bottom: verticalScale(70),
    left: scale(10),
    right: 0,
    paddingLeft: scale(24),
    paddingBottom: verticalScale(28),
    zIndex: 3,
  },
  missionTitle: {
    marginBottom: verticalScale(6),
  },
  missionDescription: {
    lineHeight: verticalScale(22),
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
  completeMessage: {
    marginTop: verticalScale(24),
    textAlign: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestampText: {
    color: colors.white,
  },
  certificationButtonContainer: {
    width: '100%',
    maxWidth: scale(350),
    gap: verticalScale(10),
    paddingTop: verticalScale(20),
  },
  retakeButton: {
    marginBottom: 0,
  },
  certifyButton: {
    marginBottom: 0,
  },
});

export default RandomMissionScreen;
