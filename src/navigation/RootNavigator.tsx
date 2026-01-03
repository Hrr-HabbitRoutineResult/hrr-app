import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RNBootSplash from 'react-native-bootsplash'; // ← 추가

import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChallengeListScreen from '../screens/ChallengeListScreen';
import RandomMissionScreen from '../screens/RandomMissionScreen';
import SearchScreen from '../screens/SearchScreen';
import ChatScreen from '../screens/ChatScreen';
import MyScreen from '../screens/MyScreen';
import { ChallengeProfileScreen } from '../screens/ChallengeProfile/ChallengeProfileScreen';
import { ChallengeCertificationScreen } from '../screens/ChallengeProfile/ChallengeCertificationScreen';
import { ChallengeCertificationCameraScreen } from '../screens/ChallengeProfile/ChallengeCertificationCameraScreen';
import { ChallengeCertificationTextScreen } from '../screens/ChallengeProfile/ChallengeCertificationTextScreen';
import { ChallengeCertificationPostScreen } from '../screens/ChallengeProfile/ChallengeCertificationPostScreen';
import { ChallengeCertificationDetailScreen } from '../screens/ChallengeProfile/ChallengeCertificationDetailScreen';
import { ChallengeCertificationEditScreen } from '../screens/ChallengeProfile/ChallengeCertificationEditScreen';
import PopularChallengeScreen from '../screens/PopularChallengeScreen';
import { CreateChallengeQ1 } from '../screens/CreateChallenge/CreateChallengeQ1';
import { CreateChallengeQ2 } from '../screens/CreateChallenge/CreateChallengeQ2';
import { CreateChallengeQ3 } from '../screens/CreateChallenge/CreateChallengeQ3';
import { CreateChallengeQ4 } from '../screens/CreateChallenge/CreateChallengeQ4';
import { CreateChallengeProvider } from '../contexts/CreateChallengeContext';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';

import { HomeTabParamList, RootStackParamList } from './types';
import CustomTabBar from '../components/common/CustomTabBar';

const Tab = createBottomTabNavigator<HomeTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

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
    <Tab.Screen name="채팅" component={ChatScreen} />
    <Tab.Screen name="마이" component={MyScreen} />
  </Tab.Navigator>
);

/**
 * RootNavigator
 * @param showRecommendation 최초 회원가입 후 추천 온보딩 표시 여부
 */
const RootNavigator = ({ showRecommendation = false }: { showRecommendation?: boolean }) => (
  <CreateChallengeProvider>
    <NavigationContainer
      onReady={() => {
        // 네비가 준비되면 스플래시를 숨김
        RNBootSplash.hide({ fade: true });
      }}
    >
      {/* showRecommendation이 true이면 온보딩을 첫 화면으로 설정 */}
      <Stack.Navigator initialRouteName={showRecommendation ? 'Onboarding' : 'HomeTabs'}>
        <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChallengeList" component={ChallengeListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RandomMission" component={RandomMissionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChallengeProfile" component={ChallengeProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChallengeCertification" component={ChallengeCertificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChallengeCertificationCamera" component={ChallengeCertificationCameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChallengeCertificationText" component={ChallengeCertificationTextScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChallengeCertificationPost" component={ChallengeCertificationPostScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChallengeCertificationDetail" component={ChallengeCertificationDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChallengeCertificationEdit" component={ChallengeCertificationEditScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PopularChallenge" component={PopularChallengeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateChallengeQ1" component={CreateChallengeQ1} options={{ headerShown: false }} />
        <Stack.Screen name="CreateChallengeQ2" component={CreateChallengeQ2} options={{ headerShown: false }} />
        <Stack.Screen name="CreateChallengeQ3" component={CreateChallengeQ3} options={{ headerShown: false }} />
        <Stack.Screen name="CreateChallengeQ4" component={CreateChallengeQ4} options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreenWrapper} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  </CreateChallengeProvider>
);

export default RootNavigator;
