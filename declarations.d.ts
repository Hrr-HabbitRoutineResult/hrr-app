declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL?: string;
    S3_BUCKET_NAME?: string;
    S3_REGION?: string;
    NAVER_CONSUMER_KEY?: string;
    NAVER_CONSUMER_SECRET?: string;
    NAVER_APP_NAME?: string;
    NAVER_SERVICE_URL_SCHEME?: string;
    KAKAO_APP_KEY?: string;
    TERMS_SERVICE_URL?: string;
    TERMS_PRIVACY_URL?: string;
    TERMS_MARKETING_URL?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
