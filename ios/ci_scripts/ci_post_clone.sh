#!/bin/sh

# CocoaPods 설치
brew install cocoapods

# 프로젝트 루트로 이동
cd ..

# Node 모듈 설치
npm install

# iOS 의존성 설치
cd ios
pod install