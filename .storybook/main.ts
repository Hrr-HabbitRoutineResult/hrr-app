// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-webpack5'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  framework: { name: '@storybook/react-webpack5', options: {} },
  // addons: ['@storybook/addon-interactions'], // 설치했다면 주석 해제
  webpackFinal: async (cfg) => {
    cfg.resolve = cfg.resolve || {}
    cfg.resolve.alias = {
      ...(cfg.resolve.alias || {}),
      'react-native$': 'react-native-web'
    }

    cfg.module = cfg.module || { rules: [] }
    cfg.module.rules = [
      ...(cfg.module.rules || []),
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-typescript',
              ['@babel/preset-react', { runtime: 'automatic' }]
            ]
          }
        }]
      },
      { test: /\.(png|jpg|jpeg|gif|svg|webp)$/, type: 'asset/resource' },
      { test: /\.(ttf|otf|woff|woff2)$/, type: 'asset/resource' }
    ]

    cfg.resolve.extensions = Array.from(new Set([...(cfg.resolve.extensions || []), '.ts', '.tsx']))
    return cfg
  },
  // babel 훅에서도 require 없이 문자열 preset 이름만 사용
  babel: async (options) => ({
    ...options,
    presets: [
      ...(options?.presets || []),
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'automatic' }]
    ]
  })
}

export default config
