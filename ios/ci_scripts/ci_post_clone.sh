#!/bin/sh

# 프로젝트 루트로 이동
# cd ../..

# Node.js 설치
brew install node

# CocoaPods 설치
brew install cocoapods

# Node 패키지 설치
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm install

# iOS 의존성 설치
cd "$CI_PRIMARY_REPOSITORY_PATH/ios"
pod install