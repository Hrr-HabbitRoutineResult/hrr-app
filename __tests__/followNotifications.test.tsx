import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import NotificationsScreen from '../src/screens/NotificationsScreen';
import { NotificationItem } from '../src/components/notification/NotificationItem';
import { getNotifications, markNotificationAsRead } from '../src/libs/api/notification';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('react-native', () => ({
  View: 'View', Text: 'Text', TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView', ActivityIndicator: 'ActivityIndicator', Image: 'Image',
  StyleSheet: { create: (styles: unknown) => styles },
}));
jest.mock('../src/components/common/Header', () => ({ Header: 'Header' }));
jest.mock('../src/components/common/Text', () => ({ Text: 'Text' }));
jest.mock('../assets/images/logo-gray.svg', () => 'LogoGray');
jest.mock('../src/utils/scaling', () => ({
  scale: (n: number) => n, verticalScale: (n: number) => n, moderateScale: (n: number) => n,
}));
jest.mock('../src/libs/api/notification', () => ({
  getNotifications: jest.fn(), markNotificationAsRead: jest.fn(),
}));

const getList = jest.mocked(getNotifications);
const read = jest.mocked(markNotificationAsRead);
const emptyPage = {
  content: [], currentPage: 1, size: 10, hasNext: false, first: true, last: true,
};
// Isolated test fixture based on the documented category/type contract.
// This is not evidence that a production follow notification was generated.
const followNotification = {
  id: 123, category: 'FOLLOW' as const, type: 'FOLLOW_CREATED',
  title: '새로운 팔로워가 있어요',
  message: '혜빗님이 수신자님을 팔로우하기 시작했어요',
  imageUrl: 'https://example.com/avatar.png',
  targetType: 'USER' as const, targetId: 2,
  contextType: 'USER' as const, contextId: 3,
  isRead: false, isResponded: false, createdAt: '2026-09-08T10:00:00',
};

let screen: Renderer.ReactTestRenderer;
const openFollowTab = () => act(async () => {
  const label = screen.root.findAllByType('Text' as any)
    .find(node => node.props.children === '팔로우');
  expect(label).toBeDefined();
  label!.parent!.props.onPress();
});

beforeEach(() => { getList.mockReset(); read.mockReset(); });
afterEach(() => { if (screen) { act(() => screen.unmount()); } });

it('requests category FOLLOW and renders a FOLLOW_CREATED notification from the API', async () => {
  getList.mockImplementation(async params => params?.category === 'FOLLOW'
    ? { ...emptyPage, content: [followNotification] }
    : emptyPage);
  await act(async () => { screen = Renderer.create(<NotificationsScreen />); });
  await openFollowTab();

  expect(getList).toHaveBeenLastCalledWith({ category: 'FOLLOW', page: 1, size: 10 });
  const item = screen.root.findByType(NotificationItem);
  expect(item.props.title).toBe(followNotification.title);
  expect(item.props.description).toBe(followNotification.message);
  expect(item.props.isRead).toBe(false);
  const rendered = JSON.stringify(screen.toJSON());
  expect(rendered).toContain('새로운 팔로워가 있어요');
  expect(rendered).toContain(followNotification.message);
  expect(rendered).not.toMatch(/승인|거절|팔로우 요청/);
  expect(read).not.toHaveBeenCalled();
});

it('keeps an empty FOLLOW response empty instead of fabricating an alert', async () => {
  getList.mockResolvedValue(emptyPage);
  await act(async () => { screen = Renderer.create(<NotificationsScreen />); });
  await openFollowTab();

  expect(getList).toHaveBeenLastCalledWith({ category: 'FOLLOW', page: 1, size: 10 });
  expect(screen.root.findAllByType(NotificationItem)).toHaveLength(0);
  expect(JSON.stringify(screen.toJSON())).toContain('받은 알림이 없어요');
  expect(JSON.stringify(screen.toJSON())).not.toContain('새로운 팔로워가 있어요');
});
