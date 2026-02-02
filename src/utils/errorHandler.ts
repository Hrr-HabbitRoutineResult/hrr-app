/**
 * 에러 객체에서 사용자에게 표시할 에러 메시지를 추출합니다
 */
export const getErrorMessage = (error: any, defaultMessage: string = '요청 처리에 실패했습니다.'): string => {
  // 백엔드 응답의 message 필드
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // 백엔드 응답의 error 필드
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // Error 객체의 message
  if (error?.message) {
    return error.message;
  }

  // 기본 메시지
  return defaultMessage;
};

/**
 * 에러 객체에서 상세 정보를 포함한 에러 정보를 추출합니다
 */
export const getErrorInfo = (
  error: any,
  defaultMessage: string = '요청 처리에 실패했습니다.'
): { title: string; message: string } => {
  const errorData = error?.response?.data;

  let title = '오류';
  let message = defaultMessage;

  if (errorData) {
    // 서버 응답이 있는 경우
    title = errorData.status || '오류';
    message = errorData.message || errorData.error || error.message || defaultMessage;

    // 에러 코드가 있으면 함께 표시
    if (errorData.code) {
      message = `[${errorData.code}]\n${message}`;
    }
  } else if (error?.message) {
    // 네트워크 에러 등 기타 에러
    message = error.message;
  }

  return { title, message };
};
