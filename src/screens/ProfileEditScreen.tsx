import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated,
  Easing,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-blob-util';
import { RootStackParamList } from '../navigation/types';
import { UserMe, getUserMe, UpdateUserProfileRequest } from '../libs/api/user';
import { getPresignedUrl } from '../libs/api/challenge';
import { getS3ImageUrl } from '../libs/s3';
import { colors as Color, spacing } from '../design/tokens';
import ProfileImageWithEdit from '../components/common/ProfileImageWithEdit';
import { Text } from '../components/common/Text';
import { useUserStore } from '../store/userSlice';
import { ToastNotification } from '../components/common/ToastNotification';

type ProfileEditScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProfileEditScreen'
>;

const SHEET_ANIM_MS = 220;

const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation<ProfileEditScreenNavigationProp>();
  const { updateUserInfo } = useUserStore();

  const [originalUser, setOriginalUser] = useState<UserMe | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNicknameValid, setIsNicknameValid] = useState<boolean>(true);
  const [nicknameError, setNicknameError] = useState<string>('');
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    iconType?: 'block' | 'lock' | 'success';
  }>({
    visible: false,
    message: '',
  });

  // ✅ 커스텀 바텀시트 상태
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current; // 0: 숨김, 1: 표시

  const openSheet = () => {
    setSheetVisible(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: SHEET_ANIM_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = (callback?: () => void) => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: SHEET_ANIM_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSheetVisible(false);
        if (callback) {
          setTimeout(callback, 50);
        }
      }
    });
  };

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          const user = await getUserMe();
          setOriginalUser(user);
          setNickname(user.nickname);
          setProfileImage(user.profileImage || undefined);
          setIsPublic(user.isPublic);
        } catch (error) {
          console.error('프로필 데이터 불러오기 실패:', error);
          Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }, [])
  );

  useEffect(() => {
    if (nickname.trim().length === 0) {
      setIsNicknameValid(false);
      setNicknameError('닉네임을 입력해주세요.');
    } else if (nickname.length > 10) {
      setIsNicknameValid(false);
      setNicknameError('최대 10자까지 입력 가능해요.');
    } else {
      setIsNicknameValid(true);
      setNicknameError('');
    }
  }, [nickname]);

  const hasChanges = useCallback(() => {
    if (!originalUser) return false;

    const isNicknameChanged = nickname !== originalUser.nickname;
    const isProfileImageChanged =
      String(profileImage || '') !== String(originalUser.profileImage || '');
    const isPublicChanged = isPublic !== originalUser.isPublic;

    return isNicknameChanged || isProfileImageChanged || isPublicChanged;
  }, [nickname, profileImage, isPublic, originalUser]);

  const handleCancel = () => navigation.goBack();

  const handleSave = async () => {
    if (!isNicknameValid) {
      Alert.alert('알림', nicknameError);
      return;
    }

    if (!hasChanges()) {
      Alert.alert('알림', '변경사항이 없습니다.');
      navigation.goBack();
      return;
    }

    setIsLoading(true);
    try {
      const isNicknameChanged = nickname !== originalUser?.nickname;
      const isProfileImageChanged =
        String(profileImage || '') !== String(originalUser?.profileImage || '');

      const updatePayload: UpdateUserProfileRequest = {
        isPublic: isPublic,
      };

      if (isNicknameChanged) {
        updatePayload.nickname = nickname;
        updatePayload.isNicknameChanged = true;
      }

      if (isProfileImageChanged) {
        updatePayload.profileImageKey = profileImage;
        updatePayload.isProfileImageChanged = true;
      }

      await updateUserInfo(updatePayload);

      setToast({ visible: true, message: '프로필이 성공적으로 업데이트되었습니다.', iconType: 'success' });
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error?.message);
      Alert.alert(
        '오류',
        error?.response?.data?.message || error?.message || '프로필 업데이트에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = () => {
    openSheet();
  };

  const pickImage = (type: 'gallery' | 'camera') => {
    closeSheet(async () => {
      const options: ImagePicker.ImagePickerOptions = {
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1000,
        maxHeight: 1000,
        includeBase64: false,
        selectionLimit: 1,
      };

      const result =
        type === 'gallery'
          ? await ImagePicker.launchImageLibrary(options)
          : await ImagePicker.launchCamera(options);

      if (result.didCancel) return;

      if (result.errorCode) {
        console.error('ImagePicker Error: ', result.errorMessage);
        Alert.alert('오류', '이미지 선택에 실패했습니다.');
        return;
      }

      if (!result.assets?.length) return;

      const selectedAsset = result.assets[0];
      if (!selectedAsset.uri) return;

      setIsLoading(true);
      try {
        const userId = originalUser?.userId || 'unknown';

        let originalFileName = selectedAsset.fileName || '';
        const queryIndex = originalFileName.indexOf('?');
        if (queryIndex !== -1) {
          originalFileName = originalFileName.substring(0, queryIndex);
        }
        const fileExtension = originalFileName.split('.').pop() || 'jpeg';

        const fileName = `profile-${userId}-${Date.now()}.${fileExtension}`;

        const { presignedUrl, s3Key: returnedS3Key } = await getPresignedUrl(fileName);
        const contentType = selectedAsset.type || 'image/jpeg';

        await RNFetchBlob.fetch(
          'PUT',
          presignedUrl,
          {
            'Content-Type': contentType,
            'x-amz-acl': 'public-read',
          },
          RNFetchBlob.wrap(selectedAsset.uri.replace('file://', ''))
        );

        if (!returnedS3Key) throw new Error('S3 이미지 키를 API 응답에서 받지 못했습니다.');

        setProfileImage(returnedS3Key);
        setToast({ visible: true, message: '업로드 완료. 완료를 눌러 저장하세요.', iconType: 'success' });
      } catch (error: any) {
        console.error('이미지 업로드 실패:', error);
        Alert.alert('오류', `이미지 업로드에 실패했습니다: ${error?.message || ''}`);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleDeletePhoto = () => {
    closeSheet();
    setProfileImage(undefined);
  };

  const backdropOpacity = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  const translateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [240, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: Color.primary.main }]}>취소</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}></Text>

        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={isLoading || !hasChanges()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Color.primary.main} />
          ) : (
            <Text
              style={[
                styles.headerButtonText,
                {
                  color: isLoading
                    ? Color.text.secondary
                    : hasChanges()
                    ? Color.text.primary
                    : Color.text.tertiary,
                },
              ]}
            >
              완료
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        <ProfileImageWithEdit
          profileImageUrl={profileImage ? getS3ImageUrl(profileImage) : undefined}
          onPress={handleImagePick}
        />
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={[styles.textInput, !isNicknameValid && styles.inputError]}
          value={nickname}
          onChangeText={setNickname}
          maxLength={10}
          placeholder="닉네임을 입력해주세요"
          placeholderTextColor={Color.text.secondary}
        />
        <Text style={styles.inputHintText}>최대 10자까지 입력 가능해요</Text>
        {!isNicknameValid && nicknameError ? (
          <Text style={styles.errorText}>{nicknameError}</Text>
        ) : null}
      </View>

      <View style={styles.publicToggleSection}>
        <Text style={styles.publicToggleLabel}>프로필 공개</Text>
        <Switch
          trackColor={{ false: Color.button, true: Color.primary.main }}
          thumbColor={Color.white}
          ios_backgroundColor={Color.button}
          onValueChange={setIsPublic}
          value={isPublic}
        />
      </View>

      <Modal
        transparent
        visible={sheetVisible}
        animationType="none"
        onRequestClose={closeSheet}
      >
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet}>
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
          </Pressable>

          <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]}>
            <View style={styles.sheetGroup}>
              <Pressable style={styles.sheetItem} onPress={() => pickImage('gallery')}>
                <Text style={styles.sheetItemText}>갤러리에서 선택</Text>
              </Pressable>

              <View style={styles.sheetDivider} />

              <Pressable style={styles.sheetItem} onPress={handleDeletePhoto}>
                <Text
                  style={[
                    styles.sheetItemText,
                    { color: Platform.OS === 'ios' ? Color.destructive.ios : Color.destructive.Android },
                  ]}
                >
                  현재 사진 삭제
                </Text>
              </Pressable>
            </View>

            <View style={{ height: 10 }} />

            <Pressable style={styles.sheetCancel} onPress={closeSheet}>
              <Text style={styles.sheetItemText}>취소</Text>
            </Pressable>

            <View style={{ height: Platform.OS === 'ios' ? 10 : 16 }} />
          </Animated.View>
        </View>
      </Modal>
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        iconType={toast.iconType}
        onHide={() => setToast({ visible: false, message: '', iconType: undefined })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Color.white,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.text.primary,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  inputSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: Color.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Color.text.primary,
  },
  inputError: {},
  inputHintText: {
    fontSize: 12,
    color: Color.text.secondary,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: Color.primary.main,
    marginTop: 4,
  },
  publicToggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: spacing.sm,
  },
  publicToggleLabel: {
    fontSize: 16,
    color: Color.text.primary,
  },

  // ✅ 시트 스타일
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#000',
  },
  sheetWrap: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  sheetGroup: {
    backgroundColor: Color.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sheetItem: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetItemText: {
    fontSize: 16,
    color: Color.text.primary,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: Color.background,
  },
  sheetCancel: {
    backgroundColor: Color.white,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileEditScreen;
