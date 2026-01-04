import React, { useState, useEffect } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RNBlobUtil from 'react-native-blob-util';
import { Header } from '../../components/common/Header';
import { Text } from '../../components/common/Text';
import { LinkLoadingSpinner } from '../../components/common/LinkLoadingSpinner';
import { colors, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { updateVerification, getPresignedUrl } from '../../libs/api/challenge';
import { openGalleryMultiple } from '../../libs/imagePicker';
import PostGalleryIcon from '../../../assets/icons/challenge-profile/post-gallery.svg';
import PostLinkIcon from '../../../assets/icons/challenge-profile/post-link.svg';
import DeleteIcon from '../../../assets/icons/challenge-profile/delete.svg';

type ChallengeCertificationTextEditScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeCertificationTextEdit'>;
type ChallengeCertificationTextEditScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeCertificationTextEdit'
>;

export const ChallengeCertificationTextEditScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeCertificationTextEditScreenNavigationProp>();
  const route = useRoute<ChallengeCertificationTextEditScreenRouteProp>();
  const { verification } = route.params;

  const [title, setTitle] = useState(verification.title || '');
  const [content, setContent] = useState(verification.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedImages, setSelectedImages] = useState<Array<{ uri: string; url: string; uploading: boolean }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [attachedLink, setAttachedLink] = useState<string | null>(null);
  const [isLinkLoading, setIsLinkLoading] = useState(false);

  // 기존 이미지 초기화
  useEffect(() => {
    if (verification.photoUrl) {
      const cleanUrl = verification.photoUrl.endsWith('/')
        ? verification.photoUrl.slice(0, -1)
        : verification.photoUrl;

      setSelectedImages([{
        uri: cleanUrl,
        url: cleanUrl,
        uploading: false,
      }]);
    }
  }, [verification.photoUrl]);

  // 키보드 이벤트 리스너
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleBack = () => {
    navigation.goBack();
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

  // S3에 이미지 업로드
  const uploadImageToS3 = async (imageUri: string): Promise<string | null> => {
    try {
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
      const fileName = `text-verification-${Date.now()}.${fileExtension}`;
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

      const s3Url = presignedUrl.split('?')[0];
      return s3Url;
    } catch (error: any) {
      Alert.alert('오류', `이미지 업로드에 실패했습니다: ${error.message}`);
      return null;
    }
  };

  const handleGalleryPress = async () => {
    try {
      const assets = await openGalleryMultiple(10);

      if (assets && assets.length > 0) {
        // 선택한 이미지들을 state에 추가 (uploading 상태로)
        const newImages = assets.map(asset => ({
          uri: asset.uri!,
          url: '',
          uploading: true,
        }));

        setSelectedImages(prev => [...prev, ...newImages]);

        // 각 이미지를 S3에 업로드
        for (let i = 0; i < assets.length; i++) {
          const asset = assets[i];
          if (asset.uri) {
            const s3Url = await uploadImageToS3(asset.uri);

            if (s3Url) {
              // 업로드 완료된 이미지의 url 업데이트
              setSelectedImages(prev =>
                prev.map(img =>
                  img.uri === asset.uri
                    ? { ...img, url: s3Url, uploading: false }
                    : img
                )
              );
            } else {
              // 업로드 실패 시 해당 이미지 제거
              setSelectedImages(prev => prev.filter(img => img.uri !== asset.uri));
            }
          }
        }
      }
    } catch (error) {
      Alert.alert('오류', '이미지 선택에 실패했습니다.');
    }
  };

  const handleRemoveImage = (uri: string) => {
    setSelectedImages(prev => prev.filter(img => img.uri !== uri));
  };

  const handleLinkPress = () => {
    setShowLinkModal(true);
  };

  const handleLinkCancel = () => {
    setShowLinkModal(false);
    setLinkUrl('');
  };

  const handleLinkConfirm = async () => {
    if (!linkUrl.trim()) {
      Alert.alert('알림', 'URL을 입력해주세요.');
      return;
    }

    // URL 유효성 검사 (간단한 체크)
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(linkUrl.trim())) {
      Alert.alert('알림', '올바른 URL 형식을 입력해주세요.');
      return;
    }

    setIsLinkLoading(true);
    setAttachedLink(linkUrl.trim());
    
    // TODO: 실제 링크 썸네일 로딩 로직
    // 지금은 10초 후 로딩 완료로 시뮬레이션
    setTimeout(() => {
      setIsLinkLoading(false);
      setShowLinkModal(false);
      setLinkUrl('');
    }, 10000);
  };

  const handleComplete = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    // 아직 업로드 중인 이미지가 있는지 확인
    const uploadingImages = selectedImages.filter(img => img.uploading);
    if (uploadingImages.length > 0) {
      Alert.alert('알림', '이미지 업로드가 완료될 때까지 기다려주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 첫 번째 이미지 URL 사용
      const photoUrl = selectedImages.length > 0 && selectedImages[0].url
        ? selectedImages[0].url
        : '';

      await updateVerification(verification.verificationId, {
        title: title.trim(),
        content: content.trim(),
        textUrl: '',
        photoUrl: photoUrl,
      });

      Alert.alert('성공', '게시글이 수정되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '게시글 수정에 실패했습니다.';
      Alert.alert('오류', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (text: string) => {
    if (text.length <= 200) {
      setContent(text);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        onBack={handleBack}
        title="게시글 수정"
        showDivider={true}
        rightContent={
          <TouchableOpacity
            onPress={handleComplete}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
              <Text variant="smMd" color={colors.text.primary}>
                완료
              </Text>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isKeyboardVisible && {
            paddingBottom: keyboardHeight + verticalScale(80),
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목 입력 필드 */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="제목을 입력하세요"
              placeholderTextColor={colors.icon.gray}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* 내용 입력 필드 */}
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.contentInput}
            placeholder="내용을 입력하세요 (200자 이내)"
            placeholderTextColor={colors.icon.gray}
            value={content}
            onChangeText={handleContentChange}
            multiline
            textAlignVertical="top"
            maxLength={200}
          />
        </View>
        <Text variant="xsReg" color={colors.text.tertiary} style={styles.characterCount}>
          {content.length}/200
        </Text>

        {/* 선택한 이미지 썸네일들 */}
        {selectedImages.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsScrollView}
            contentContainerStyle={styles.thumbnailsContent}
          >
            {selectedImages.map((image, index) => (
              <View key={`${image.uri}-${index}`} style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveImage(image.uri)}
                  activeOpacity={0.7}
                >
                  <DeleteIcon width={24} height={24} />
                </TouchableOpacity>
                {image.uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color={colors.white} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      {/* 하단 첨부 바 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.keyboardAvoidingView}
      >
        <View style={[
          styles.attachmentBar,
          isKeyboardVisible && styles.attachmentBarKeyboard,
          Platform.OS === 'android' && isKeyboardVisible && {
            bottom: keyboardHeight,
            paddingBottom: verticalScale(25),
          }
        ]}>
          <View style={styles.attachmentButtons}>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleGalleryPress}
              activeOpacity={0.7}
            >
              <PostGalleryIcon width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleLinkPress}
              activeOpacity={0.7}
            >
              <PostLinkIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 링크 첨부 모달 */}
      <Modal
        visible={showLinkModal}
        transparent
        animationType="fade"
        onRequestClose={handleLinkCancel}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={handleLinkCancel}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="URL을 입력하세요"
                placeholderTextColor={colors.icon.gray}
                value={linkUrl}
                onChangeText={setLinkUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                editable={!isLinkLoading}
              />
            </View>
            {/* 로딩 스피너 */}
            {isLinkLoading && (
              <View style={styles.modalSpinnerContainer}>
                <LinkLoadingSpinner />
              </View>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleLinkCancel}
                activeOpacity={0.7}
                disabled={isLinkLoading}
              >
                <Text variant="smMd" color={isLinkLoading ? colors.icon.gray : colors.text.primary}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleLinkConfirm}
                disabled={linkUrl.trim().length === 0 || isLinkLoading}
                activeOpacity={0.7}
              >
                <Text
                  variant="smMd"
                  color={linkUrl.trim().length === 0 || isLinkLoading ? colors.icon.gray : colors.text.primary}
                >
                  확인
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(100),
  },
  inputContainer: {
    height: verticalScale(54),
    backgroundColor: colors.background,
    borderRadius: scale(10),
    marginBottom: verticalScale(12),
    overflow: 'hidden',
  },
  inputRow: {
    flex: 1,
    paddingHorizontal: scale(16),
    justifyContent: 'center',
  },
  input: {
    ...typography.smReg,
    color: colors.text.primary,
    padding: 0,
    minHeight: 40,
  },
  contentContainer: {
    height: verticalScale(208),
    backgroundColor: colors.background,
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
    marginBottom: verticalScale(8),
  },
  contentInput: {
    flex: 1,
    ...typography.smReg,
    color: colors.text.secondary,
    padding: 0,
  },
  characterCount: {
    marginBottom: verticalScale(20),
    textAlign: 'right',
    paddingRight: scale(4),
  },
  thumbnailsScrollView: {
    marginBottom: verticalScale(24),
  },
  thumbnailsContent: {
    gap: scale(8),
  },
  thumbnailContainer: {
    width: scale(100),
    height: verticalScale(100),
    borderRadius: scale(10),
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: scale(6),
    right: scale(6),
    width: scale(24),
    height: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  attachmentBar: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    paddingTop: verticalScale(5),
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  attachmentBarKeyboard: {
    paddingBottom: verticalScale(10),
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  attachmentButton: {
    width: scale(40),
    height: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContent: {
    width: '100%',
    height: verticalScale(200),
    backgroundColor: colors.white,
    borderRadius: scale(20),
    paddingTop: verticalScale(16),
    paddingHorizontal: scale(16),
    justifyContent: 'space-between',
  },
  modalInputContainer: {
    justifyContent: 'flex-start',
  },
  modalSpinnerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: verticalScale(28),
  },
  modalInput: {
    ...typography.smReg,
    color: colors.text.primary,
    backgroundColor: colors.background,
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    height: verticalScale(48),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: scale(4),
    paddingBottom: verticalScale(12),
  },
  modalButton: {
    width: scale(60),
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

