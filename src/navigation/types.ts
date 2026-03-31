import { VerificationDetail, VerificationDetailResponse } from '../libs/api/challenge';
import { AuthOnboardingStep } from '../screens/Auth/AuthOnboardingScreen';

export type RootStackParamList = {
  HomeTabs: { screen?: keyof HomeTabParamList } | undefined;
  Notifications: undefined;
  ChallengeList: { category?: string; recommend?: boolean };
  RandomMission: undefined;
  ChallengeProfile: { challengeId: number };
  ChallengeCertification: { challengeId: number };
  ChallengeRanking: { challengeId: number };
  ChallengeCertificationCamera: { challengeId: number };
  ChallengeCertificationText: { challengeId: number };
  ChallengeCertificationPost: { challengeId: number; imageUri: string };
  ChallengeCertificationDetail: { verification?: VerificationDetail; verificationId?: number };
  ChallengeCertificationEdit: { verification: VerificationDetailResponse['result'] };
  ChallengeCertificationTextEdit: { verification: VerificationDetailResponse['result'] };
  PopularChallenge: undefined;
  Search: undefined;
  CreateChallengeQ1: undefined;
  CreateChallengeQ2: undefined;
  CreateChallengeQ3: undefined;
  CreateChallengeQ4: undefined;
  Onboarding: undefined;
  ParticipatingChallenge: { userId?: number };
  CertificationHistory: { userId?: number };
  FollowerList: { initialTab: 'follower' | 'following', userId?: number };
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
  채팅: undefined;
  마이: undefined;
};
