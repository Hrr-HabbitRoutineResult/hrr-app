import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import { useUserStore } from '../store/userSlice';
import { format } from '../libs/format';
import { getVerificationHistory, VerificationHistoryItem } from '../libs/api/user';
import { verticalScale } from '../utils/scaling';
import { Text } from '../components/common/Text';

import SectionHeader from '../components/common/SectionHeader';
import ProfileCard from '../components/MyPage/ProfileCard';
import { Level } from '../libs/api/user/types';
import ParticipatingChallengeSection, {
  ParticipatingChallengeItem,
} from '../components/MyPage/ParticipatingChallengeSection';
import ViewModeHeader, { ViewMode } from '../components/MyPage/ViewModeHeader';
import { TextCertificationList, TextCertificationItem } from '../components/common/TextCertificationList';
import { PhotoCertificationGrid } from '../components/common/PhotoCertificationGrid';
import SettingIcon from '../../assets/icons/mypage/ic_setting.svg';
import RefreshableScrollView from '../components/common/RefreshableScrollView';

const MyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = verticalScale(84);

  const {
    userInfo,
    fetchUserInfo,
    myOngoingChallenges,
    fetchMyOngoingChallenges,
  } = useUserStore();

  const [certificationViewMode, setCertificationViewMode] = useState<ViewMode>('grid');
  const [myVerificationHistory, setMyVerificationHistory] = useState<VerificationHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      await Promise.all([
        fetchUserInfo(),
        fetchMyOngoingChallenges(),
        getVerificationHistory().then(setMyVerificationHistory),
      ]);
    } catch (error) {
      console.error("Failed to fetch MyScreen data:", error);
      setMyVerificationHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [fetchUserInfo, fetchMyOngoingChallenges]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const userProfile = useMemo(() => {
    if (!userInfo) {
      return { nickname: '...', avatarUrl: '', followerCount: 0, followingCount: 0, level: Level.BRONZE };
    }
    return {
      nickname: userInfo.nickname,
      avatarUrl: userInfo.profileImage,
      followerCount: userInfo.followerCount,
      followingCount: userInfo.followingCount,
      level: userInfo.level,
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
    <View style={styles.container}>
      <SectionHeader
        title="마이"
        isScreenHeader
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

      <RefreshableScrollView
        style={styles.scrollView}
        onRefresh={fetchData}
        contentContainerStyle={{ paddingBottom: tabBarHeight + insets.bottom }}
      >
        {isHistoryLoading && !userInfo ? (
          <ActivityIndicator style={styles.loadingIndicator} />
        ) : (
          <>
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
                onPressHeader={() => navigation.navigate('ParticipatingChallenge', {})}
                onPressItem={(item) => navigation.navigate('ChallengeProfile', { challengeId: Number(item.id) })}
                onPressEmpty={() => navigation.navigate('ChallengeList', {})}
              />

              <View style={{ marginTop: spacing.xxxl }}>
                <ViewModeHeader
                  title="인증 기록"
                  initialMode={certificationViewMode}
                  onViewModeChange={(mode) => setCertificationViewMode(mode)}
                  onPressTitle={() => navigation.navigate('CertificationHistory', {})}
                />
              </View>
              {isHistoryLoading ? (
                <ActivityIndicator style={styles.loadingIndicator} />
              ) : certificationItems.length === 0 ? (
                <View style={styles.emptyCertificationContainer}>
                  <Text variant="md" color={colors.text.secondary}>인증 기록이 없습니다</Text>
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
          </>
        )}
      </RefreshableScrollView>
    </View>
  );
};

export default MyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
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
