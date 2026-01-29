import React, { useState, useEffect, useRef } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import { View, StyleSheet, Image, Alert, Dimensions, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ViewShot from 'react-native-view-shot';
import RNBlobUtil from 'react-native-blob-util';
import { Button } from '../../components/common/Button';
import { Text } from '../../components/common/Text';
import { colors } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { openCamera } from '../../libs/imagePicker';
import { getPresignedUrl } from '../../libs/api/challenge';

type ChallengeCertificationCameraScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeCertificationCamera'>;
type ChallengeCertificationCameraScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeCertificationCamera'
>;

export const ChallengeCertificationCameraScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeCertificationCameraScreenNavigationProp>();
  const route = useRoute<ChallengeCertificationCameraScreenRouteProp>();
  const { challengeId } = route.params;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTimestamp, setImageTimestamp] = useState<Date | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const CROP_SIZE = 350;

  useEffect(() => {
    handleImagePicker();
  }, []);

  const handleBack = () => {
    if (selectedImage) {
      setSelectedImage(null);
      setImageTimestamp(null);
    } else {
      navigation.goBack();
    }
  };

  const handleImagePicker = async () => {
    const asset = await openCamera();
    if (asset?.uri) {
      setIsImageLoaded(false);
      setSelectedImage(asset.uri);
      setImageTimestamp(new Date());

      Image.getSize(
        asset.uri,
        (width, height) => {
          setImageSize({ width, height });
        },
        (error) => {
          // Android 일부 URI에서 getSize 실패 시 폴백
          setImageSize({ width: scale(1024), height: 1024 });
        }
      );
    } else {
      navigation.goBack();
    }
  };

  const formatTimestamp = (date: Date): string => {
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day}  |  ${hours}:${minutes}`;
  };

  const getMimeType = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
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
      const fileName = `challenge-cert-${Date.now()}.${fileExtension}`;
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
        if (blob.size === 0) throw new Error('이미지가 비어있습니다.');
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: blob,
          headers: uploadHeaders,
        });
        if (!uploadResponse.ok) {
          throw new Error(`업로드 실패 (${uploadResponse.status})`);
        }
      }

      const s3ImageUrl = presignedUrl.split('?')[0];

      return s3ImageUrl;
    } catch (error: any) {
      Alert.alert('이미지 업로드 실패', error.message || '알 수 없는 오류');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    handleImagePicker();
  };

  const handleCertify = async () => {
    if (!selectedImage || !imageTimestamp || !viewShotRef.current) {
      return;
    }

    try {
      if (!isImageLoaded) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
      } else {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 200));
      }

      // ViewShot으로 이미지 캡처
      const viewShot = viewShotRef.current as any;
      if (!viewShot) {
        Alert.alert('오류', '이미지를 캡처할 수 없습니다.');
        return;
      }

      const capturedUri = await viewShot.capture();

      if (!capturedUri) {
        Alert.alert('오류', '이미지를 캡처할 수 없습니다.');
        return;
      }

      // iOS에서 file:// 접두사 추가
      let localUri = capturedUri;
      if (!localUri.startsWith('file://') && !localUri.startsWith('http://') && !localUri.startsWith('https://') && !localUri.startsWith('data:')) {
        localUri = `file://${localUri}`;
      }

      // 캡처된 이미지 검증
      try {
        if (Platform.OS === 'android') {
          const p = localUri.startsWith('file://') ? localUri.replace(/^file:\/\//, '') : localUri;
          const stat = await RNBlobUtil.fs.stat(p);
          const size = Number(stat.size);
          if (!size || size === 0) throw new Error('캡처된 이미지가 비어있습니다.');
        } else {
          const testResponse = await fetch(localUri);
          if (!testResponse.ok) throw new Error('캡처된 이미지를 읽을 수 없습니다.');
          const testBlob = await testResponse.blob();
          if (testBlob.size === 0) throw new Error('캡처된 이미지가 비어있습니다.');
        }
      } catch (error) {
        Alert.alert('오류', '캡처된 이미지를 확인할 수 없습니다. 다시 시도해주세요.');
        return;
      }

      const s3ImageUrl = await uploadImageToS3(localUri);

      if (!s3ImageUrl) {
        return;
      }

      navigation.navigate('ChallengeCertificationPost', {
        challengeId,
        imageUri: s3ImageUrl,
      });
    } catch (error) {
      Alert.alert('오류', '이미지를 처리하는데 실패했습니다.');
    }
  };

  // 이미지가 선택된 경우 인증 화면 표시
  if (selectedImage && imageSize) {
    const screenWidth = Dimensions.get('window').width - 40;
    const displaySize = Math.min(screenWidth, CROP_SIZE);

    return (
      <SafeAreaView style={styles.certificationContainer}>
        <View style={styles.certificationContent}>
          {/* 이미지 썸네일 */}
          <View style={styles.previewContainer}>
            {/* ViewShot (캡처용) */}
            <ViewShot
              ref={viewShotRef}
              style={[
                styles.hiddenViewShot,
                {
                  width: CROP_SIZE,
                  height: CROP_SIZE,
                }
              ]}
              options={{
                format: 'jpg',
                quality: 1.0,
                result: 'tmpfile',
                width: CROP_SIZE,
                height: CROP_SIZE,
                snapshotContentContainer: false,
              }}
            >
              <Image
                source={{ uri: selectedImage }}
                style={[
                  styles.thumbnailImage,
                  {
                    width: CROP_SIZE,
                    height: CROP_SIZE,
                  }
                ]}
                resizeMode="cover"
                onLoad={() => {
                  setIsImageLoaded(true);
                }}
                onError={(error) => {
                  // 일부 URI에서 onError 발생 가능. 캡처/업로드 단계에서 재검증
                }}
              />
              {/* 타임스탬프 오버레이 */}
              {imageTimestamp && (
                <View style={[
                  styles.timestampContainer,
                  {
                    bottom: verticalScale(16),
                    right: scale(16),
                  }
                ]}>
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
                          {
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            borderRadius: scale(10),
                          },
                        ]}
                      />
                      {/* 밝은 블러 효과 시뮬레이션 레이어 */}
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: scale(10),
                          },
                        ]}
                      />
                    </>
                  )}
                  <Text variant="xsReg" color={colors.white} style={styles.timestampText}>
                    {formatTimestamp(imageTimestamp)}
                  </Text>
                </View>
              )}
            </ViewShot>

            {/* 프리뷰 */}
            <View style={[
              styles.previewImage,
              {
                width: displaySize,
                height: displaySize,
              }
            ]}>
              <Image
                source={{ uri: selectedImage }}
                style={[
                  styles.thumbnailImage,
                  {
                    width: displaySize,
                    height: displaySize,
                  }
                ]}
                resizeMode="cover"
              />
              {/* 타임스탬프 오버레이 */}
              {imageTimestamp && (
                <View style={[
                  styles.timestampContainer,
                  {
                    bottom: verticalScale(16),
                    right: scale(16),
                  }
                ]}>
                  {Platform.OS === 'ios' ? (
                    <BlurView
                      style={StyleSheet.absoluteFill}
                      blurType="light"
                      blurAmount={20}
                      reducedTransparencyFallbackColor="black"
                    />
                  ) : (
                    <>
                      {/* 배경을 약간 어둡게 하는 레이어 (블러의 어두운 부분 시뮬레이션) */}
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                            borderRadius: scale(10),
                          },
                        ]}
                      />
                      {/* 밝은 블러 효과 시뮬레이션 레이어 */}
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: scale(10),
                          },
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
              인증하기
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 카메라 로딩 중
  return (
    <SafeAreaView style={styles.certificationContainer}>
      <View style={styles.loadingContainer}>
        <Text variant="md" color={colors.white}>
          타임스탬프를 찍고 있어요...
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: verticalScale(80),
  },
  thumbnailContainer: {
    position: 'absolute',
    opacity: 0,
    overflow: 'hidden',
  },
  previewImage: {
    borderRadius: scale(20),
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  timestampContainer: {
    position: 'absolute',
    bottom: verticalScale(16),
    right: scale(16),
    width: scale(137),
    height: verticalScale(32),
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  androidBlurOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: scale(10),
  },
  timestampText: {
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  certificationButtonContainer: {
    width: '100%',
    maxWidth: scale(350),
    gap: scale(10),
    paddingTop: verticalScale(20),
  },
  retakeButton: {
    marginBottom: verticalScale(0),
  },
  certifyButton: {
    marginBottom: verticalScale(0),
  },
  hiddenViewShot: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    overflow: 'hidden',
  },
});
