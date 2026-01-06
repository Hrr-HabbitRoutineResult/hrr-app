import { VerificationDetail, VerificationDetailResponse } from '../libs/api/challenge';

export type RootStackParamList = {
  HomeTabs: undefined;
  Notifications: undefined;
  ChallengeList: { category?: string; recommend?: boolean };
  RandomMission: undefined;
  ChallengeProfile: { challengeId: number };
  ChallengeCertification: { challengeId: number };
  ChallengeRanking: { challengeId: number };
  ChallengeCertificationCamera: { challengeId: number };
  ChallengeCertificationPost: { challengeId: number; imageUri: string };
  ChallengeCertificationDetail: { verification?: VerificationDetail; verificationId?: number };
  ChallengeCertificationEdit: { verification: VerificationDetailResponse['result'] };
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
};

export type HomeTabParamList = {
  홈: undefined;
  검색: undefined;
  채팅: undefined;
  마이: undefined;
};
