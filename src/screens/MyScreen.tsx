import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../design/tokens'; // Ensure spacing is imported here

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
  } = useUserStore();
  const [activeTab, setActiveTab] = useState<'challenge' | 'badge'>('challenge');
  const [certificationViewMode, setCertificationViewMode] = useState('grid'); // Added this line

  useEffect(() => {
    fetchMyOngoingChallenges();
    fetchMyVerificationHistory();
  }, [fetchMyOngoingChallenges, fetchMyVerificationHistory]);

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
      thumbnail: { uri: item.photoUrl }, // PhotoCertificationGrid uses thumbnail directly
    }));
  }, [myVerificationHistory]);

  const tabs: TabItem[] = [
    { key: 'challenge', label: '챌린지' },
    { key: 'badge', label: '뱃지' },
  ];

  const mockUserProfile = {
    nickname: nickname || '게스트',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    followerCount: 123,
    followingCount: 45,
    isChallenger: true,
  };

  /*
  const mockBadges = [
    { uri: 'https://i.pravatar.cc/40?img=1' },
    { uri: 'https://i.pravatar.cc/40?img=2' },
    { uri: 'https://i.pravatar.cc/40?img=3' },
  ];
  */

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
          <View style={styles.sectionSeparator} />
          <ViewModeHeader
            title="인증 기록"
            initialMode={certificationViewMode}
            onViewModeChange={(mode) => setCertificationViewMode(mode)}
            onPressTitle={() => navigation.navigate('CertificationHistory')}
          />
          {certificationViewMode === 'grid' ? (
            <PhotoCertificationGrid items={certificationItems} showOverlay={false} />
          ) : (
            <TextCertificationList items={certificationItems} />
          )}
        </View>
      );
    }

    // return (
    //   <View style={styles.tabContentCentered}>
    //     <Text style={styles.tabContentText}>뱃지 내용이 여기에 표시됩니다.</Text>
    //     {/* 실제 뱃지 리스트 컴포넌트 추가 예정 */}
    //   </View>
    // );
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
            <SettingIcon/>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <ProfileCard
          user={mockUserProfile}
          badges={[]}
          variant="me"
          onPressFollowers={() => navigation.navigate('FollowerList', { initialTab: 'follower' })}
          onPressFollowing={() => navigation.navigate('FollowerList', { initialTab: 'following' })}
        />

        {/* <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scrollable={false}
          horizontalPadding={20}
        /> */}

        {renderTabContent()}
      </View>
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
    height: spacing.md,
    backgroundColor: colors.background,
  },
  tabContentText: {
    ...typography.md,
    color: colors.text.secondary,
  },
});