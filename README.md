# Hrr(흐르르) - Habbit Routine Result
<img width="1024" height="500" alt="image" src="https://github.com/user-attachments/assets/423d8caa-bb7d-4dc7-869a-6f0dc24518c4" />

### 흐르르 따라 흐르는 나의 성장

[![App Store](https://img.shields.io/badge/App_Store-0D96F6?style=for-the-badge&logo=app-store&logoColor=white)](https://apps.apple.com/kr/app/%ED%9D%90%EB%A5%B4%EB%A5%B4-hrr/id6757518695)
[![Play Store](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=com.hrrapp)

[![React Native](https://img.shields.io/badge/React_Native-0.82-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Storybook](https://img.shields.io/badge/Storybook-8.x-FF4785?style=flat-square&logo=storybook)](https://storybook.js.org/)

---

## 📱 소개
혼자서는 작심삼일로 끝나기 쉬운 자기개발, **흐르르**와 함께하면 루틴이 됩니다.  
챌린지에 참여하고 인증하며, 오늘의 작은 실천을 습관으로 만들어 보세요.

> 2025 UMC 7th 데모데이 **우수상 수상**  
> App Store · Google Play **정식 출시**

---

## ✨ 주요 기능

### 챌린지
- 챌린지 직접 개설 (인증 방법, 참가자 수, 인증 요일/시간 설정)
- **사진 인증**: 촬영 시 타임스탬프 자동 삽입으로 신뢰성 보장
- **글 인증**: 본문 내 링크 첨부 및 미리보기 지원
- 같은 챌린지 참여자끼리 댓글로 피드백 교환
- 인증 이력 조회

### 탐색 & 추천
- AI 기반 챌린지 유형 추천 (온보딩 설문 결과 활용)
- 카테고리별 정렬, 인기순 조회
- 실시간 챌린지 랭킹 TOP 10
- 챌린지 검색

### 소셜
- 팔로우 / 언팔로우
- 마이페이지 (참여 중 / 완료 / 좋아요한 챌린지, 배지 시스템)
- 사용자 차단 및 신고

### 알림
- 알림 목록 UI 구현 (푸시 알림은 추후 지원 예정)

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React Native 0.82, React 19 |
| Language | TypeScript 5.x |
| 네비게이션 | React Navigation 7 (Stack + Bottom Tabs) |
| 상태 관리 | Zustand 5 |
| 네트워킹 | Axios |
| 소셜 로그인 | Kakao · Naver · Apple OAuth |
| 애니메이션 | React Native Reanimated 4 |
| 이미지 처리 | `react-native-image-picker`, `react-native-view-shot` |
| 파일 업로드 | AWS S3 |
| 반응형 스케일링 | `react-native-size-matters` + 커스텀 디자인 토큰 |
| 컴포넌트 문서화 | Storybook 8 |
| 테스트 | Jest |
| 환경 변수 | `react-native-config` |

---

## 🏗 프로젝트 구조

```
src/
├── components/
│   ├── common/           # 공통 컴포넌트 (Button, Header, TextField 등)
│   ├── challenge/        # 챌린지 카드, 댓글 등
│   ├── home/             # 홈 화면 컴포넌트
│   ├── auth/             # 소셜 로그인
│   ├── create-challenge/ # 챌린지 생성 관련 시트
│   ├── MyPage/           # 마이페이지
│   ├── notification/     # 알림
│   ├── onboarding/       # 온보딩
│   └── stories/          # Storybook 스토리
├── screens/              # 화면 단위 컴포넌트
├── navigation/           # RootNavigator
├── store/                # Zustand 슬라이스
├── libs/
│   ├── api/              # API 통신 레이어 (auth, challenge, user 등)
│   ├── auth/             # 인증 유틸리티
│   └── s3.ts             # S3 업로드
├── design/               # 디자인 토큰
├── types/                # TypeScript 타입 정의
└── utils/                # 유틸리티 함수
```

---

## 🔧 기술적 고민 & 문제 해결

### 1. Android → React Native 크로스플랫폼 리빌드
기존 Android(Kotlin) 앱을 데모데이 수상 이후 실제 출시를 위해 React Native로 전면 재설계했습니다. 단순 포팅이 아닌 디자인 시스템, 컴포넌트 구조, 팀 개발 워크플로우를 처음부터 새로 정립하였습니다.

### 2. 기기별 반응형 스케일링
디바이스 해상도 차이로 인한 UI 깨짐 문제를 해결하기 위해 `react-native-size-matters`와 커스텀 디자인 토큰을 결합했습니다. 디자인 시안 기준 해상도를 기준값으로 삼아 팀 전체가 일관된 수치를 사용하도록 설계했습니다.

### 3. 멀티 플랫폼 소셜 로그인 (Kakao · Naver · Apple)
iOS / Android 각각의 네이티브 SDK 설정 차이, Cocoapods 의존성 충돌, Apple 로그인 필수 정책 대응 등을 해결하며 세 가지 OAuth 플로우를 통합 구현했습니다.

### 4. CDD 기반 컴포넌트 재사용 전략
공통 컴포넌트를 먼저 설계한 후 화면을 조합하는 Bottom-up 방식을 채택했습니다. 2개 이상의 화면에서 중복 사용되는 컴포넌트는 즉시 공통 컴포넌트로 분리하는 기준을 세워 코드 중복을 최소화하고 UI 일관성을 유지했습니다. Storybook을 통해 공통 컴포넌트를 문서화하고 팀원과 시각적으로 공유해 중복 구현을 방지하고자 하였습니다.

---

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# iOS 추가 설정
cd ios && pod install && cd ..
```

**Metro 서버 실행**
```bash
npx react-native start
```

**iOS**
```bash
npx react-native run-ios
```

**Android**
```bash
npx react-native run-android
```

---
<div align="center">
  <sub>Team Hrr · 2026</sub>
</div>
