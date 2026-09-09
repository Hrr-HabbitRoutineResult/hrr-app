import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, radius, spacing } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import { useUserStore } from '../store/userSlice';
import { format } from '../libs/format';
import { scale, verticalScale } from '../utils/scaling';
import { Text } from '../components/common/Text';

import SectionHeader from '../components/common/SectionHeader';
import ComponentHeader from '../components/common/ComponentHeader';
import ProfileCard from '../components/MyPage/ProfileCard';
import { Level } from '../libs/api/user/types';
import ParticipatingChallengeSection, {
  ParticipatingChallengeItem,
} from '../components/MyPage/ParticipatingChallengeSection';
import CertificationRecordList, {
  CertificationRecordItem,
} from '../components/MyPage/CertificationRecordList';
import SettingIcon from '../../assets/icons/mypage/ic_setting.svg';
import RefreshableScrollView from '../components/common/RefreshableScrollView';

const MyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = verticalScale(84);

  const {
    userInfo,
    fetchUserInfo,
    isLoadingUserInfo,
    myOngoingChallenges,
    fetchMyOngoingChallenges,
    isLoadingMyOngoingChallenges,
    errorMyOngoingChallenges,
    myVerificationHistory,
    fetchMyVerificationHistory,
    isLoadingMyVerificationHistory,
    errorMyVerificationHistory,
  } = useUserStore();

  const fetchData = useCallback(async () => {
    await Promise.all([
      fetchUserInfo(),
      fetchMyOngoingChallenges(),
      fetchMyVerificationHistory(),
    ]);
  }, [fetchUserInfo, fetchMyOngoingChallenges, fetchMyVerificationHistory]);

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

  const certificationItems: CertificationRecordItem[] = useMemo(() => {
    return (myVerificationHistory || []).slice(0, 3).map((item) => {
      const thumbnailUrl = item.photoUrl ||
        (item.type === 'TEXT' && item.textImages && item.textImages.length > 0
          ? item.textImages[0]
          : null);

      return {
        id: item.verificationId,
        title: item.title,
        challengeTitle: item.challengeTitle,
        date: format.date(item.verifiedAt),
        type: item.type,
        thumbnailUrl,
        originalPhotoUrl: item.originalPhotoUrl,
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
        {isLoadingUserInfo && !userInfo ? (
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
                items={participatingChallenges.slice(0, 2)}
                onPressHeader={() => navigation.navigate('ParticipatingChallenge', {})}
                onPressItem={(item) => navigation.navigate('ChallengeProfile', { challengeId: Number(item.id) })}
                onPressEmpty={() => navigation.navigate('ChallengeList', {})}
                isLoading={isLoadingMyOngoingChallenges && myOngoingChallenges.length === 0}
                error={errorMyOngoingChallenges}
                onRetry={fetchMyOngoingChallenges}
              />
            </View>

            <View style={styles.certificationWrapper}>
              <ComponentHeader
                title="인증기록"
                onPress={() => navigation.navigate('CertificationHistory', {})}
              />
              {isLoadingMyVerificationHistory && myVerificationHistory.length === 0 ? (
                <View style={styles.certificationStateCard}>
                  <ActivityIndicator color={colors.primary.main} />
                </View>
              ) : errorMyVerificationHistory ? (
                <TouchableOpacity
                  style={styles.certificationStateCard}
                  activeOpacity={0.8}
                  onPress={fetchMyVerificationHistory}
                >
                  <Text variant="xsReg" color={colors.text.tertiary}>
                    인증기록을 불러오지 못했어요
                  </Text>
                  <Text variant="xxs" color={colors.primary.main}>
                    다시 시도
                  </Text>
                </TouchableOpacity>
              ) : certificationItems.length === 0 ? (
                <View style={styles.emptyCertificationContainer}>
                  <Text variant="xsReg" color={colors.text.tertiary}>
                    인증기록이 아직 없어요
                  </Text>
                  <Text variant="xxs" color={colors.text.tertiary} style={styles.emptyDescription}>
                    챌린지에서 글을 올려보세요
                  </Text>
                </View>
              ) : (
                <CertificationRecordList
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
    width: scale(48),
    height: scale(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  participatingChallengeWrapper: {
    paddingTop: verticalScale(8),
  },
  certificationWrapper: {
    backgroundColor: colors.white,
    marginTop: verticalScale(24),
  },
  emptyCertificationContainer: {
    height: verticalScale(148),
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDescription: {
    marginTop: verticalScale(2),
  },
  certificationStateCard: {
    height: verticalScale(148),
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  loadingIndicator: {
    marginTop: spacing.xl,
  },
});
