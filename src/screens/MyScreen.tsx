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
import { scale, verticalScale } from '../utils/scaling';
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
      roundText: item.isStarted
        ? `${item.currentRound}R째 진행 중`
        : `D-${item.dday}`,
    }));
  }, [myOngoingChallenges]);

  const certificationItems: TextCertificationItem[] = useMemo(() => {
    return (myVerificationHistory || []).map((item) => {
      const thumbnailUrl = item.photoUrl ||
        (item.type === 'TEXT' && item.textImages && item.textImages.length > 0
          ? item.textImages[0]
          : null);

      return {
        id: item.verificationId,
        title: item.title,
        description: item.content || '',
        date: format.date(item.verifiedAt),
        thumbnail: thumbnailUrl ? { uri: thumbnailUrl } : null,
      };
    });
  }, [myVerificationHistory]);

  return (
    <View style={styles.container}>
      <SectionHeader
        title="마이"
        isScreenHeader
        rightContent={
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            hitSlop={{ top: scale(12), bottom: scale(12), left: scale(12), right: scale(12) }}
            style={styles.iconButton}
          >
            <SettingIcon width={scale(22)} height={scale(22)} />
          </TouchableOpacity>
        }
      />

      <RefreshableScrollView
        style={styles.scrollView}
        onRefresh={fetchData}
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingBottom: tabBarHeight + insets.bottom
        }}
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

            <View style={styles.participatingChallengeWrapper}>
              <ParticipatingChallengeSection
                items={participatingChallenges}
                onPressHeader={() => navigation.navigate('ParticipatingChallenge', {})}
                onPressItem={(item) => navigation.navigate('ChallengeProfile', { challengeId: Number(item.id) })}
                onPressEmpty={() => navigation.navigate('ChallengeList', {})}
              />
            </View>

            <View style={styles.tabContentListWrapper}>
              <ViewModeHeader
                title="인증 기록"
                initialMode={certificationViewMode}
                onViewModeChange={(mode) => setCertificationViewMode(mode)}
                onPressTitle={() => navigation.navigate('CertificationHistory', {})}
              />
              {isHistoryLoading ? (
                <ActivityIndicator style={styles.loadingIndicator} />
              ) : certificationItems.length === 0 ? (
                <View style={styles.emptyCertificationContainer}>
                  <Text variant="xsReg" color={colors.text.tertiary}>아직 인증 기록이 없습니다</Text>
                </View>
              ) : certificationViewMode === 'grid' ? (
                <View style={styles.photoGridContainer}>
                  <PhotoCertificationGrid
                    items={certificationItems}
                    showOverlay={false}
                    containerPadding={0}
                    onItemPress={(item) =>
                      navigation.navigate('ChallengeCertificationDetail', {
                        verificationId: item.id,
                      })
                    }
                  />
                </View>
              ) : (
                <TextCertificationList
                  items={certificationItems}
                  containerPadding={0}
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
    width: scale(48),
    height: scale(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  participatingChallengeWrapper: {
    paddingTop: verticalScale(8),
  },
  tabContentListWrapper: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: verticalScale(32),
  },
  emptyCertificationContainer: {
    paddingVertical: verticalScale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginTop: spacing.xl,
  },
  photoGridContainer: {
    marginHorizontal: -scale(20),
  },
});
