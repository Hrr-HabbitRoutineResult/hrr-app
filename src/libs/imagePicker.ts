import {
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';

const commonOptions: CameraOptions & ImageLibraryOptions = {
  mediaType: 'photo',
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  includeBase64: false,
  includeExtra: true,
};

const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: '카메라 권한 요청',
          message: '앱에서 사진을 촬영하려면 카메라 권한이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '취소',
          buttonPositive: '확인',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }
  return true;
};

export const openCamera = async (): Promise<Asset | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('권한 오류', '카메라 권한이 거부되었습니다.');
      return null;
    }

    const response: ImagePickerResponse = await launchCamera({
      ...commonOptions,
      saveToPhotos: true,
    });

    if (response.didCancel) {
      return null;
    }

    if (response.errorCode) {
      if (response.errorCode === 'camera_unavailable') {
        Alert.alert('오류', '카메라를 사용할 수 없는 기기입니다.');
      } else {
        Alert.alert('오류', `카메라를 실행할 수 없습니다: ${response.errorMessage}`);
      }
      return null;
    }

    if (response.assets && response.assets.length > 0) {
      return response.assets[0];
    }

    return null;
  } catch {
    return null;
  }
};

export const openGallery = async (): Promise<Asset | null> => {
  try {
    const response: ImagePickerResponse = await launchImageLibrary({
      ...commonOptions,
      selectionLimit: 1, // 한 장만 선택
    });

    if (response.didCancel) {
      return null;
    }

    if (response.errorCode) {
      Alert.alert('오류', `갤러리를 실행할 수 없습니다: ${response.errorMessage}`);
      return null;
    }

    if (response.assets && response.assets.length > 0) {
      return response.assets[0];
    }

    return null;
  } catch {
    return null;
  }
};

export const openGalleryMultiple = async (maxCount: number = 10): Promise<Asset[] | null> => {
  try {
    const response: ImagePickerResponse = await launchImageLibrary({
      ...commonOptions,
      selectionLimit: maxCount, // 여러 장 선택
    });

    if (response.didCancel) {
      return null;
    }

    if (response.errorCode) {
      Alert.alert('오류', `갤러리를 실행할 수 없습니다: ${response.errorMessage}`);
      return null;
    }

    if (response.assets && response.assets.length > 0) {
      return response.assets;
    }

    return null;
  } catch {
    return null;
  }
};
