import axios from 'axios';
import Config from 'react-native-config';

// 환경 변수에서 API_BASE_URL 가져오기
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


// Axios 인스턴스 생성 (공통 설정)   
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
