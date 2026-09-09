import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import ScrapScreen from '../src/screens/ScrapScreen';
import { getScrappedVerifications, ScrappedVerificationItem } from '../src/libs/api/user';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator', FlatList: 'FlatList', Image: 'Image',
  TouchableOpacity: 'TouchableOpacity', View: 'View',
  StyleSheet: { create: (styles: unknown) => styles },
}));
jest.mock('../src/components/common/Header', () => ({ Header: 'Header' }));
jest.mock('../src/components/common/TabBar', () => ({ TabBar: 'TabBar' }));
jest.mock('../src/components/common/Text', () => ({ Text: 'Text' }));
jest.mock('../src/components/MyPage/CertificationRecordList', () => 'CertificationRecordList');
jest.mock('../assets/icons/text.svg', () => 'TextPlaceholderIcon');
jest.mock('../src/utils/scaling', () => ({
  scale: (n: number) => n, verticalScale: (n: number) => n, moderateScale: (n: number) => n,
}));
jest.mock('../src/libs/api/user', () => ({ getScrappedVerifications: jest.fn() }));

const getScraps = jest.mocked(getScrappedVerifications);
const photo: ScrappedVerificationItem = {
  verificationId: 10, type: 'CAMERA', title: '사진 인증', content: null,
  imageUrl: 'https://example.com/photo.jpg', hasLink: false,
  isQuestion: false, isResolved: false, writerNickname: '작성자',
  writerProfileUrl: null, writerId: 2, createdDate: '2026.09.08',
};
const textItem: ScrappedVerificationItem = {
  ...photo, verificationId: 11, type: 'TEXT', title: '글 인증',
  content: '실제 필드의 미리보기', imageUrl: null, hasLink: true,
};
const page = (content: ScrappedVerificationItem[] = [], currentPage = 1, hasNext = false) => ({
  content, currentPage, size: 20, hasNext, first: currentPage === 1, last: !hasNext,
});
let screen: Renderer.ReactTestRenderer;
const list = () => screen.root.findByType('FlatList' as any);
const selectTab = (type: string) => act(async () => {
  screen.root.findByType('TabBar' as any).props.onTabChange(type);
});
const mount = () => act(async () => { screen = Renderer.create(<ScrapScreen />); });

beforeEach(() => { getScraps.mockReset(); mockNavigate.mockReset(); });
afterEach(() => { if (screen) { act(() => screen.unmount()); } });

it('shows successful empty states for both tabs, without a retry error', async () => {
  getScraps.mockResolvedValue(page());
  await mount();
  expect(JSON.stringify(list().props.ListEmptyComponent())).toContain('사진');
  await selectTab('TEXT');
  expect(getScraps).toHaveBeenLastCalledWith('TEXT', 1, 20);
  const empty = JSON.stringify(list().props.ListEmptyComponent());
  expect(empty).toContain('글');
  expect(empty).not.toContain('다시 시도');
});

it('retries a failed request using the active tab', async () => {
  getScraps.mockRejectedValueOnce(new Error('HTTP 401')).mockResolvedValue(page([photo]));
  await mount();
  const error = list().props.ListEmptyComponent();
  expect(JSON.stringify(error)).toContain('다시 시도');
  await act(async () => { await error.props.onPress(); });
  expect(getScraps).toHaveBeenLastCalledWith('CAMERA', 1, 20);
  expect(list().props.data).toEqual([photo]);
});

it.each(['resolve', 'reject'] as const)('ignores a previous tab request that later %ss', async outcome => {
  let resolveOld!: (value: ReturnType<typeof page>) => void;
  let rejectOld!: (reason: Error) => void;
  getScraps.mockImplementationOnce(() => new Promise((resolve, reject) => {
    resolveOld = resolve; rejectOld = reject;
  })).mockResolvedValue(page([textItem]));
  await mount();
  await selectTab('TEXT');
  await act(async () => {
    if (outcome === 'resolve') resolveOld(page([photo]));
    else rejectOld(new Error('old request failed'));
  });
  expect(list().props.data).toEqual([textItem]);
  expect(JSON.stringify(list().props.ListEmptyComponent())).not.toContain('다시 시도');
});

it('appends the next page with the same filter and stops at the last page', async () => {
  const second = { ...photo, verificationId: 12 };
  getScraps.mockResolvedValueOnce(page([photo], 1, true)).mockResolvedValue(page([second], 2));
  await mount();
  await act(async () => { list().props.onEndReached(); });
  expect(getScraps).toHaveBeenLastCalledWith('CAMERA', 2, 20);
  expect(list().props.data).toEqual([photo, second]);
  await act(async () => { list().props.onEndReached(); });
  expect(getScraps).toHaveBeenCalledTimes(2);
});

it('uses imageUrl for photos and opens the selected verification', async () => {
  getScraps.mockResolvedValue(page([photo]));
  await mount();
  const item = list().props.renderItem({ item: photo, index: 0 });
  expect(item.props.children.props.source.uri).toBe(photo.imageUrl);
  item.props.onPress();
  expect(mockNavigate).toHaveBeenCalledWith('ChallengeCertificationDetail', { verificationId: 10 });
});

it('maps text preview, createdDate and hasLink and opens the selected verification', async () => {
  getScraps.mockResolvedValue(page([textItem]));
  await mount();
  await selectTab('TEXT');
  const item = list().props.renderItem({ item: textItem, index: 0 });
  expect(item.props.items[0]).toMatchObject({
    id: 11, title: '글 인증', description: textItem.content,
    date: '2026.09.08', hasLink: true, thumbnailUrl: null,
  });
  item.props.onItemPress(item.props.items[0]);
  expect(mockNavigate).toHaveBeenCalledWith('ChallengeCertificationDetail', { verificationId: 11 });
});


it('prefers originalPhotoUrl in the scrap photo grid without changing detail navigation', async () => {
  const newPhoto = { ...photo, originalPhotoUrl: 'https://example.com/original.jpg' };
  getScraps.mockResolvedValue(page([newPhoto]));
  await mount();
  const item = list().props.renderItem({ item: newPhoto, index: 0 });
  expect(item.props.children.props.source.uri).toBe(newPhoto.originalPhotoUrl);
  item.props.onPress();
  expect(mockNavigate).toHaveBeenCalledWith('ChallengeCertificationDetail', { verificationId: 10 });
});
