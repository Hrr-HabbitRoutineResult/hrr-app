import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image, Alert } from 'react-native';
import { ChallengeCertificationCameraScreen } from '../src/screens/ChallengeProfile/ChallengeCertificationCameraScreen';
import { ChallengeCertificationPostScreen } from '../src/screens/ChallengeProfile/ChallengeCertificationPostScreen';
import { uploadVerificationImages } from '../src/libs/verificationImages';
import { createPhotoVerification } from '../src/libs/api/challenge';

const mockNavigate = jest.fn();
const mockRefresh = jest.fn();
const mockCapture = jest.fn();
const mockRoute = { params: { challengeId: 9, imageUri: 'https://images.test/stamped.jpg',
  s3Key: 'stamped-key.jpg', originalS3Key: 'raw-key.jpg' } };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }), useRoute: () => mockRoute,
}));
jest.mock('react-native-view-shot', () => {
  const R = require('react');
  return R.forwardRef((props: any, ref: any) => {
    R.useImperativeHandle(ref, () => ({ capture: mockCapture }));
    return R.createElement('ViewShot', props);
  });
});
jest.mock('@react-native-community/blur', () => ({ BlurView: 'BlurView' }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('react-native-blob-util', () => ({}));
jest.mock('../src/libs/imagePicker', () => ({ openCamera: async () => ({ uri: 'file:///camera/raw.png', type: 'image/png' }) }));
jest.mock('../src/libs/verificationImages', () => ({ uploadVerificationImages: jest.fn() }));
jest.mock('../src/libs/api/challenge', () => ({ createPhotoVerification: jest.fn() }));
jest.mock('../src/store/userSlice', () => ({ useUserStore: () => ({ fetchMyVerificationHistory: mockRefresh }) }));
jest.mock('../src/components/common/Button', () => ({ Button: 'Button' }));
jest.mock('../src/components/common/Header', () => ({ Header: ({ rightContent }: any) => rightContent }));
jest.mock('../src/components/common/Text', () => ({ Text: 'Text' }));
jest.mock('../assets/icons/toggle-on.svg', () => 'ToggleOn');
jest.mock('../assets/icons/toggle-off.svg', () => 'ToggleOff');

const upload = jest.mocked(uploadVerificationImages);
let screen: Renderer.ReactTestRenderer;
const originalFetch = globalThis.fetch;
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  jest.spyOn(Image, 'getSize').mockImplementation((_uri, success) => { success(800, 600); });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockCapture.mockResolvedValue('file:///capture/stamped.jpg');
  globalThis.fetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => ({ size: 20 }) });
  upload.mockResolvedValue({ s3Key: 'stamped-key.jpg', originalS3Key: 'raw-key.jpg', imageUri: mockRoute.params.imageUri });
});
afterEach(async () => {
  if (screen) await act(async () => screen.unmount());
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
  globalThis.fetch = originalFetch;
});

it('passes the unmodified camera file and ViewShot file separately and blocks double taps', async () => {
  await act(async () => { screen = Renderer.create(<ChallengeCertificationCameraScreen />); });
  const certify = screen.root.findAllByType('Button' as any).find(button => button.props.children === '인증하기')!;
  let first: Promise<void>;
  await act(async () => {
    first = certify.props.onPress();
    await certify.props.onPress();
    await jest.advanceTimersByTimeAsync(500);
    await first;
  });
  expect(mockCapture).toHaveBeenCalledTimes(1);
  expect(upload).toHaveBeenCalledWith('file:///camera/raw.png', 'file:///capture/stamped.jpg', 'image/png');
  expect(mockNavigate).toHaveBeenCalledWith('ChallengeCertificationPost', mockRoute.params);
});

it('does not navigate to posting when either upload fails and allows retry', async () => {
  upload.mockRejectedValueOnce(new Error('second upload failed'));
  await act(async () => { screen = Renderer.create(<ChallengeCertificationCameraScreen />); });
  const button = () => screen.root.findAllByType('Button' as any).find(b => b.props.children === '인증하기')!;
  await act(async () => {
    const pending = button().props.onPress();
    await jest.advanceTimersByTimeAsync(500);
    await pending;
  });
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(button().props.disabled).toBe(false);
  expect(Alert.alert).toHaveBeenCalled();
});

it('posts both keys and keeps the stamped URL in the preview and detail navigation', async () => {
  const result = { verificationId: 42, photoUrl: mockRoute.params.imageUri,
    originalPhotoUrl: 'https://images.test/original.jpg' };
  jest.mocked(createPhotoVerification).mockResolvedValue(result as any);
  await act(async () => { screen = Renderer.create(<ChallengeCertificationPostScreen />); });
  const inputs = screen.root.findAllByType(require('react-native').TextInput);
  await act(async () => { inputs[0].props.onChangeText('새 인증'); inputs[1].props.onChangeText('내용'); });
  expect(screen.root.findByType(Image).props.source.uri).toBe(mockRoute.params.imageUri);
  const publish = screen.root.findAllByType(require('react-native').TouchableOpacity)[0];
  await act(async () => { await publish.props.onPress(); });
  expect(createPhotoVerification).toHaveBeenCalledWith(9, { title: '새 인증', content: '내용',
    s3Key: 'stamped-key.jpg', originalS3Key: 'raw-key.jpg', isQuestion: false });
  expect(mockNavigate).toHaveBeenCalledWith('ChallengeCertificationDetail', { verification: result });
});
