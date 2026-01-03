import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../design/tokens';

import SectionHeader from '../components/common/SectionHeader';
import SettingIcon from '../../assets/icons/mypage/ic_setting.svg';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

import ProfileCard from '../components/MyPage/ProfileCard';
import { useUserStore } from '../store/userSlice';
import { TabBar, TabItem } from '../components/common/TabBar';
import { TextCertificationList, TextCertificationItem } from '../components/common/TextCertificationList';
import ParticipatingChallengeSection, { ParticipatingChallengeItem } from '../components/MyPage/ParticipatingChallengeSection';
import ViewModeHeader from '../components/MyPage/ViewModeHeader';
import { PhotoCertificationGrid } from '../components/common/PhotoCertificationGrid';
import { format } from '../libs/format';

const MyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {
    nickname,
    myOngoingChallenges,
    fetchMyOngoingChallenges,
    myVerificationHistory,
    fetchMyVerificationHistory,
    userInfo,
    fetchUserInfo,
  } = useUserStore();
  const [activeTab, setActiveTab] = useState<'challenge' | 'badge'>('challenge');
  const [certificationViewMode, setCertificationViewMode] = useState('grid');

  useEffect(() => {
    fetchMyOngoingChallenges();
    fetchMyVerificationHistory();
    fetchUserInfo();
  }, [fetchMyOngoingChallenges, fetchMyVerificationHistory, fetchUserInfo]);

  const participatingChallenges: ParticipatingChallengeItem[] = useMemo(() => {
    return myOngoingChallenges.map((item) => ({
      id: String(item.challengeId),
      title: item.title,
      subtitle: item.description,
      imageUrl: item.image,
      roundText: `${item.currentRound}R째 진행 중`,
    }));
  }, [myOngoingChallenges]);

  const certificationItems: TextCertificationItem[] = useMemo(() => {
    return myVerificationHistory.map((item) => ({
      id: item.verificationId,
      title: `[${item.challengeTitle}] ${item.title}`,
      description: item.content || '',
      date: format.date(item.verifiedAt),
      thumbnail: { uri: item.photoUrl },
    }));
  }, [myVerificationHistory]);

  const userProfile = useMemo(() => {
    if (!userInfo) {
      return {
        nickname: nickname || '게스트',
        avatarUrl: '',
        followerCount: 0,
        followingCount: 0,
        isChallenger: false,
      };
    }
    return {
      nickname: userInfo.nickname,
      avatarUrl: userInfo.profileImage,
      followerCount: userInfo.followerCount,
      followingCount: userInfo.followingCount,
      isChallenger: userInfo.level !== 'BRONZE',
    };
  }, [userInfo, nickname]);

  const tabs: TabItem[] = [
    { key: 'challenge', label: '챌린지' },
    { key: 'badge', label: '뱃지' },
  ];

  const renderTabContent = () => {
    if (activeTab === 'challenge') {
      return (
        <View style={styles.tabContentListWrapper}>
          <ParticipatingChallengeSection
            items={participatingChallenges}
            onPressHeader={() => navigation.navigate('ParticipatingChallenge')}
            onPressItem={(item) => console.log('Participating Challenge Item Pressed:', item.title)}
            onPressEmpty={() => navigation.navigate('ChallengeList')}
          />
          <ViewModeHeader
            title="인증 기록"
            initialMode={certificationViewMode}
            onViewModeChange={(mode) => setCertificationViewMode(mode)}
            onPressTitle={() => navigation.navigate('CertificationHistory')}
          />
          {certificationItems.length === 0 ? (
            <View style={styles.emptyCertificationContainer}>
              <Text style={styles.tabContentText}>인증 기록이 없습니다</Text>
            </View>
          ) : certificationViewMode === 'grid' ? (
            <PhotoCertificationGrid items={certificationItems} showOverlay={false} />
          ) : (
            <TextCertificationList items={certificationItems} />
          )}
        </View>
      );
    }
    // Badge tab content is currently disabled
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SectionHeader
        title="마이"
        rightContent={
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.iconButton}
          >
            <SettingIcon />
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.container}>
        <ProfileCard
          user={userProfile}
          badges={[]}
          variant="me"
          onPressFollowers={() => navigation.navigate('FollowerList', { initialTab: 'follower' })}
          onPressFollowing={() => navigation.navigate('FollowerList', { initialTab: 'following' })}
          onPressProfileEdit={() => navigation.navigate('ProfileEdit')}
        />

        {false && (
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            scrollable={false}
            horizontalPadding={20}
          />
        )}

        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContentCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
  },
  tabContentListWrapper: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 20,
  },
  sectionSeparator: {
    height: spacing.xxs,
    backgroundColor: colors.background,
  },
  tabContentText: {
    ...typography.md,
    color: colors.text.secondary,
  },
  emptyCertificationContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});