import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RNBootSplash from 'react-native-bootsplash';
import { navigationRef, flushPendingDeepLink } from './navigationRef';

import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChallengeListScreen from '../screens/ChallengeListScreen';
import RandomMissionScreen from '../screens/RandomMissionScreen';
import CategorySearchScreen from '../screens/CategorySearchScreen';
import SearchScreen from '../screens/SearchScreen';
import RankScreen from '../screens/RankScreen';
import PointHistoryScreen from '../screens/PointHistoryScreen';
import MyScreen from '../screens/MyScreen';
import UserScreen from '../screens/UserScreen';
import { ChallengeProfileScreen } from '../screens/ChallengeProfile/ChallengeProfileScreen';
import { ChallengeEditScreen } from '../screens/ChallengeProfile/ChallengeEditScreen';
import { ChallengeParticipantsScreen } from '../screens/ChallengeProfile/ChallengeParticipantsScreen';
import { ChallengeCertificationScreen } from '../screens/ChallengeProfile/ChallengeCertificationScreen';
import { ChallengeCertificationCameraScreen } from '../screens/ChallengeProfile/ChallengeCertificationCameraScreen';
import { ChallengeCertificationTextScreen } from '../screens/ChallengeProfile/ChallengeCertificationTextScreen';
import { ChallengeCertificationPostScreen } from '../screens/ChallengeProfile/ChallengeCertificationPostScreen';
import { ChallengeCertificationDetailScreen } from '../screens/ChallengeProfile/ChallengeCertificationDetailScreen';
import { ChallengeCertificationEditScreen } from '../screens/ChallengeProfile/ChallengeCertificationEditScreen';
import { ChallengeCertificationTextEditScreen } from '../screens/ChallengeProfile/ChallengeCertificationTextEditScreen';
import PopularChallengeScreen from '../screens/PopularChallengeScreen';
import { CreateChallengeQ1 } from '../screens/CreateChallenge/CreateChallengeQ1';
import { CreateChallengeQ2 } from '../screens/CreateChallenge/CreateChallengeQ2';
import { CreateChallengeQ3 } from '../screens/CreateChallenge/CreateChallengeQ3';
import { CreateChallengeQ4 } from '../screens/CreateChallenge/CreateChallengeQ4';
import { CreateChallengeProvider } from '../contexts/CreateChallengeContext';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import ParticipatingChallengeScreen from '../screens/ParticipatingChallengeScreen';
import CertificationHistoryScreen from '../screens/CertificationHistoryScreen';
import ScrapScreen from '../screens/ScrapScreen';
import FollowerListScreen from '../screens/FollowerListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import LikedChallengeScreen from '../screens/LikedChallengeScreen';
import CompletedChallengeScreen from '../screens/CompletedChallengeScreen';
import BlockedUserScreen from '../screens/BlockedUserScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import ErrorScreen from '../screens/ErrorScreen';
import TermsWebViewScreen from '../screens/Auth/TermsWebViewScreen';
import { AuthOnboardingScreen } from '../screens/Auth/AuthOnboardingScreen';

import { HomeTabParamList, RootStackParamList } from './types';
import CustomTabBar from '../components/common/CustomTabBar';

const Tab = createBottomTabNavigator<HomeTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Deep Link 설정
const linking = {
  prefixes: ['hrr://', 'hrrapp://', 'https://hrr.onelink.me'],
  config: {
    screens: {
      HomeTabs: 'home',
      RandomMission: 'random-mission',
      ChallengeProfile: 'challenge/:challengeId',
      ChallengeEdit: 'challenge/:challengeId/edit',
      User: 'user/:userId',
      ChallengeCertificationDetail: 'verification/:verificationId',
      Notifications: 'notifications',
      ChallengeList: 'challenges',
      PopularChallenge: 'popular',
      ParticipatingChallenge: 'participating',
      CertificationHistory: 'history',
      LikedChallenge: 'liked',
      CompletedChallenge: 'completed',
    },
  },
};

const OnboardingScreenWrapper = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <OnboardingScreen
      onComplete={() => {
        // 뒤로 갈 화면이 있으면 goBack, 없으면(최초 회원가입 시) 홈으로 이동
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.replace('HomeTabs');
        }
      }}
    />
  );
};

const HomeTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarLabelStyle: { display: 'none' }, // Hide default labels
    }}
  >
    <Tab.Screen name="홈" component={HomeScreen} />
    <Tab.Screen name="검색" component={SearchScreen} />
    <Tab.Screen name="랭킹" component={RankScreen} />
    <Tab.Screen name="마이" component={MyScreen} />
  </Tab.Navigator>
);

const AuthOnboardingScreenWrapper = ({
  route,
}: {
  route: {
    params?: {
      initialStep?: import('../screens/Auth/AuthOnboardingScreen').AuthOnboardingStep;
    };
  };
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <AuthOnboardingScreen
      initialStep={route.params?.initialStep}
      onOnboardingComplete={showRecommendation => {
        if (showRecommendation) {
          navigation.replace('HomeTabs');
          // 추천 온보딩이 필요하면 표시
          setTimeout(() => {
            navigation.navigate('Onboarding');
          }, 100);
        } else {
          navigation.replace('HomeTabs');
        }
      }}
    />
  );
};

/**
 * RootNavigator
 * @param showRecommendation 최초 회원가입 후 추천 온보딩 표시 여부
 * @param isAuthenticated 로그인 여부
 */
const RootNavigator = ({
  showRecommendation = false,
  isAuthenticated = true,
  hasSeenOnboarding = false,
}: {
  showRecommendation?: boolean;
  isAuthenticated?: boolean;
  hasSeenOnboarding?: boolean;
}) => (
  <CreateChallengeProvider>
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => {
        // 네비가 준비되면 스플래시를 숨김
        RNBootSplash.hide({ fade: true });
        flushPendingDeepLink();
      }}
    >
      {/* 로그인 여부에 따라 첫 화면 설정 */}
      <Stack.Navigator
        initialRouteName={
          !isAuthenticated
            ? 'AuthOnboarding'
            : showRecommendation
            ? 'Onboarding'
            : 'HomeTabs'
        }
      >
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeList"
          component={ChallengeListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RandomMission"
          component={RandomMissionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeProfile"
          component={ChallengeProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeEdit"
          component={ChallengeEditScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PointHistory"
          component={PointHistoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeParticipants"
          component={ChallengeParticipantsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeCertification"
          component={ChallengeCertificationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeCertificationCamera"
          component={ChallengeCertificationCameraScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeCertificationText"
          component={ChallengeCertificationTextScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeCertificationPost"
          component={ChallengeCertificationPostScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeCertificationDetail"
          component={ChallengeCertificationDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeCertificationEdit"
          component={ChallengeCertificationEditScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChallengeCertificationTextEdit"
          component={ChallengeCertificationTextEditScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PopularChallenge"
          component={PopularChallengeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={CategorySearchScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateChallengeQ1"
          component={CreateChallengeQ1}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateChallengeQ2"
          component={CreateChallengeQ2}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateChallengeQ3"
          component={CreateChallengeQ3}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateChallengeQ4"
          component={CreateChallengeQ4}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreenWrapper}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ParticipatingChallenge"
          component={ParticipatingChallengeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CertificationHistory"
          component={CertificationHistoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Scrap"
          component={ScrapScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FollowerList"
          component={FollowerListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileEdit"
          component={ProfileEditScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="User"
          component={UserScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LikedChallenge"
          component={LikedChallengeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompletedChallenge"
          component={CompletedChallengeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BlockedUserScreen"
          component={BlockedUserScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ErrorScreen"
          component={ErrorScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TermsWebView"
          component={TermsWebViewScreen}
          options={{ headerShown: false }}
        />
        {/* 로그아웃, 토큰 만료 등으로 강제 로그아웃 시 로그인 화면으로 바로 진입 */}
        <Stack.Screen
          name="AuthOnboarding"
          component={AuthOnboardingScreenWrapper}
          initialParams={{
            initialStep: hasSeenOnboarding ? 'login' : 'onboarding',
          }}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  </CreateChallengeProvider>
);

export default RootNavigator;
