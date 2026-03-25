import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Navigation이 준비되지 않았을 때 수신된 딥링크를 임시 저장
let pendingDeepLink: { name: keyof RootStackParamList; params?: any } | null = null;
let isAuthReady = false;

// 컴포넌트 밖에서 화면 이동할 때 사용
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (__DEV__) console.log('navigate 호출:', name, params, 'isReady:', navigationRef.isReady(), 'isAuthReady:', isAuthReady);
  if (navigationRef.isReady() && isAuthReady) {
    navigationRef.navigate(name as any, params);
  } else {
    if (__DEV__) console.log('pending에 저장:', name, params);
    pendingDeepLink = { name, params };
  }
}

// 인증 체크 완료 시 AppContent에서 호출
export function setAuthReady() {
  if (__DEV__) console.log('setAuthReady 호출, pending:', pendingDeepLink);
  isAuthReady = true;
  flushPendingDeepLink();
}

// 토큰 만료 등으로 강제 로그아웃 시 스택을 초기화하고 로그인 화면으로 이동
export function resetToAuth() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'AuthOnboarding' }],
      })
    );
  }
}

// NavigationContainer onReady와 setAuthReady 양쪽에서 호출
export function flushPendingDeepLink() {
  if (__DEV__) console.log('flushPendingDeepLink 호출, pending:', pendingDeepLink, 'isReady:', navigationRef.isReady(), 'isAuthReady:', isAuthReady);
  if (pendingDeepLink && navigationRef.isReady() && isAuthReady) {
    const { name, params } = pendingDeepLink;
    pendingDeepLink = null;
    setTimeout(() => {
      navigationRef.navigate(name as any, params);
    }, 300);
  }
}
