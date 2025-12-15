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
};

export const openCamera = async (): Promise<Asset | null> => {
  try {
    const response: ImagePickerResponse = await launchCamera({
      ...commonOptions,
      saveToPhotos: true, // 촬영한 사진을 갤러리에 저장
    });

    if (response.didCancel) {
      return null;
    }

    if (response.errorCode) {
      return null;
    }

    if (response.assets && response.assets.length > 0) {
      return response.assets[0];
    }

    return null;
  } catch (error) {
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
      return null;
    }

    if (response.assets && response.assets.length > 0) {
      return response.assets[0];
    }

    return null;
  } catch (error) {
    return null;
  }
};
