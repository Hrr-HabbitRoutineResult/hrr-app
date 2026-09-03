import {
  VerificationDetail,
  VerificationDetailResponse,
} from '../libs/api/challenge';
import { AuthOnboardingStep } from '../screens/Auth/AuthOnboardingScreen';

export type RootStackParamList = {
  HomeTabs: { screen?: keyof HomeTabParamList } | undefined;
  Notifications: undefined;
  ChallengeList: { category?: string; recommend?: boolean };
  RandomMission: undefined;
  ChallengeProfile: {
    challengeId: number;
    // 미응답 CHALLENGE_EXTENSION 알림으로 진입한 경우 라운드 종료 바텀시트를 자동 표시
    openRoundEndSheet?: boolean;
  };
  ChallengeEdit: { challengeId: number };
  ChallengeParticipants: { challengeId: number };
  ChallengeCertification: {
    challengeId: number;
    initialTab?: 'my' | 'challenger';
    isCompleted?: boolean;
  };
  ChallengeRanking: { challengeId: number };
  PointHistory: undefined;
  ChallengeCertificationCamera: { challengeId: number };
  ChallengeCertificationText: { challengeId: number };
  ChallengeCertificationPost: { challengeId: number; imageUri: string };
  ChallengeCertificationDetail: {
    verification?: VerificationDetail;
    verificationId?: number;
  };
  ChallengeCertificationEdit: {
    verification: VerificationDetailResponse['result'];
  };
  ChallengeCertificationTextEdit: {
    verification: VerificationDetailResponse['result'];
  };
  PopularChallenge: undefined;
  Search: undefined;
  CreateChallengeQ1: undefined;
  CreateChallengeQ2: undefined;
  CreateChallengeQ3: undefined;
  CreateChallengeQ4: undefined;
  Onboarding: undefined;
  ParticipatingChallenge: { userId?: number };
  CertificationHistory: { userId?: number };
  Scrap: undefined;
  FollowerList: { initialTab: 'follower' | 'following'; userId?: number };
  Settings: undefined;
  AccountSettings: undefined;
  ProfileEdit: undefined;
  User: { userId: number };
  LikedChallenge: undefined;
  CompletedChallenge: undefined;
  BlockedUserScreen: undefined;
  NotificationSettings: undefined;
  ErrorScreen: undefined;
  TermsWebView: { title: string; url: string };
  AuthOnboarding: { initialStep?: AuthOnboardingStep } | undefined;
};

export type HomeTabParamList = {
  홈: undefined;
  검색: undefined;
  랭킹: undefined;
  마이: undefined;
};
