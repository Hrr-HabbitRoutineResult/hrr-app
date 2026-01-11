import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import { useUserStore } from '../store/userSlice';
import { format } from '../libs/format';
import { getVerificationHistory, VerificationHistoryItem } from '../libs/api/user';
import { verticalScale } from '../utils/scaling';

import SectionHeader from '../components/common/SectionHeader';
import ProfileCard from '../components/MyPage/ProfileCard';
import { Level } from '../libs/api/user/types';

import ParticipatingChallengeSection, {
  ParticipatingChallengeItem,
} from '../components/MyPage/ParticipatingChallengeSection';
import ViewModeHeader from '../components/MyPage/ViewModeHeader';
import { TextCertificationList, TextCertificationItem } from '../components/common/TextCertificationList';
import { PhotoCertificationGrid } from '../components/common/PhotoCertificationGrid';
import SettingIcon from '../../assets/icons/mypage/ic_setting.svg';

const MyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const tabBarHeight = verticalScale(84);

  const {
    userInfo,
    fetchUserInfo,
    myOngoingChallenges,
    fetchMyOngoingChallenges,
  } = useUserStore();

  const [certificationViewMode, setCertificationViewMode] = useState('grid');
  const [myVerificationHistory, setMyVerificationHistory] = useState<VerificationHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // 화면 포커스 시, 유저 정보와 진행중 챌린지는 스토어를 통해 호출
  useFocusEffect(
    useCallback(() => {
      fetchMyOngoingChallenges();
      fetchUserInfo();
    }, [fetchMyOngoingChallenges, fetchUserInfo])
  );

  // userInfo가 로드된 후, 인증 기록을 직접 API로 호출
  useEffect(() => {
    if (userInfo) {
      const fetchHistory = async () => {
        setIsHistoryLoading(true);
        try {
          const history = await getVerificationHistory();
          setMyVerificationHistory(history);
        } catch (error) {
          console.error("Failed to fetch verification history:", error);
          setMyVerificationHistory([]); // 에러 발생 시 기록을 비웁니다.
        } finally {
          setIsHistoryLoading(false);
        }
      };
      fetchHistory();
    }
  }, [userInfo]);

  const userProfile = useMemo(() => {
    if (!userInfo) {
      return { nickname: '...', avatarUrl: '', followerCount: 0, followingCount: 0, level: Level.BRONZE };
    }
    return {
      nickname: userInfo.nickname,
      avatarUrl: userInfo.profileImage,
      followerCount: userInfo.followerCount,
      followingCount: userInfo.followingCount,
      level: userInfo.level, // 스토어에서 이미 enum으로 변환됨
    };
  }, [userInfo]);

  const participatingChallenges: ParticipatingChallengeItem[] = useMemo(() => {
    return (myOngoingChallenges || []).map((item) => ({
      id: String(item.challengeId),
      title: item.title,
      subtitle: item.description,
      imageUrl: item.image,
      roundText: `${item.currentRound}R째 진행 중`,
    }));
  }, [myOngoingChallenges]);

  const certificationItems: TextCertificationItem[] = useMemo(() => {
    return (myVerificationHistory || []).map((item) => ({
      id: item.verificationId,
      title: `[${item.challengeTitle}] ${item.title}`,
      description: item.content || '',
      date: format.date(item.verifiedAt),
      thumbnail: { uri: item.photoUrl },
    }));
  }, [myVerificationHistory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SectionHeader
        title='마이'
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
      >
        <ProfileCard
          user={userProfile}
          variant='me'
          onPressFollowers={() => navigation.navigate('FollowerList', { initialTab: 'follower', userId: userInfo?.userId })}
          onPressFollowing={() => navigation.navigate('FollowerList', { initialTab: 'following', userId: userInfo?.userId })}
          onPressProfileEdit={() => navigation.navigate('ProfileEdit')}
        />
        
        <View style={styles.tabContentListWrapper}>
            <ParticipatingChallengeSection
                items={participatingChallenges}
                onPressHeader={() => navigation.navigate('ParticipatingChallenge')}
                onPressItem={(item) => navigation.navigate('ChallengeProfile', { challengeId: Number(item.id) })}
                onPressEmpty={() => navigation.navigate('ChallengeList')}
            />

            <View style={{ marginTop: spacing.xxxl }}>
              <ViewModeHeader
                  title="인증 기록"
                  initialMode={certificationViewMode}
                  onViewModeChange={(mode) => setCertificationViewMode(mode)}
                  onPressTitle={() => navigation.navigate('CertificationHistory')}
              />
            </View>
            {isHistoryLoading ? (
              <ActivityIndicator style={styles.loadingIndicator} />
            ) : certificationItems.length === 0 ? (
            <View style={styles.emptyCertificationContainer}>
                <Text style={styles.tabContentText}>인증 기록이 없습니다</Text>
            </View>
            ) : certificationViewMode === 'grid' ? (
            <PhotoCertificationGrid
              items={certificationItems}
              showOverlay={false}
              onItemPress={(item) =>
                navigation.navigate('ChallengeCertificationDetail', {
                  verificationId: item.id,
                })
              }
            />
            ) : (
            <TextCertificationList
              items={certificationItems}
              onItemPress={(item) =>
                navigation.navigate('ChallengeCertificationDetail', {
                  verificationId: item.id,
                })
              }
            />
            )}
        </View>
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
  tabContentListWrapper: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 20,
  },
  tabContentText: {
    ...typography.md,
    color: colors.text.secondary,
  },
  emptyCertificationContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loadingIndicator: {
    marginTop: spacing.xl,
  },
});