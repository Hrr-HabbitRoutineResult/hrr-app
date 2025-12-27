import React, { useState } from 'react';
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
import PhotoCertificationGrid from '../components/MyPage/PhotoCertificationGrid'; // Added this line

const MyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const nickname = useUserStore((state) => state.nickname);
  const [activeTab, setActiveTab] = useState<'challenge' | 'badge'>('challenge');
  const [certificationViewMode, setCertificationViewMode] = useState('grid'); // Added this line

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

  const mockBadges = [
    { uri: 'https://i.pravatar.cc/40?img=1' },
    { uri: 'https://i.pravatar.cc/40?img=2' },
    { uri: 'https://i.pravatar.cc/40?img=3' },
  ];

  const mockChallengeItems: TextCertificationItem[] = [
    {
      id: 1,
      title: '매일 아침 운동 인증',
      description: '아침 7시 기상 후 헬스장 방문 인증 글입니다.',
      date: '2024.01.15',
      thumbnail: require('../../assets/images/mock-challenge-profile.png'),
    },
    {
      id: 2,
      title: '하루 물 2L 마시기 챌린지',
      description: '깨끗한 물 2리터 마시고 건강해지기!',
      date: '2024.01.14',
      thumbnail: require('../../assets/images/mock-challenge-profile.png'),
    },
    {
      id: 3,
      title: '주 3회 독서 챌린지',
      description: '꾸준히 독서하는 습관을 들여보아요.',
      date: '2024.01.13',
      thumbnail: require('../../assets/images/mock-challenge-profile.png'),
    },
  ];

  const mockParticipatingChallenges: ParticipatingChallengeItem[] = [
    {
      id: 'p1',
      title: '매일 아침 운동',
      subtitle: '7시 기상 후 헬스장 가기',
      imageUrl: 'https://picsum.photos/id/237/200/300',
      roundText: '6R째 진행 중',
    },
    {
      id: 'p2',
      title: '하루 물 2L 마시기',
      subtitle: '꾸준한 수분 섭취로 건강 UP!',
      imageUrl: 'https://picsum.photos/id/238/200/300',
      roundText: '3R째 진행 중',
    },
    {
      id: 'p3',
      title: '주 3회 독서',
      subtitle: '지적 성장 챌린지',
      imageUrl: 'https://picsum.photos/id/239/200/300',
      roundText: '1R째 진행 중',
    },
  ];

  const renderTabContent = () => {
    if (activeTab === 'challenge') {
      return (
        <View style={styles.tabContentListWrapper}>
          <ParticipatingChallengeSection
            items={mockParticipatingChallenges}
            onPressHeader={() => navigation.navigate('ParticipatingChallenge')}
            onPressItem={(item) => console.log('Participating Challenge Item Pressed:', item.title)}
          />
          <View style={styles.sectionSeparator} />
          <ViewModeHeader 
            title="인증 기록" 
            initialMode={certificationViewMode}
            onViewModeChange={(mode) => setCertificationViewMode(mode)}
            onPressTitle={() => navigation.navigate('CertificationHistory')}
          />
          {certificationViewMode === 'grid' ? (
            <PhotoCertificationGrid items={mockChallengeItems} />
          ) : (
            <TextCertificationList items={mockChallengeItems} />
          )}
        </View>
      );
    }

    return (
      <View style={styles.tabContentCentered}>
        <Text style={styles.tabContentText}>뱃지 내용이 여기에 표시됩니다.</Text>
        {/* 실제 뱃지 리스트 컴포넌트 추가 예정 */}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SectionHeader
        title="마이"
        rightContent={
          <TouchableOpacity
            onPress={() => {
              // TODO: 햄버거 버튼 클릭 시 동작(예: 메뉴 열기)
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.iconButton}
          >
            <SettingIcon/>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <ProfileCard user={mockUserProfile} badges={mockBadges} variant="me" />

        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scrollable={false}
          horizontalPadding={20}
        />

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