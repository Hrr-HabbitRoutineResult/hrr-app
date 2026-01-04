import { apiClient } from './client';

interface ApiResponse<T> {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: T;
}

// 검색 카운트 증가
export const incrementSearchCount = async (keyword: string): Promise<ApiResponse<{}>> => {
  const response = await apiClient.post<ApiResponse<{}>>('/api/v1/search/count', null, {
    params: {
      keyword,
    },
  });
  return response.data;
};

// 인기 검색어 조회
export const getPopularKeywords = async (): Promise<ApiResponse<string[]>> => {
  const response = await apiClient.get<ApiResponse<string[]>>('/api/v1/search/popular-keyword');
  return response.data;
};

