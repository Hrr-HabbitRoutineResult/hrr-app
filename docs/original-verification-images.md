# 인증 원본/합성 이미지 분리

신규 사진 인증은 카메라가 반환한 파일과 기존 ViewShot 합성본을 각각 업로드한다. 임의 하단 크롭, 기존 기록 원본 복구, 운영 데이터 갱신은 포함하지 않는다. 여기서 원본은 기존 image-picker의 리사이즈/압축을 거쳐 앱에 반환된 타임스탬프 없는 파일이다.

## 동작

1. 기존 `POST /api/s3/presigned-url`을 파일별로 한 번씩 호출한다.
2. 원본 파일과 기존 ViewShot 캡처를 각각 PUT한다. 두 업로드가 모두 성공해야 작성 화면으로 이동한다. 실패하면 인증 등록 단계로 진행하지 않고 재시도할 수 있다.
3. 발급 응답의 key를 URL에서 재추출하지 않고 그대로 전달한다.
4. 사진 인증 POST에 기존 `s3Key`(합성본)와 새 `originalS3Key`(원본)를 전송한다.
5. 목록 공통 로직은 `originalPhotoUrl` 우선, 없으면 기존 썸네일 source를 사용한다. null·필드 누락·빈 문자열 모두 기존 이미지로 fallback한다.
6. 상세·확대 보기·수정 화면은 기존 `photoUrl` 및 `textImages`를 계속 사용한다. 타임스탬프 스타일과 기존 썸네일 레이아웃은 유지한다.

## API 및 DB 변경

사진 생성: `POST /api/v1/verifications/{challengeId}/photo`

```json
{
  "title": "사진 인증",
  "content": "오늘의 인증",
  "s3Key": "uploads/stamped.jpg",
  "originalS3Key": "uploads/original.jpg",
  "isQuestion": false
}
```

- `s3Key`: 기존 필수 필드, 합성본.
- `originalS3Key`: 신규 선택 필드, 원본. 구버전 앱을 위해 생략/null 허용, 제공 시 길이 1~512. 새 앱의 사진 인증 흐름은 두 key를 모두 전달한다.
- `verification.photo_url`: 기존 합성본 key 유지.
- `verification.original_photo_key`: 신규 `VARCHAR(512) NULL`. 기존 행은 NULL, backfill 없음.
- 응답 `originalPhotoUrl`: 원본 key를 기존 S3 URL 유틸리티로 변환한 URL. 기존 인증과 글 인증은 null. 기존 `photoUrl`/`imageUrl` 의미는 변경하지 않는다.

| 응답 API | 기존 이미지 필드 | 추가 필드 위치 |
| --- | --- | --- |
| GET `/api/v1/user/me/verifications/history` | `photoUrl` | `result.content[].originalPhotoUrl` |
| GET `/api/v1/user/{userId}/verifications/history` | `photoUrl` | `result.verifications.content[].originalPhotoUrl` |
| GET `/api/v1/verifications/{challengeId}/feed` | `imageUrl` | `result.content[].originalPhotoUrl` |
| GET `/api/v1/verifications/{challengeId}/me` | `imageUrl` | `result.verifications.content[].originalPhotoUrl` |
| GET `/api/v1/user/me/verifications/scrap` | `imageUrl` | `result.content[].originalPhotoUrl` |
| 사진 생성 응답 및 인증 상세/수정 응답 | `photoUrl` | `result.originalPhotoUrl` |

Flyway migration: `hrr-server/src/main/resources/db/migration/V2.49__add_original_photo_key_to_verification.sql`.

**배포 순서: DB migration + 백엔드 → 앱.** 새 앱을 구 서버에 먼저 배포하면 새 필드가 저장되지 않을 수 있다. 구버전 앱은 새 서버에서도 기존 합성본만 보내는 방식으로 계속 동작한다. 업로드 API와 S3 권한/정책 변경은 없다.

## 변경 파일

앱(`hrr-app`):

- 업로드 공통 함수: `src/libs/verificationImages.ts`
- 촬영·등록 연결: `src/screens/ChallengeProfile/ChallengeCertificationCameraScreen.tsx`, `ChallengeCertificationPostScreen.tsx`, `src/navigation/types.ts`
- API 타입: `src/libs/api/challenge.ts`, `src/libs/api/user.ts`
- 썸네일 선택 공통 함수: `src/utils/certificationThumbnail.ts`
- 공통 목록: `src/components/MyPage/CertificationRecordList.tsx`, `src/components/common/TextCertificationList.tsx`, `PhotoCertificationGrid.tsx`
- 원본 URL 전달: `src/screens/MyScreen.tsx`, `UserScreen.tsx`, `CertificationHistoryScreen.tsx`, `ScrapScreen.tsx`, `src/screens/ChallengeProfile/ChallengeProfileScreen.tsx`, `ChallengeCertificationScreen.tsx`
- 회귀 테스트: `__tests__/verificationImages.test.ts`, `photoCertificationFlow.test.tsx`, `certificationThumbnails.test.tsx`, `ScrapScreen.test.tsx`

백엔드(`hrr-server`, 별도 형제 저장소, branch `codex/original-verification-images`):

- `domain/verification/entity/Verification.java`: 원본 key 영속화 및 사진 생성 factory.
- `domain/verification/dto/VerificationRequestPhotoDto.java`: `originalS3Key` 입력과 검증.
- `domain/verification/dto/VerificationResponseDto.java`, `VerificationDetailResponseDto.java`: URL 응답 필드.
- `domain/verification/controller/VerificationController.java`, `service/VerificationService.java`, `VerificationServiceImpl.java`: key 전달·저장.
- `domain/verification/converter/VerificationConverter.java`: 피드·히스토리·생성·상세 URL 매핑.
- `domain/user/dto/UserResponseDto.java`, `service/UserServiceImpl.java`: 스크랩 목록 URL.
- 위 Flyway migration 및 `OriginalVerificationImagesIntegrationTest.java`.

Java 경로의 기준은 `src/main/java/com/hrr/backend/`, 테스트는 `src/test/java/com/hrr/backend/domain/verification/service/`이다.

## 검증 결과 — 2026-09-09

| 요청 항목 | 확인 결과와 범위 |
| --- | --- |
| 1. 두 파일 업로드 | iOS·Android 네이티브 파일 처리 및 실제 PUT을 로컬 수신 서버에서 확인. 원본의 SHA-256이 입력 파일과 같고 합성본은 다름. |
| 2. 두 key DB 저장 | 실제 컨트롤러→서비스→JPA 저장소→H2 저장 후 flush/clear/reload로 확인. |
| 3. 목록 API 원본 URL | MockMvc + 실제 서비스/저장소로 위 5개 목록 API의 신규/기존 레코드 응답 검증. |
| 4. 목록 원본 표시 | 실제 공통 목록/그리드에서 iOS·Android 화면 확인. 마이·프로필·전체기록의 원본 필드 전달 확인. |
| 5. 상세 타임스탬프 | iOS·Android 실제 상세 화면이 합성본을 표시함을 확인. 서버 상세 응답의 기존 photoUrl도 검증. |
| 6. 기존 기록 fallback | originalPhotoUrl null/누락/빈 문자열의 컴포넌트 테스트, 기존 요청/DB/API 테스트, 네이티브 목록 신규/기존 동시 표시 확인. |
| 7. 플랫폼 동일 동작 | iOS 26.5 iPhone 17 Pro simulator, Android 15(API 35) emulator. iOS fetch/blob 및 Android RNBlobUtil 경로 각각 확인. |

- 앱 Jest: 5 suites, 28 tests 통과(업로드 실패, 중복 탭, 원본/합성본 전달, 스크랩 회귀 포함).
- 백엔드 JUnit: 신규 통합 4 tests + 기존 VerificationServiceTest 29 tests 통과.
- 신규 공통 코드/컴포넌트/테스트 ESLint 통과.
- 전체 TypeScript 검사에는 기존 오류 41개가 남아 있으며 이번 변경으로 새 오류는 추가되지 않음.
- 카메라 입력은 테스트 이미지 fixture로 대체했다. 실제 촬영 하드웨어, 운영 S3 presign/권한, 운영 MySQL 배포는 검증하지 않았다. DB 검증은 H2 MySQL 호환 모드이며 migration도 기존 행이 있는 임시 DB에서 실행했다.
- 네이티브 검증은 로컬 업로드/API fixture를 사용했다. 백엔드 DB/API 통합 검증은 별도 H2 테스트로 수행했다. 운영 서버/DB/S3에 변경하거나 테스트 인증을 게시하지 않았다.
- iOS는 실제 촬영 화면→작성 화면→상세 흐름을 실행했다. Android는 실제 촬영 화면의 인증 콜백을 테스트 하네스가 호출해 ViewShot/업로드를 실행하고 로컬 API에 등록했다. 작성 화면의 두 key 전달은 공통 React 테스트로 확인했다.
- 네이티브 fixture, 업로드 파일/해시, 화면 캡처는 gitignored `build/original-images-qa/`에 있다. 운영 앱 진입점/Metro 설정에는 포함되지 않는다.

재실행:

```sh
# hrr-app
npx jest __tests__/verificationImages.test.ts __tests__/certificationThumbnails.test.tsx __tests__/photoCertificationFlow.test.tsx __tests__/ScrapScreen.test.tsx __tests__/scrappedVerifications.test.ts --runInBand --watchman=false

# hrr-server (JDK 17)
./gradlew test --tests '*OriginalVerificationImagesIntegrationTest' --tests '*VerificationServiceTest'
```
