#!/bin/sh

# 프로젝트 루트로 이동
cd ../..

# Node.js 설치
brew install node

# CocoaPods 설치
brew install cocoapods

# Node 패키지 설치
npm install

# iOS 의존성 설치
cd ios
pod install