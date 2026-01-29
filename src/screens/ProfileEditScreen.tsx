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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { UserMe, getUserMe, UpdateUserProfileRequest } from '../libs/api/user';
import { checkNickname } from '../libs/api/auth';
import { getPresignedUrl } from '../libs/api/challenge';
import { getS3ImageUrl } from '../libs/s3';
import { colors as Color, spacing, typography } from '../design/tokens';
import { scale, verticalScale } from '../utils/scaling';
import { getErrorMessage } from '../utils/errorHandler';
import ProfileImageWithEdit from '../components/common/ProfileImageWithEdit';
import { Text } from '../components/common/Text';
import { useUserStore } from '../store/userSlice';
import { ToastNotification } from '../components/common/ToastNotification';
import DeleteCircleIcon from '../../assets/icons/delete-circle.svg';
import CheckIcon from '../../assets/icons/checkbox-checked.svg';

type ProfileEditScreenNavigationProp = StackNavigationProp<RootStackParamList, any>;

const SHEET_ANIM_MS = 220;

type NicknameStatus = 'idle' | 'checking' | 'available' | 'duplicate' | 'invalid';

const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation<ProfileEditScreenNavigationProp>();
  const { updateUserInfo } = useUserStore();

  const [originalUser, setOriginalUser] = useState<UserMe | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>('idle');
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    iconType?: 'block' | 'lock' | 'success';
  }>({
    visible: false,
    message: '',
  });

  // 커스텀 바텀시트 상태
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
          const errorMessage = getErrorMessage(error, '사용자 정보를 불러오는데 실패했습니다.');
          Alert.alert('오류', errorMessage);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }, [])
  );

  // 닉네임 중복 확인 (디바운스 방식)
  useEffect(() => {
    // 원래 닉네임과 동일하면 idle 상태
    if (nickname === originalUser?.nickname) {
      setNicknameStatus('idle');
      return;
    }

    // 닉네임이 비어있거나 10자 초과면 invalid
    if (nickname.trim().length === 0 || nickname.length > 10) {
      setNicknameStatus('invalid');
      return;
    }

    // 0.5초 동안 추가 입력이 없으면 중복 확인 실행
    const timer = setTimeout(async () => {
      try {
        setNicknameStatus('checking');
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (!accessToken) {
          setNicknameStatus('invalid');
          return;
        }

        // 닉네임 중복 확인 API 호출
        const response = await checkNickname(accessToken, nickname);

        if (response.isSuccess && response.result === true) {
          // 닉네임 사용 가능
          setNicknameStatus('available');
        } else {
          // 닉네임 중복
          setNicknameStatus('duplicate');
        }
      } catch (error) {
        // API 호출 실패 시
        setNicknameStatus('duplicate');
      }
    }, 500);

    // 새로운 입력이 들어오면 이전 타이머 취소
    return () => clearTimeout(timer);
  }, [nickname, originalUser]);

  const hasChanges = useCallback(() => {
    if (!originalUser) return false;

    const isNicknameChanged = nickname !== originalUser.nickname;
    const isProfileImageChanged =
      String(profileImage || '') !== String(originalUser.profileImage || '');
    const isPublicChanged = isPublic !== originalUser.isPublic;

    return isNicknameChanged || isProfileImageChanged || isPublicChanged;
  }, [nickname, profileImage, isPublic, originalUser]);

  const isNicknameValid =
    nicknameStatus === 'available' ||
    (nicknameStatus === 'idle' && nickname === originalUser?.nickname);

  const handleCancel = () => navigation.goBack();

  const handleSave = async () => {
    if (!hasChanges()) {
      Alert.alert('알림', '변경사항이 없습니다.');
      navigation.goBack();
      return;
    }

    if (!isNicknameValid) {
      Alert.alert('알림', '올바른 닉네임을 입력해 주세요.');
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
      const errorMessage = getErrorMessage(error, '프로필 업데이트에 실패했습니다.');
      Alert.alert('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = () => {
    openSheet();
  };

  const pickImage = (type: 'gallery' | 'camera') => {
    closeSheet(async () => {
      const options = {
        mediaType: 'photo' as const,
        quality: 0.7 as const,
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
        const errorMessage = getErrorMessage(error, '이미지 업로드에 실패했습니다.');
        Alert.alert('오류', errorMessage);
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
    outputRange: [scale(240), 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text variant="smMd" color={Color.text.primary}>취소</Text>
        </TouchableOpacity>

        <View style={styles.headerTitle} />

        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={isLoading || !hasChanges() || !isNicknameValid}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Color.primary.main} />
          ) : (
            <Text
              variant="smMd"
              color={hasChanges() && isNicknameValid ? Color.text.primary : Color.icon.gray}
            >
              완료
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        <ProfileImageWithEdit
          profileImageUrl={profileImage ? getS3ImageUrl(profileImage) || undefined : undefined}
          onPress={handleImagePick}
          size={scale(80)}
          overlayOpacity={0.6}
          iconSize={scale(24)}
        />
      </View>

      <View style={styles.inputSection}>
        <View style={styles.textInputWrapper}>
          <TextInput
            style={[
              styles.textInput,
              {
                fontSize: typography.smMd.fontSize,
                fontFamily: typography.smMd.fontFamily,
                fontWeight: typography.smMd.fontWeight,
              },
            ]}
            value={nickname}
            onChangeText={setNickname}
            maxLength={10}
            placeholder="닉네임을 입력해 주세요"
            placeholderTextColor={Color.icon.gray}
          />
          {nickname.length > 0 && (
            <>
              {nicknameStatus === 'available' ? (
                <View style={styles.clearIconWrapper}>
                  <CheckIcon width={14} height={12} />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setNickname('')}
                  style={styles.clearIconWrapper}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <DeleteCircleIcon width={12} height={12} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* 에러 메시지 - 중복 닉네임 */}
        {nicknameStatus === 'duplicate' && (
          <Text variant="xsReg" color={Color.primary.sub} style={styles.inputHintText}>
            해당 닉네임은 이미 등록되어 있어요!
          </Text>
        )}

        {/* 성공 메시지 - 사용 가능한 닉네임 */}
        {nicknameStatus === 'available' && (
          <Text variant="xsReg" color={Color.text.tertiary} style={styles.inputHintText}>
            사용 가능한 닉네임이에요
          </Text>
        )}

        {/* 기본 안내 메시지 */}
        {(nicknameStatus === 'idle' || nicknameStatus === 'checking' || nicknameStatus === 'invalid') && (
          <Text variant="xsReg" color={Color.text.tertiary} style={styles.inputHintText}>
            최대 10자까지 입력 가능해요
          </Text>
        )}
      </View>

      {/* <View style={styles.publicToggleSection}>
        <Text style={styles.publicToggleLabel}>프로필 공개</Text>
        <Switch
          trackColor={{ false: Color.button, true: Color.primary.main }}
          thumbColor={Color.white}
          ios_backgroundColor={Color.button}
          onValueChange={setIsPublic}
          value={isPublic}
        />
      </View> */}

      <Modal
        transparent
        visible={sheetVisible}
        animationType="none"
        onRequestClose={() => closeSheet()}
      >
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeSheet()}>
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
          </Pressable>

          <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]}>
            <View style={styles.sheetGroup}>
              <Pressable style={styles.sheetItem} onPress={() => pickImage('gallery')}>
                <Text variant="md" color={Color.text.primary}>갤러리에서 선택</Text>
              </Pressable>

              <View style={styles.sheetDivider} />

              <Pressable style={styles.sheetItem} onPress={handleDeletePhoto}>
                <Text
                  variant="md"
                  color={Platform.OS === 'ios' ? Color.destructive.ios : Color.destructive.Android}
                >
                  현재 사진 삭제
                </Text>
              </Pressable>
            </View>

            <View style={{ height: scale(10) }} />

            <Pressable style={styles.sheetCancel} onPress={() => closeSheet()}>
              <Text variant="md" color={Color.text.primary}>취소</Text>
            </Pressable>

            <View style={{ height: Platform.OS === 'ios' ? scale(10) : scale(16) }} />
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
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(12),
    backgroundColor: Color.white,
  },
  headerButton: {
    width: scale(48),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: scale(30),
    marginBottom: scale(24),
  },
  inputSection: {
    paddingHorizontal: scale(20),
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  textInput: {
    flex: 1,
    backgroundColor: Color.background,
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingRight: scale(48),
    height: scale(60),
    color: Color.text.primary,
    borderWidth: 0,
  },
  clearIconWrapper: {
    position: 'absolute',
    right: scale(16),
    width: scale(24),
    height: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputHintText: {
    marginTop: scale(10),
    marginLeft: scale(16),
  },
  publicToggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    marginTop: spacing.sm,
  },
  publicToggleLabel: {
    fontSize: typography.md.fontSize,
    fontFamily: typography.md.fontFamily,
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
    paddingHorizontal: scale(12),
    paddingBottom: scale(6),
  },
  sheetGroup: {
    backgroundColor: Color.white,
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  sheetItem: {
    height: scale(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetItemText: {
    fontSize: typography.md.fontSize,
    fontFamily: typography.md.fontFamily,
    color: Color.text.primary,
  },
  sheetDivider: {
    height: scale(1),
    backgroundColor: Color.background,
  },
  sheetCancel: {
    backgroundColor: Color.white,
    borderRadius: scale(12),
    height: scale(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileEditScreen;
