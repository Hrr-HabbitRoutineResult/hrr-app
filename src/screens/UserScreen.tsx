import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Text } from '../components/common/Text';
import { colors, radius, spacing } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import { format } from '../libs/format';
import { scale, verticalScale } from '../utils/scaling';
import { getErrorMessage } from '../utils/errorHandler';
import {
  OtherUser,
  VerificationHistoryItem,
  OngoingChallengeItem,
  getUserById,
  getVerificationHistoryById,
  getOngoingChallengesById,
  followUser,
  unfollowUser,
  blockUserById,
  unblockUserById,
  reportUserById,
} from '../libs/api/user';
import { ReportReason } from '../libs/api/challenge';
import { Level, mapLevelStringToEnum } from '../libs/api/user/types';
import { Header } from '../components/common/Header';
import ProfileCard from '../components/MyPage/ProfileCard';
import ParticipatingChallengeSection, {
  ParticipatingChallengeItem,
} from '../components/MyPage/ParticipatingChallengeSection';
import CertificationRecordList, {
  CertificationRecordItem,
} from '../components/MyPage/CertificationRecordList';
import ComponentHeader from '../components/common/ComponentHeader';
import MoreIcon from '../../assets/icons/more.svg';
import RestrictedProfileGraphic from '../../assets/images/logo-gray.svg';
import { BlockUserBottomSheet } from '../components/user/BlockUserBottomSheet';
import { UnblockUserBottomSheet } from '../components/user/UnblockUserBottomSheet';
import { ToastNotification } from '../components/common/ToastNotification';
import { ReportBottomSheet } from '../components/common/ReportBottomSheet';
import { ActionSheet, ActionSheetItem } from '../components/common/ActionSheet';
import RefreshableScrollView from '../components/common/RefreshableScrollView';

type UserScreenRouteProp = RouteProp<RootStackParamList, 'User'>;

type UserInfo = Omit<OtherUser, 'level'> & {
  level: Level;
};

const UserScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<UserScreenRouteProp>();
  const { userId } = route.params;

  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ongoingChallenges, setOngoingChallenges] = useState<OngoingChallengeItem[]>([]);
  const [isChallengesLoading, setIsChallengesLoading] = useState(false);
  const [challengesError, setChallengesError] = useState<string | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [isBlockSheetVisible, setIsBlockSheetVisible] = useState(false);
  const [isUnblockSheetVisible, setIsUnblockSheetVisible] = useState(false);
  const [isReportSheetVisible, setIsReportSheetVisible] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const fetchChallenges = useCallback(async () => {
    setIsChallengesLoading(true);
    setChallengesError(null);
    try {
      const result = await getOngoingChallengesById(userId);
      setOngoingChallenges(result.content);
    } catch (error) {
      setChallengesError(getErrorMessage(error, '참가중인 챌린지를 불러오는데 실패했습니다.'));
    } finally {
      setIsChallengesLoading(false);
    }
  }, [userId]);

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const result = await getVerificationHistoryById(userId);
      setVerificationHistory(result.verifications?.content ?? []);
    } catch (error) {
      setHistoryError(getErrorMessage(error, '인증기록을 불러오는데 실패했습니다.'));
    } finally {
      setIsHistoryLoading(false);
    }
  }, [userId]);

  const fetchData = useCallback(async () => {
    setIsProfileLoading(true);
    setProfileError(null);

    try {
      const userData = await getUserById(userId);
      setUser({
        ...userData,
        level: mapLevelStringToEnum(userData.level),
      });
      setIsFollowing(userData.isFollowing);
      setIsBlocked(userData.isBlocked);

      if (userData.isBlocked) {
        setOngoingChallenges([]);
        setVerificationHistory([]);
        setChallengesError(null);
        setHistoryError(null);
      } else {
        await Promise.all([fetchChallenges(), fetchHistory()]);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        navigation.replace('ErrorScreen');
        return;
      }
      setProfileError(getErrorMessage(error, '사용자 정보를 불러오는데 실패했습니다.'));
    } finally {
      setIsProfileLoading(false);
    }
  }, [fetchChallenges, fetchHistory, navigation, userId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleFollowToggle = async () => {
    if (!user || isBlocked || isFollowLoading) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.userId);
        setIsFollowing(false);
        setUser((current) => current
          ? { ...current, followerCount: Math.max(0, current.followerCount - 1) }
          : null);
      } else {
        await followUser(user.userId);
        setIsFollowing(true);
        setUser((current) => current
          ? { ...current, followerCount: current.followerCount + 1 }
          : null);
      }
    } catch (error) {
      const message = getErrorMessage(error, '팔로우 처리에 실패했습니다.');
      setToast({ visible: true, message });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleConfirmBlock = async () => {
    if (!user) return;
    setIsBlockSheetVisible(false);
    try {
      await blockUserById(user.userId);
      await fetchData();
      setToast({ visible: true, message: '차단이 완료되었어요' });
    } catch (error) {
      Alert.alert('오류', getErrorMessage(error, '사용자 차단에 실패했습니다.'));
    }
  };

  const handleConfirmUnblock = async () => {
    if (!user) return;
    setIsUnblockSheetVisible(false);
    try {
      await unblockUserById(user.userId);
      await fetchData();
      setToast({ visible: true, message: '차단 해제가 완료되었어요' });
    } catch (error) {
      Alert.alert('오류', getErrorMessage(error, '사용자 차단 해제에 실패했습니다.'));
    }
  };

  const handleReportSubmit = async (reason: ReportReason, description: string) => {
    if (!user) return;
    try {
      await reportUserById({
        targetId: user.userId,
        reason: reason as any,
        description,
      });
      setIsReportSheetVisible(false);
      Alert.alert('신고 완료', '신고가 접수되었습니다.');
    } catch (error) {
      Alert.alert('오류', getErrorMessage(error, '신고 접수에 실패했습니다.'));
    }
  };

  const userProfile = useMemo(() => ({
    nickname: user?.nickname ?? '...',
    avatarUrl: user?.profileImage,
    followerCount: user?.followerCount ?? 0,
    followingCount: user?.followingCount ?? 0,
    level: user?.level ?? Level.BRONZE,
  }), [user]);

  const participatingChallenges: ParticipatingChallengeItem[] = useMemo(() => (
    ongoingChallenges.slice(0, 2).map((item) => ({
      id: String(item.challengeId),
      title: item.title,
      subtitle: item.description,
      imageUrl: item.image,
      roundText: item.isStarted ? `${item.currentRound}R째 진행 중` : `D-${item.dday}`,
    }))
  ), [ongoingChallenges]);

  const certificationItems: CertificationRecordItem[] = useMemo(() => (
    verificationHistory.slice(0, 3).map((item) => ({
      id: item.verificationId,
      title: item.title,
      challengeTitle: item.challengeTitle,
      date: format.date(item.verifiedAt),
      type: item.type,
      thumbnailUrl: item.photoUrl ||
        (item.type === 'TEXT' && item.textImages?.length ? item.textImages[0] : null),
    }))
  ), [verificationHistory]);

  const renderCertificationSection = () => (
    <View style={styles.certificationWrapper}>
      <ComponentHeader
        title="인증기록"
        onPress={() => navigation.navigate('CertificationHistory', { userId })}
      />
      {isHistoryLoading && verificationHistory.length === 0 ? (
        <View style={styles.certificationStateCard}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      ) : historyError ? (
        <TouchableOpacity style={styles.certificationStateCard} onPress={fetchHistory} activeOpacity={0.8}>
          <Text variant="xsReg" color={colors.text.tertiary}>
            인증기록을 불러오지 못했어요
          </Text>
          <Text variant="xxs" color={colors.primary.main}>다시 시도</Text>
        </TouchableOpacity>
      ) : certificationItems.length === 0 ? (
        <View style={styles.certificationStateCard}>
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
          onItemPress={(item) => navigation.navigate('ChallengeCertificationDetail', {
            verificationId: item.id,
          })}
        />
      )}
    </View>
  );

  const actionSheetItems: ActionSheetItem[] = [
    {
      label: isBlocked ? '차단 해제하기' : '차단하기',
      onPress: () => isBlocked
        ? setIsUnblockSheetVisible(true)
        : setIsBlockSheetVisible(true),
      destructive: !isBlocked,
    },
    {
      label: '신고하기',
      onPress: () => setIsReportSheetVisible(true),
      destructive: true,
    },
  ];

  const renderHeader = (showMenu = false) => (
    <Header
      onBack={() => navigation.goBack()}
      title="프로필"
      showDivider
      horizontalPadding={20}
      rightContent={showMenu ? (
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setActionSheetVisible(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MoreIcon width={scale(20)} height={scale(20)} />
        </TouchableOpacity>
      ) : undefined}
      useSafeArea
    />
  );

  if (isProfileLoading && !user) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centeredState}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  if (profileError && !user) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <TouchableOpacity style={styles.centeredState} onPress={fetchData} activeOpacity={0.8}>
          <Text variant="xsReg" color={colors.text.tertiary}>
            사용자 정보를 불러오지 못했어요
          </Text>
          <Text variant="xxs" color={colors.primary.main} style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader(true)}
      <RefreshableScrollView
        style={styles.container}
        onRefresh={fetchData}
        contentContainerStyle={[
          styles.scrollContent,
          isBlocked && styles.restrictedScrollContent,
        ]}
      >
        <ProfileCard
          user={userProfile}
          variant="other"
          isFollowing={isFollowing}
          isBlocked={isBlocked}
          isFollowLoading={isFollowLoading}
          onPressFollow={handleFollowToggle}
          onPressBlock={() => setIsUnblockSheetVisible(true)}
          onPressFollowers={() => navigation.navigate('FollowerList', { initialTab: 'follower', userId })}
          onPressFollowing={() => navigation.navigate('FollowerList', { initialTab: 'following', userId })}
        />

        {isBlocked ? (
          <View style={styles.restrictedState}>
            <RestrictedProfileGraphic width={scale(128)} height={scale(128)} />
            <Text variant="xsReg" color={colors.icon.gray} style={styles.restrictedText}>
              비공개된 사용자예요
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.participatingChallengeWrapper}>
              <ParticipatingChallengeSection
                items={participatingChallenges}
                onPressHeader={() => navigation.navigate('ParticipatingChallenge', { userId })}
                onPressItem={(item) => navigation.navigate('ChallengeProfile', {
                  challengeId: Number(item.id),
                })}
                isLoading={isChallengesLoading && ongoingChallenges.length === 0}
                error={challengesError}
                onRetry={fetchChallenges}
              />
            </View>
            {renderCertificationSection()}
          </>
        )}
      </RefreshableScrollView>

      <ActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        items={actionSheetItems}
      />
      <BlockUserBottomSheet
        visible={isBlockSheetVisible}
        onClose={() => setIsBlockSheetVisible(false)}
        onConfirm={handleConfirmBlock}
        username={user?.nickname}
      />
      <UnblockUserBottomSheet
        visible={isUnblockSheetVisible}
        onClose={() => setIsUnblockSheetVisible(false)}
        onConfirm={handleConfirmUnblock}
        username={user?.nickname}
      />
      <ReportBottomSheet
        visible={isReportSheetVisible}
        type="user"
        onClose={() => setIsReportSheetVisible(false)}
        onSubmit={handleReportSubmit}
      />
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        onHide={() => setToast((current) => ({ ...current, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(40),
  },
  restrictedScrollContent: {
    flexGrow: 1,
  },
  moreButton: {
    width: scale(24),
    height: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  participatingChallengeWrapper: {
    paddingTop: verticalScale(8),
  },
  certificationWrapper: {
    marginTop: verticalScale(24),
    backgroundColor: colors.white,
  },
  certificationStateCard: {
    height: verticalScale(148),
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  emptyDescription: {
    marginTop: verticalScale(2),
  },
  restrictedState: {
    flex: 1,
    minHeight: verticalScale(360),
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: verticalScale(48),
  },
  restrictedText: {
    marginTop: verticalScale(16),
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    marginTop: verticalScale(8),
  },
});

export default UserScreen;
