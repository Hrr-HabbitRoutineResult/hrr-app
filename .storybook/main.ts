// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-webpack5'
import path from 'path'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  addons: ['@storybook/addon-essentials'],
  webpackFinal: async (cfg) => {
    cfg.resolve = cfg.resolve || {}
    cfg.resolve.alias = {
      ...(cfg.resolve.alias || {}),
      'react-native$': 'react-native-web',
    }

    cfg.resolve.extensions = Array.from(
      new Set([
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        ...(cfg.resolve.extensions || []),
        '.ts',
        '.tsx',
      ])
    )

    cfg.module = cfg.module || { rules: [] }

    const appSrc = path.resolve(__dirname, '../src')

    // List of all react-native related modules that need transpilation
    const transpileModules = [
      appSrc,
      path.resolve(__dirname), // .storybook folder itself
      path.resolve(__dirname, '../node_modules/react-native'),
      path.resolve(__dirname, '../node_modules/react-native-web'),
      path.resolve(__dirname, '../node_modules/react-native-safe-area-context'),
      path.resolve(__dirname, '../node_modules/react-native-svg'),
      path.resolve(__dirname, '../node_modules/@react-native'),
      path.resolve(__dirname, '../node_modules/@react-native-async-storage/async-storage'),
      path.resolve(__dirname, '../node_modules/@react-native-community/datetimepicker'),
      path.resolve(__dirname, '../node_modules/@react-native-seoul/kakao-login'),
      path.resolve(__dirname, '../node_modules/@react-navigation/bottom-tabs'),
      path.resolve(__dirname, '../node_modules/@react-navigation/native'),
      path.resolve(__dirname, '../node_modules/@react-navigation/stack'),
      path.resolve(__dirname, '../node_modules/react-native-bootsplash'),
      path.resolve(__dirname, '../node_modules/react-native-config'),
      path.resolve(__dirname, '../node_modules/react-native-gesture-handler'),
      path.resolve(__dirname, '../node_modules/react-native-image-picker'),
      path.resolve(__dirname, '../node_modules/react-native-inappbrowser-reborn'),
      path.resolve(__dirname, '../node_modules/react-native-linear-gradient'),
      path.resolve(__dirname, '../node_modules/react-native-screens'),
      path.resolve(__dirname, '../node_modules/react-native-shadow-2'),
      path.resolve(__dirname, '../node_modules/react-native-splash-screen'),
      path.resolve(__dirname, '../node_modules/react-native-view-shot'),
      path.resolve(__dirname, '../node_modules/react-native-reanimated'),
    ]

    cfg.module.rules = [
      // Rule for SVG files: only @svgr/webpack
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: false,
              // svgoConfig: {
              //   plugins: [{ removeViewBox: false }], // Keeping this commented out for now
              // },
            },
          },
        ],
      },
      // Rule for all other image assets
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/,
        type: 'asset/resource',
      },
      // Rule for font assets
      { test: /\.(ttf|otf|woff|woff2)$/, type: 'asset/resource' },
      // Rule for JS/TS/JSX/TSX files: transpile with Babel
      {
        test: /\.[jt]sx?$/,
        include: transpileModules,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: false,
              configFile: false,
              presets: ['module:@react-native/babel-preset'],
            }
          },
        ],
      },
    ];

    cfg.plugins = cfg.plugins || [];
    cfg.plugins.push(
      new (require('webpack').DefinePlugin)({
        __DEV__: process.env.NODE_ENV !== 'production',
      })
    );

    return cfg
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: false,
  },
};
export default config;