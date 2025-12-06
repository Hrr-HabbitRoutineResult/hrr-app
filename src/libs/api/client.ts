import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reissueAccessToken } from './auth';

/**
 * 환경 변수에서 API_BASE_URL 가져오기
 */
let BASE_URL: string;

try {
  if (Config && Config.API_BASE_URL) {
    BASE_URL = Config.API_BASE_URL;
  } else {
    throw new Error('API_BASE_URL 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }
} catch (error) {
  if (error instanceof Error && error.message.includes('API_BASE_URL')) {
    throw error;
  }
  throw new Error('환경 변수를 불러올 수 없습니다. react-native-config 설정을 확인해주세요.');
}

/**
 * Axios 인스턴스 생성 (공통 설정)
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 토큰 재발급 중인지 확인하는 플래그 (무한 루프 방지)
 */
let isRefreshing = false;

/**
 * 토큰 재발급 대기 중인 요청 큐
 */
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

/**
 * 토큰 재발급이 완료되면 대기 중인 요청들을 처리
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * 요청 인터셉터
 */
apiClient.interceptors.request.use(
  async (config) => {
    // 토큰 재발급 API가 아닌 경우에만 accessToken을 헤더에 추가
    // 이미 Authorization 헤더가 설정되어 있으면 (재시도 요청) 덮어쓰지 않음
    if (config.url !== '/api/v1/auth/reissue' && !config.headers?.Authorization) {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러 처리 조건
    if (
      error.response?.status === 401 &&
      originalRequest.url !== '/api/v1/auth/reissue' &&
      !originalRequest._retry
    ) {
      // 이미 토큰 재발급이 진행 중인 경우
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // 클라이언트에서 토큰 재발급 진행
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          processQueue(new Error('Refresh token not found'), null);
          isRefreshing = false;
          return Promise.reject(error);
        }

        const response = await reissueAccessToken(refreshToken);
        
        if (response.isSuccess && response.result?.accessToken) {
          const newAccessToken = response.result.accessToken;
          await AsyncStorage.setItem('accessToken', newAccessToken);
          
          processQueue(null, newAccessToken);
          isRefreshing = false;
          
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Token reissue failed');
        }
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'nickname', 'termsAgreed']);
        
        return Promise.reject(refreshError);
      }
    }

    // 401 에러가 아니거나 처리할 수 없는 경우 그대로 에러 반환
    return Promise.reject(error);
  }
);
