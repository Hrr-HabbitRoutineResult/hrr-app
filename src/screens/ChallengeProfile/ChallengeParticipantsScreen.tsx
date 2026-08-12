import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Header } from '../../components/common/Header';
import PersonListItem from '../../components/common/PersonListItem';
import { Text } from '../../components/common/Text';
import { colors, radius, spacing } from '../../design/tokens';
import {
  ChallengeParticipant,
  getChallengeDetail,
  getChallengeParticipants,
} from '../../libs/api/challenge';
import { RootStackParamList } from '../../navigation/types';
import { useUserStore } from '../../store/userSlice';
import { getErrorMessage } from '../../utils/errorHandler';
import { getTodayYYYYMMDD_KST } from '../../utils/kst';
import { scale, verticalScale } from '../../utils/scaling';

type ParticipantsRouteProp = RouteProp<RootStackParamList, 'ChallengeParticipants'>;
type ParticipantsNavigationProp = StackNavigationProp<RootStackParamList, 'ChallengeParticipants'>;

const fetchAllParticipants = async (challengeId: number): Promise<ChallengeParticipant[]> => {
  const collected: ChallengeParticipant[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const result = await getChallengeParticipants(challengeId, page);
    collected.push(...result.content);
    hasNext = result.hasNext;
    page += 1;
  }

  return collected;
};

const sortParticipants = (
  participants: ChallengeParticipant[],
  ownerId: number | null
): ChallengeParticipant[] =>
  [...participants].sort((a, b) => {
    const isOwnerA = a.isOwner || a.id === ownerId;
    const isOwnerB = b.isOwner || b.id === ownerId;

    if (isOwnerA !== isOwnerB) return isOwnerA ? -1 : 1;
    return a.nickname.localeCompare(b.nickname, 'ko');
  });

export const ChallengeParticipantsScreen: React.FC = () => {
  const navigation = useNavigation<ParticipantsNavigationProp>();
  const route = useRoute<ParticipantsRouteProp>();
  const { challengeId } = route.params;
  const { userInfo, followUser, unfollowUser } = useUserStore();

  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverLayout, setPopoverLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedParticipant, setSelectedParticipant] = useState<ChallengeParticipant | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const detail = await getChallengeDetail(challengeId);
      const today = getTodayYYYYMMDD_KST();

      if (!detail.isParticipant) {
        setErrorMessage('챌린지에 참가한 뒤에 참가자를 확인할 수 있어요.');
        setParticipants([]);
        return;
      }

      if (today < detail.startDate) {
        setErrorMessage('챌린지가 시작된 뒤에 참가자를 확인할 수 있어요.');
        setParticipants([]);
        return;
      }

      if (today > detail.endDate) {
        setErrorMessage('종료된 챌린지의 참가자는 확인할 수 없어요.');
        setParticipants([]);
        return;
      }

      const allParticipants = await fetchAllParticipants(challengeId);
      setOwnerId(detail.owner.id);
      setParticipants(allParticipants);
    } catch (error: any) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;
      setErrorMessage(
        status === 404 && code === 'CHALLENGE40410'
          ? '챌린지에 참가한 뒤에 참가자를 확인할 수 있어요.'
          : status === 400 && code === 'CHALLENGE40010'
            ? '진행 중인 챌린지에서만 참가자를 확인할 수 있어요.'
          : getErrorMessage(error, '참가자를 불러오는데 실패했습니다.')
      );
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedParticipants = useMemo(
    () => sortParticipants(participants, ownerId),
    [participants, ownerId]
  );

  const applyFollowState = (userId: number, isFollowing: boolean) => {
    setParticipants(current =>
      current.map(participant =>
        participant.id === userId ? { ...participant, isFollowing } : participant
      )
    );
  };

  const handleFollow = async (participant: ChallengeParticipant) => {
    if (updatingUserId !== null) return;
    try {
      setUpdatingUserId(participant.id);
      await followUser(participant.id);
      applyFollowState(participant.id, true);
    } catch (error) {
      Alert.alert('오류', getErrorMessage(error, '팔로우에 실패했습니다.'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUnfollow = async () => {
    const target = selectedParticipant;
    setPopoverVisible(false);
    setSelectedParticipant(null);
    if (!target || updatingUserId !== null) return;

    try {
      setUpdatingUserId(target.id);
      await unfollowUser(target.id);
      applyFollowState(target.id, false);
    } catch (error) {
      Alert.alert('오류', getErrorMessage(error, '언팔로우에 실패했습니다.'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handlePressAction = (participant: ChallengeParticipant, event: any) => {
    if (participant.isMe || participant.id === userInfo?.userId) {
      navigation.navigate('HomeTabs', { screen: '마이' });
      return;
    }

    if (!participant.isFollowing) {
      handleFollow(participant);
      return;
    }

    event.currentTarget.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setPopoverLayout({ x, y, width, height });
        setSelectedParticipant(participant);
        setPopoverVisible(true);
      }
    );
  };

  const handleProfilePress = (participant: ChallengeParticipant) => {
    if (participant.isMe || userInfo?.userId === participant.id) {
      navigation.navigate('HomeTabs', { screen: '마이' });
    } else {
      navigation.navigate('User', { userId: participant.id });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.centered}>
          <Text variant="smReg" color={colors.text.tertiary} style={styles.stateText}>
            {errorMessage}
          </Text>
          <TouchableOpacity onPress={fetchData} activeOpacity={0.7} style={styles.retryButton}>
            <Text variant="smMd" color={colors.primary.main}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (sortedParticipants.length === 0) {
      return (
        <View style={styles.centered}>
          <Text variant="smReg" color={colors.text.tertiary}>참가자가 없어요.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={sortedParticipants}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isMe = item.isMe || item.id === userInfo?.userId;
          const isOwner = item.isOwner || item.id === ownerId;

          return (
            <TouchableOpacity onPress={() => handleProfilePress(item)} activeOpacity={0.7}>
              <PersonListItem
                avatarUrl={item.profilePhoto}
                nickname={item.nickname}
                badge={isOwner ? '방장' : undefined}
                isFollowing={item.isFollowing}
                actionLabel={isMe ? '내 프로필' : undefined}
                onPressFollow={event => handlePressAction(item, event)}
                actionDisabled={updatingUserId === item.id}
                compact
              />
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header title="참가자" onBack={() => navigation.goBack()} useSafeArea showDivider />
      {renderContent()}
      <Modal visible={popoverVisible} transparent onRequestClose={() => setPopoverVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPopoverVisible(false)}>
          <View
            style={[
              styles.popover,
              {
                top: popoverLayout.y + popoverLayout.height + spacing.xs,
                left: Math.max(spacing.sm, popoverLayout.x - spacing.sm),
                width: popoverLayout.width + spacing.xl,
              },
            ]}
          >
            <TouchableOpacity onPress={handleUnfollow} style={styles.popoverButton}>
              <Text variant="smReg" color={colors.primary.sub}>언팔로우하기</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listContent: {
    paddingTop: verticalScale(4),
    paddingHorizontal: scale(20),
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  stateText: {
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  modalOverlay: {
    flex: 1,
  },
  popover: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popoverButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
});
