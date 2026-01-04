declare module 'react-native-link-preview' {
  interface LinkPreviewOptions {
    timeout?: number;
    headers?: Record<string, string>;
    imagesPropertyType?: string;
    proxyUrl?: string;
  }

  interface LinkPreviewData {
    url: string;
    title?: string;
    siteName?: string;
    description?: string;
    mediaType: string;
    contentType?: string;
    images?: string[];
    videos?: Array<{
      url: string;
      secureUrl?: string;
      type?: string;
      width?: string;
      height?: string;
    }>;
    favicons?: string[];
  }

  export function getPreview(
    text: string,
    options?: LinkPreviewOptions
  ): Promise<LinkPreviewData>;
}

