import React, { useState, useEffect, useCallback } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import { getDayOfWeek_KST, getSecondsSinceMidnight_KST, getTodayYYYYMMDD_KST } from '../../utils/kst';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '../../components/common/Text';
import { TextField } from '../../components/common/TextField';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { TabBar } from '../../components/common/TabBar';
import { colors } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import {
  getChallengeDetail,
  getChallengeProfile,
  likeChallenge,
  unlikeChallenge,
  joinChallenge,
  getChallengeRounds,
  getVerificationStat,
  getVerificationFeed,
  ChallengeDetail,
  ChallengeProfile,
  RoundItem,
  VerificationStat,
  VerificationFeedItem,
} from '../../libs/api/challenge';
import { useUserStore } from '../../store/userSlice';
import { getS3ImageUrl } from '../../libs/s3';
import Config from 'react-native-config';
import ShareIcon from '../../../assets/icons/challenge-profile/share.svg';
import LikeSelectedIcon from '../../../assets/icons/challenge-profile/like-selected.svg';
import LikeUnselectedIcon from '../../../assets/icons/challenge-profile/like-unselected.svg';
import PeopleIcon from '../../../assets/icons/challenge-profile/people.svg';
import ObserverDisabledIcon from '../../../assets/icons/challenge-profile/observer-disabled.svg';
import ObserverEnabledIcon from '../../../assets/icons/challenge-profile/observer-enabled.svg';
import DefaultProfileIcon from '../../../assets/icons/challenge-profile/default-profile.svg';
import CalendarIcon from '../../../assets/icons/challenge-profile/calendar.svg';
import TimeRangeIcon from '../../../assets/icons/challenge-profile/time-range.svg';
import ChevronRightTertiaryIcon from '../../../assets/icons/chevron-right-tertiary.svg';
import ChevronRightIcGreyIcon from '../../../assets/icons/chevron-right-ic-grey.svg';
import InfoCircleIcon from '../../../assets/icons/challenge-profile/info-circle.svg';
import QuestionMarkCircleIcon from '../../../assets/icons/challenge-profile/question-mark-circle.svg';
import { TextCertificationList } from '../../components/common/TextCertificationList';
import { PhotoCertificationGrid } from '../../components/common/PhotoCertificationGrid';

type ChallengeProfileScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeProfile'>;
type ChallengeProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeProfile'
>;

export const ChallengeProfileScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeProfileScreenNavigationProp>();
  const route = useRoute<ChallengeProfileScreenRouteProp>();
  const { challengeId } = route.params;
  const { userInfo } = useUserStore();

  const [data, setData] = useState<ChallengeDetail | null>(null);
  const [profile, setProfile] = useState<ChallengeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'certification'>('profile');
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [showCertificationTooltip, setShowCertificationTooltip] = useState(false);
  const [roundCarouselScrollX, setRoundCarouselScrollX] = useState(0);
  const [certificationType, setCertificationType] = useState<'text' | 'image'>('image');
  const [isParticipated, setIsParticipated] = useState(false);

  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [verificationStat, setVerificationStat] = useState<VerificationStat | null>(null);
  const [verificationFeed, setVerificationFeed] = useState<VerificationFeedItem[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [dayStatuses, setDayStatuses] = useState<{
    [key: string]: 'none' | 'required' | 'completed';
  }>({
    일: 'none',
    월: 'none',
    화: 'none',
    수: 'none',
    목: 'none',
    금: 'none',
    토: 'none',
  });

  // 프로필 정보 처리 함수
  const processProfileData = (profileResult: ChallengeProfile) => {
    setProfile(profileResult);

    // 참가 상태 설정
    setIsParticipated(profileResult.isParticipating);

    // 요일별 인증 상태 설정
    const dayMap: Record<string, string> = {
      MONDAY: '월',
      TUESDAY: '화',
      WEDNESDAY: '수',
      THURSDAY: '목',
      FRIDAY: '금',
      SATURDAY: '토',
      SUNDAY: '일',
    };

    // 모든 요일을 'none'으로 초기화
    const newDayStatuses: { [key: string]: 'none' | 'required' | 'completed' } = {
      일: 'none',
      월: 'none',
      화: 'none',
      수: 'none',
      목: 'none',
      금: 'none',
      토: 'none',
    };

    // targetDays의 요일들을 'required'로 설정
    if (profileResult.targetDays && Array.isArray(profileResult.targetDays)) {
      profileResult.targetDays.forEach((day) => {
        const koreanDay = dayMap[day];
        if (koreanDay) {
          newDayStatuses[koreanDay] = 'required';
        }
      });
    }

    // verifiedDaysThisWeek의 요일들을 'completed'로 설정 (required를 덮어씀)
    if (profileResult.verifiedDaysThisWeek && Array.isArray(profileResult.verifiedDaysThisWeek)) {
      profileResult.verifiedDaysThisWeek.forEach((day) => {
        const koreanDay = dayMap[day];
        if (koreanDay) {
          newDayStatuses[koreanDay] = 'completed';
        }
      });
    }

    setDayStatuses(newDayStatuses);
  };

  const fetchRoundsAndStats = async () => {
    try {
      const roundsResult = await getChallengeRounds(challengeId);
      setRounds(roundsResult);

      const currentRound = roundsResult.find(r => r.isCurrentRound);
      if (currentRound) {
        setSelectedRound(currentRound.roundNumber);
      } else if (roundsResult.length > 0) {
        setSelectedRound(roundsResult[0].roundNumber);
      }

      const statResult = await getVerificationStat(challengeId);
      setVerificationStat(statResult);
    } catch (error: any) {
      // 라운드/통계 조회 실패 시 무시
    }
  };

  const fetchVerificationFeed = async (roundNumber: number) => {
    try {
      setIsFeedLoading(true);
      const feedResult = await getVerificationFeed(challengeId, {
        roundNumber,
        page: 1,
        size: 10,
      });
      setVerificationFeed(feedResult.content);
    } catch (error: any) {
      setVerificationFeed([]);
    } finally {
      setIsFeedLoading(false);
    }
  };

  // 전체 데이터 새로고침 함수
  const refreshAllData = async () => {
    try {
      // 챌린지 기본 정보 조회
      const detailResult = await getChallengeDetail(challengeId);
      setData(detailResult);
      setIsLiked(detailResult.isLiked);
      setIsParticipated(detailResult.isParticipant);

      // 챌린지 프로필 정보 조회
      try {
        const profileResult = await getChallengeProfile(challengeId);
        processProfileData(profileResult);
      } catch (profileError: any) {
        setProfile(null);
      }

      // 관찰자 모드이거나 참가한 경우 인증현황 데이터 조회
      if (detailResult.isObserverMode || detailResult.isParticipant) {
        await fetchRoundsAndStats();

        // 선택된 라운드가 있으면 피드도 새로고침
        if (selectedRound !== null) {
          await fetchVerificationFeed(selectedRound);
        }
      }
    } catch (error: any) {
      console.error('데이터 새로고침 실패:', error);
    }
  };

  // 화면 포커스 시마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);

          // 먼저 챌린지 기본 정보 조회
          const detailResult = await getChallengeDetail(challengeId);
          setData(detailResult);
          setIsLiked(detailResult.isLiked);
          setIsParticipated(detailResult.isParticipant);

          // 챌린지 프로필 정보 조회 (참가 여부와 관계없이)
          try {
            const profileResult = await getChallengeProfile(challengeId);
            processProfileData(profileResult);
          } catch (profileError: any) {
            // 프로필 조회 실패 시 무시 (참가하지 않은 경우 서버에서 에러를 반환할 수 있음)
            setProfile(null);
          }

          // 관찰자 모드이거나 참가한 경우 인증현황 데이터 조회
          if (detailResult.isObserverMode || detailResult.isParticipant) {
            await fetchRoundsAndStats();

            // 선택된 라운드가 있으면 피드도 새로고침
            if (selectedRound !== null) {
              await fetchVerificationFeed(selectedRound);
            }
          }
        } catch (error: any) {
          Alert.alert('오류', error.message || '챌린지 정보를 불러오는데 실패했습니다.', [
            { text: '확인', onPress: () => navigation.goBack() }
          ]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [challengeId, navigation, selectedRound])
  );

  // 선택된 라운드 변경 시 피드 조회
  useEffect(() => {
    if (selectedRound !== null && (data?.isObserverMode || isParticipated)) {
      fetchVerificationFeed(selectedRound);
    }
  }, [selectedRound]);

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!data) return null;

  // 요일 변환 함수
  const formatDays = (days: string[]) => {
    const dayMap: Record<string, string> = {
      MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수', THURSDAY: '목',
      FRIDAY: '금', SATURDAY: '토', SUNDAY: '일'
    };
    return days.map(d => dayMap[d] || d).join('/');
  };

  // 시간 포맷 함수 (HH:MM:SS -> HH:MM)
  const formatTime = (time: string) => {
    return time.substring(0, 5); // "06:00:00" -> "06:00"
  };

  // AM/PM 추출 함수
  const getAmPm = (time: string): string => {
    const hours = parseInt(time.split(':')[0], 10);
    return hours < 12 ? 'AM' : 'PM';
  };

  const challengeData = {
    name: data.title,
    description: data.description,
    participants: data.currentParticipantCount,
    maxParticipants: data.maxParticipantCount,
    isObserverMode: data.isObserverMode,
    hostNickname: data.owner.nickname,
    schedule: profile ? {
      days: formatDays(profile.targetDays || []),
      timeRange: `${formatTime(profile.verifyStartTime || '00:00:00')} ~ ${formatTime(profile.verifyEndTime || '00:00:00')}`,
    } : {
      days: '',
      timeRange: '',
    },
    rules: profile?.rule || '',
  };

  const handleShare = async () => {
    try {
      const shareMessage =
        `🔥 ${data.title} 챌린지에 참여해요!
       
        현재 ${data.currentParticipantCount}명이 함께 도전 중이에요.
        혼자보다는 같이, 흐르르에서 끝까지 목표를 달성해 보세요 💪`;

      await Share.share({
        message: shareMessage,
        title: `${data.title} 챌린지에 참여해요!`,
      });
    } catch (error: any) {
      // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
      if (error.message !== 'User did not share') {
        Alert.alert('오류', '공유하기에 실패했습니다.');
      }
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        // 찜하기 취소
        const result = await unlikeChallenge(challengeId);
        setIsLiked(result.isLiked);
      } else {
        // 찜하기
        const result = await likeChallenge(challengeId);
        setIsLiked(result.isLiked);
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '찜하기 처리 중 오류가 발생했습니다.');
    }
  };

  const handleHostProfile = () => {
    if (data?.owner.id) {
      if (data.owner.id === userInfo?.userId) {
        navigation.navigate('HomeTabs', { screen: '마이' });
      } else {
        navigation.navigate('User', { userId: data.owner.id });
      }
    }
  };

  const handleParticipate = () => {
    if (!data) {
      Alert.alert('오류', '챌린지 정보를 불러올 수 없습니다.');
      return;
    }

    /**
     * actionButtonStatus 우선 순위에 따른 처리
     */

    // [1] DISABLED: 챌린지 종료
    if (data.actionButtonStatus === 'DISABLED') {
      Alert.alert('알림', '이미 종료된 챌린지입니다.');
      return;
    }

    // [6] WAITLIST: 참가 전 + 정원 마감
    if (data.actionButtonStatus === 'WAITLIST') {
      Alert.alert('알림', '정원이 마감되어 대기자 신청만 가능합니다.');
      return;
    }

    // [7] JOIN: 참가 전 + 모집 중
    if (data.actionButtonStatus === 'JOIN') {
      setShowParticipateModal(true);
      setIsPasswordMode(false);
      setPassword('');
      setPasswordError(undefined);
      return;
    }

    // 예외 케이스 (이미 참가 중인 경우 등 예상치 못한 상태인 경우 발생 시)
    Alert.alert('알림', '현재는 참가 신청을 할 수 없습니다.');
  };

  // 참가하기 버튼 활성화 여부 결정
  const isParticipateButtonDisabled = () => {
    if (!data) {
      return true;
    }

    // actionButtonStatus가 'JOIN'일 때만 활성화
    return data.actionButtonStatus !== 'JOIN';
  };

  // 현재 요일이 인증 가능한 요일인지 체크
  const isTodayVerificationDay = (): boolean => {
    if (!profile || !profile.targetDays || profile.targetDays.length === 0) {
      return false;
    }

    // 인증 요일 판단 (KST 기준)
    const dayOfWeek = getDayOfWeek_KST(); // 0(일) ~ 6(토)

    // 숫자를 요일로 변환
    const dayMap: { [key: number]: string } = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    };

    const todayDayName = dayMap[dayOfWeek];
    return profile.targetDays.includes(todayDayName);
  };

  // 현재 시간이 인증 가능한 시간대인지 체크
  const isNowVerificationTime = (): boolean => {
    if (!profile || !profile.verifyStartTime || !profile.verifyEndTime) {
      return false;
    }

    // 인증 시간대 판단 (KST 기준)
    const currentTime = getSecondsSinceMidnight_KST();

    // "HH:MM:SS" 형식을 초 단위로 변환
    const parseTime = (timeStr: string): number => {
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };

    const startTime = parseTime(profile.verifyStartTime);
    const endTime = parseTime(profile.verifyEndTime);

    return currentTime >= startTime && currentTime <= endTime;
  };

  // 챌린지가 시작되었는지 확인
  const isChallengeStarted = (): boolean => {
    if (!data) {
      return false;
    }

    // 챌린지 시작 여부 판단 (KST 기준)
    const todayStr = getTodayYYYYMMDD_KST();

    return data.startDate <= todayStr;
  };

  // 인증하기 버튼 활성화 여부 결정
  const isCertificationButtonDisabled = (): boolean => {
    if (!profile || !data) {
      return true;
    }

    // button status가 CERTIFY_AVAILABLE일 때만 활성화
    return data.actionButtonStatus !== 'CERTIFY_AVAILABLE';
  };

  // 인증하기 버튼 클릭 핸들러
  const handleCertification = () => {
    if (!profile || !data) {
      Alert.alert('오류', '챌린지 정보를 불러올 수 없습니다.');
      return;
    }

    const isStarted = isChallengeStarted();
    const isDayValid = isTodayVerificationDay();

    /**
     * action button status 우선 순위에 따른 처리
     */

    // [1] DISABLED: 챌린지 종료
    if (data.actionButtonStatus === 'DISABLED') {
      Alert.alert('알림', '이미 종료된 챌린지입니다.');
      return;
    }

    // [2, 3, 4] CERTIFIED: 백엔드가 CERTIFIED로 보내주는 경우 (상세 분기 필요)
    if (data.actionButtonStatus === 'CERTIFIED') {
      // [2] 라운드 시작 전 (오늘 < 시작일)
      if (!isStarted) {
        Alert.alert('알림', '라운드가 아직 시작되지 않았습니다.');
        return;
      }

      // [3] 인증 요일이 아님
      if (!isDayValid) {
        Alert.alert('알림', '오늘은 인증 가능한 요일이 아닙니다.');
        return;
      }

      // 오늘의 인증 완료 여부 확인을 위한 데이터 가공
      const todayDayOfWeek = getDayOfWeek_KST();
      const dayMap: { [key: number]: string } = {
        0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
        4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY',
      };
      const todayDayName = dayMap[todayDayOfWeek];
      const hasVerifiedToday = profile.verifiedDaysThisWeek?.includes(todayDayName) || false;

      if (hasVerifiedToday) {
        // [4] 인증 시간 내 + 이미 인증함
        Alert.alert('알림', '오늘의 인증을 이미 완료했습니다.');
      } else {
        // [4] 인증 시간대가 아님 (인증 시간 내 + 미인증 상태가 아님)
        Alert.alert('알림', '지금은 인증 가능한 시간대가 아닙니다.');
      }
      return;
    }

    // [5] CERTIFY_AVAILABLE: 인증 시간 내 + 아직 인증 전
    if (data.actionButtonStatus === 'CERTIFY_AVAILABLE') {
      if (data.verificationType === 'PHOTO') {
        navigation.navigate('ChallengeCertificationCamera', { challengeId });
      } else if (data.verificationType === 'TEXT') {
        navigation.navigate('ChallengeCertificationText', { challengeId });
      }
      return;
    }

    // 예외 케이스
    Alert.alert('알림', '현재는 인증을 진행할 수 없습니다.');
  };

  const handleParticipateConfirm = async () => {
    // 비공개 챌린지인 경우 비밀번호 입력 모달로 전환
    if (!data.isPublic && !isPasswordMode) {
      setIsPasswordMode(true);
      return;
    }

    try {
      if (isPasswordMode) {
        // 비공개 챌린지 - 비밀번호와 함께 참가
        await joinChallenge(challengeId, password);
        setShowParticipateModal(false);
        setIsPasswordMode(false);
        setPassword('');
        setPasswordError(undefined);
        setIsParticipated(true);

        // 참가 후 전체 데이터 새로고침 (버튼 상태 업데이트를 위함)
        await refreshAllData();

        Alert.alert('완료', '챌린지에 참가했습니다.');
      } else {
        // 공개 챌린지 - 비밀번호 없이 참가
        await joinChallenge(challengeId);
        setShowParticipateModal(false);
        setIsParticipated(true);

        // 참가 후 전체 데이터 새로고침 (버튼 상태 업데이트를 위함)
        await refreshAllData();

        Alert.alert('완료', '챌린지에 참가했습니다.');
      }
    } catch (error: any) {
      // 비밀번호 오류인 경우
      if (isPasswordMode && error.message?.includes('비밀번호')) {
        setPasswordError('비밀번호를 다시 확인해 주세요');
      } else {
        Alert.alert('오류', error.message || '챌린지 참가에 실패했습니다.');
      }
    }
  };

  const handleParticipateCancel = () => {
    setShowParticipateModal(false);
    setIsPasswordMode(false);
    setPassword('');
    setPasswordError(undefined);
  };

  const handlePasswordChange = (text: string) => {
    // 숫자만 입력 가능
    const numericText = text.replace(/[^0-9]/g, '');
    setPassword(numericText);
    setPasswordError(undefined); // 입력 시 에러 메시지 초기화
  };

  const hostProfileImage = data.owner.profileImageUrl;
  const fullHostProfileImage = getS3ImageUrl(hostProfileImage);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* 헤더 */}
      <Header
        onBack={handleBack}
        useSafeArea={true}
        rightContent={
          <View style={styles.headerRightContent}>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.headerIconButton}
              activeOpacity={0.7}
            >
              <ShareIcon width={18} height={18} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLike}
              style={styles.headerIconButton}
              activeOpacity={0.7}
            >
              {isLiked ? (
                <LikeSelectedIcon width={20} height={18} />
              ) : (
                <LikeUnselectedIcon width={20} height={18} />
              )}
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 히어로 섹션 */}
        <View style={styles.heroSection}>
          {/* 배경 이미지 */}
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: data.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* 오버레이 */}
            <View style={styles.heroOverlay} />
          </View>

          {/* 텍스트 컨텐츠 */}
          <View style={styles.heroContent}>
            <View style={styles.heroTextContent}>
              <Text variant="header1" color={colors.white} style={styles.challengeName}>
                {challengeData.name}
              </Text>
              <Text variant="xsReg" color={colors.white} style={styles.challengeDescription}>
                {challengeData.description}
              </Text>
            </View>

            {/* 참가자 정보 */}
            <View style={styles.participantInfo}>
              <View style={styles.participantItem}>
                <View style={styles.iconContainer24}>
                  <PeopleIcon width={11.56} height={13} />
                </View>
                <Text variant="xxs" color={colors.white}>
                  {challengeData.participants}/{challengeData.maxParticipants}
                </Text>
              </View>
              {/* 관찰자 모드 (참가 전이면 항상 표시, isObserverMode 값에 따라 활성화/비활성화) */}
              {!isParticipated && (
                <View style={styles.participantItem}>
                  <View style={styles.iconContainer24}>
                    {data.isObserverMode ? (
                      <ObserverEnabledIcon width={13} height={12} />
                    ) : (
                      <ObserverDisabledIcon width={17} height={12} />
                    )}
                  </View>
                  <Text variant="xxs" color={data.isObserverMode ? colors.white : colors.icon.gray}>
                    관찰자 모드
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 방장 프로필 */}
        <TouchableOpacity
          style={styles.hostProfile}
          onPress={handleHostProfile}
          activeOpacity={0.7}
        >
          {fullHostProfileImage ? (
            <Image
              source={{ uri: fullHostProfileImage }}
              style={{ width: scale(40), height: verticalScale(40), borderRadius: 20 }}
            />
          ) : (
            <DefaultProfileIcon width={40} height={40} />
          )}
          <Text variant="smMd" color={colors.text.primary} style={styles.hostNickname}>
            {challengeData.hostNickname}
          </Text>
          <View style={styles.chevronContainer}>
            <ChevronRightTertiaryIcon width={6} height={12} />
          </View>
        </TouchableOpacity>

        {/* 구분선 */}
        <View style={styles.sectionDivider} />

        {/* 프로필/인증현황 탭 (챌린지 시작 이후 + (관찰자 모드가 지원되거나 참가한 경우) 표시) */}
        {isChallengeStarted() && (data.isObserverMode || isParticipated) && (
          <TabBar
            tabs={[
              { key: 'profile', label: '프로필' },
              { key: 'certification', label: '인증현황' },
            ]}
            activeTab={activeTab}
            onTabChange={(tabKey) => {
              setActiveTab(tabKey as 'profile' | 'certification');
            }}
          />
        )}

        {/* 프로필/인증현황 탭 내용 */}
        {isChallengeStarted() && (data.isObserverMode || isParticipated) && activeTab === 'certification' ? (
          // 인증현황 탭
          <View style={styles.certificationSection}>
            {/* 라운드 캐러셀 */}
            <View style={styles.roundCarouselContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.roundCarouselContent,
                  roundCarouselScrollX > 0 && styles.roundCarouselContentScrolled,
                ]}
                onScroll={(e) => setRoundCarouselScrollX(e.nativeEvent.contentOffset.x)}
                scrollEventThrottle={16}
              >
                {rounds.map((round) => (
                  <TouchableOpacity
                    key={round.roundNumber}
                    style={[
                      styles.roundButton,
                      selectedRound === round.roundNumber && styles.roundButtonSelected,
                    ]}
                    onPress={() => setSelectedRound(round.roundNumber)}
                    activeOpacity={0.7}
                  >
                    <Text
                      variant={selectedRound === round.roundNumber ? 'smMd' : 'smReg'}
                      color={selectedRound === round.roundNumber ? colors.white : colors.text.tertiary}
                    >
                      {round.roundNumber}R
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 참가자 요약 */}
            {verificationStat && (
              <View style={styles.participantSummary}>
                <View style={styles.summaryItem}>
                  <Text variant="xsReg" color={colors.text.secondary}>
                    총 참가자 수
                  </Text>
                  <Text variant="xsMd" color={colors.text.primary} style={styles.summaryValue}>
                    {verificationStat.totalParticipantCount}명
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryItemHeaderContainer}>
                    <View style={styles.summaryItemHeader}>
                      <Text variant="xsReg" color={colors.text.secondary}>
                        인증 완료 인원
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.infoIconButton}
                        onPress={() => setShowCertificationTooltip(!showCertificationTooltip)}
                      >
                        <InfoCircleIcon width={14} height={14} />
                      </TouchableOpacity>
                    </View>
                    {showCertificationTooltip && (
                      <View style={styles.tooltip}>
                        <Text variant="xsReg" color={colors.text.secondary}>
                          직전 인증 요일의 인증 완료 인원 기준입니다
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text variant="xsMd" color={colors.text.primary} style={styles.summaryValue}>
                    {verificationStat.certifiedCount}명
                  </Text>
                </View>
              </View>
            )}

            {/* 챌린지 인증현황 타이틀 */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionTitleRow}
                activeOpacity={0.7}
                onPress={() => {
                  if (!isParticipated) {
                    Alert.alert('알림', '챌린지에 참여하면 인증 현황을 확인할 수 있어요.');
                    return;
                  }
                  navigation.navigate('ChallengeCertification', { challengeId });
                }}
              >
                <Text
                  variant="header4"
                  color={colors.text.primary}
                  style={styles.sectionTitleNoMargin}
                >
                  챌린지 인증현황
                </Text>
                <View style={styles.sectionChevronButton}>
                  <ChevronRightIcGreyIcon width={5} height={10} />
                </View>
              </TouchableOpacity>
            </View>

            {/* 인증 피드 내용 */}
            <View style={styles.sectionNoPadding}>
              {isFeedLoading ? (
                <View style={styles.feedLoadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary.main} />
                </View>
              ) : verificationFeed.length > 0 ? (
                <>
                  {/* 글 인증 리스트 */}
                  {verificationFeed.filter(item => item.type === 'TEXT').length > 0 && (
                    <View style={styles.textFeedSection}>
                      <TextCertificationList
                        items={verificationFeed
                          .filter(item => item.type === 'TEXT')
                          .map(item => ({
                            id: item.verificationId,
                            title: item.title,
                            description: item.content,
                            date: item.createdDate,
                            thumbnail: item.imageUrl ? { uri: item.imageUrl } : null,
                            hasLink: item.hasLink,
                            isQuestion: item.isQuestion,
                            isResolved: item.isResolved,
                          }))}
                        containerPadding={scale(24)}
                        onItemPress={(item) => {
                          if (!isParticipated) {
                            Alert.alert('알림', '챌린지에 참여하면 인증 내용을 확인할 수 있어요.');
                            return;
                          }
                          navigation.navigate('ChallengeCertificationDetail', {
                            verificationId: item.id,
                          });
                        }}
                      />
                    </View>
                  )}

                  {/* 사진 인증 그리드 */}
                  {verificationFeed.filter(item => item.type !== 'TEXT').length > 0 && (
                    <PhotoCertificationGrid
                      items={verificationFeed
                        .filter(item => item.type !== 'TEXT')
                        .map(item => ({
                          id: item.verificationId,
                          thumbnail: { uri: item.imageUrl },
                          isQuestion: item.isQuestion,
                          isResolved: item.isResolved,
                        }))}
                      onItemPress={(item) => {
                        if (!isParticipated) {
                          Alert.alert('알림', '챌린지에 참여하면 인증 내용을 확인할 수 있어요.');
                          return;
                        }
                        navigation.navigate('ChallengeCertificationDetail', {
                          verificationId: item.id,
                        });
                      }}
                    />
                  )}
                </>
              ) : (
                <View style={styles.emptyFeedContainerPadding}>
                  <Text variant="xsReg" color={colors.text.tertiary}>
                    아직 인증 게시글이 없습니다.
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          // 프로필 탭
          <>
            {isParticipated ? (
              // 참가 후 UI
              <>
                {/* 요일별 인증 상태 */}
                <View style={styles.daySelectionSection}>
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => {
                    const status = dayStatuses[day];
                    return (
                      <View
                        key={day}
                        style={[
                          styles.dayButton,
                          status === 'completed' && styles.dayButtonCompleted,
                          status === 'required' && styles.dayButtonRequired,
                        ]}
                      >
                        <Text
                          variant={status === 'none' ? 'smReg' : 'smMd'}
                          color={
                            status === 'completed'
                              ? colors.white
                              : status === 'required'
                                ? colors.primary.main
                                : colors.text.tertiary
                          }
                        >
                          {day}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* 인증 시간대 */}
                {profile && (
                  <View style={styles.timeRangeBox}>
                    <View style={styles.timeRangeItem}>
                      <Text variant="header2" color={colors.text.tertiary}>
                        {formatTime(profile.verifyStartTime)}
                      </Text>
                      <Text variant="xsMd" color={colors.text.tertiary} style={styles.timeRangePeriod}>
                        {getAmPm(profile.verifyStartTime)}
                      </Text>
                    </View>
                    <View style={styles.timeRangeDivider} />
                    <View style={styles.timeRangeItem}>
                      <Text variant="header2" color={colors.text.tertiary}>
                        {formatTime(profile.verifyEndTime)}
                      </Text>
                      <Text variant="xsMd" color={colors.text.tertiary} style={styles.timeRangePeriod}>
                        {getAmPm(profile.verifyEndTime)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* 구분선 */}
                <View style={[styles.sectionDivider, styles.sectionDividerAfterTimeRange]} />

                {/* 챌린지 규칙 */}
                <View style={styles.section}>
                  <Text variant="header4" color={colors.text.primary} style={styles.sectionTitle}>
                    챌린지 규칙
                  </Text>
                  <View style={styles.contentBox}>
                    <Text variant="xsReg" color={colors.text.secondary} style={styles.rulesText}>
                      {challengeData.rules}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              // 참가 전 UI
              <>
                {/* 챌린지 일정 정보 */}
                <View style={styles.scheduleSection}>
                  <View style={styles.scheduleItem}>
                    <View style={styles.iconContainer24}>
                      <CalendarIcon width={14} height={14} />
                    </View>
                    <Text variant="smReg" color={colors.text.primary}>
                      {challengeData.schedule.days}
                    </Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.scheduleItem}>
                    <View style={styles.iconContainer24}>
                      <TimeRangeIcon width={16} height={16} />
                    </View>
                    <Text variant="smReg" color={colors.text.primary}>
                      {challengeData.schedule.timeRange}
                    </Text>
                  </View>
                </View>

                {/* 챌린지 규칙 */}
                <View style={styles.section}>
                  <Text variant="header4" color={colors.text.primary} style={styles.sectionTitle}>
                    챌린지 규칙
                  </Text>
                  <View style={styles.contentBox}>
                    <Text variant="xsReg" color={colors.text.secondary} style={styles.rulesText}>
                      {challengeData.rules}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* 챌린지 랭킹 - TODO: API 구현 후 활성화 */}
            {/* {isParticipated || data.isObserverMode ? (
              <View style={[styles.section, styles.rankingSection]}>
                <TouchableOpacity
                  style={styles.sectionTitleRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    navigation.navigate('ChallengeRanking', { challengeId: route.params.challengeId });
                  }}
                >
                  <Text variant="header4" color={colors.text.primary} style={styles.sectionTitleNoMargin}>
                    챌린지 랭킹
                  </Text>
                  <View style={styles.sectionChevronButton}>
                    <ChevronRightIcGreyIcon width={5} height={10} />
                  </View>
                </TouchableOpacity>
                <View style={styles.contentBox}>
                  {challengeData.rankings.map((item, index) => (
                    <View
                      key={item.rank}
                      style={[
                        styles.rankingItem,
                        index === challengeData.rankings.length - 1 && styles.rankingItemLast,
                      ]}
                    >
                      <Text variant="smMd" color={colors.text.tertiary} style={styles.rankNumber}>
                        {item.rank}
                      </Text>
                      <DefaultProfileIcon width={40} height={40} />
                      <Text variant="md" color={colors.text.primary} style={styles.rankingNickname}>
                        {item.nickname}
                      </Text>
                      <Text variant="smReg" color={colors.text.tertiary} style={styles.rankingScore}>
                        {item.score}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={[styles.section, styles.rankingSection]}>
                <View style={styles.sectionTitleRow}>
                  <Text variant="header4" color={colors.text.primary} style={styles.sectionTitleNoMargin}>
                    챌린지 랭킹
                  </Text>
                </View>
                <View style={styles.contentBox}>
                  {challengeData.rankings.map((item, index) => (
                    <View
                      key={item.rank}
                      style={[
                        styles.rankingItem,
                        index === challengeData.rankings.length - 1 && styles.rankingItemLast,
                      ]}
                    >
                      <Text variant="smMd" color={colors.text.tertiary} style={styles.rankNumber}>
                        {item.rank}
                      </Text>
                      <DefaultProfileIcon width={40} height={40} />
                      <Text variant="md" color={colors.text.primary} style={styles.rankingNickname}>
                        {item.nickname}
                      </Text>
                      <Text variant="smReg" color={colors.text.tertiary} style={styles.rankingScore}>
                        {item.score}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )} */}
          </>
        )}
      </ScrollView>

      {/* 참가하기/인증하기 버튼 */}
      <View style={styles.buttonDivider} />
      <View style={styles.buttonContainer}>
        {isParticipated ? (
          <Button
            variant={isCertificationButtonDisabled() ? 'gray' : 'black'}
            size="medium"
            onPress={handleCertification}
          >
            인증하기
          </Button>
        ) : (
          <Button
            variant={isParticipateButtonDisabled() ? 'gray' : 'primary'}
            size="medium"
            onPress={handleParticipate}
          >
            참가하기
          </Button>
        )}
      </View>

      {/* 참가 확인 모달창 */}
      <Modal
        visible={showParticipateModal}
        transparent
        animationType="fade"
        onRequestClose={handleParticipateCancel}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={handleParticipateCancel}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <Text
              variant="header3"
              color={colors.text.primary}
              style={isPasswordMode ? styles.modalTitleWithPassword : styles.modalTitle}
            >
              {isPasswordMode ? '비공개 챌린지예요' : '챌린지에 참가하시겠어요?'}
            </Text>
            {isPasswordMode ? (
              <View style={styles.modalTextFieldContainer}>
                <TextField
                  variant="default"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChangeText={handlePasswordChange}
                  error={passwordError}
                  keyboardType="numeric"
                  secureTextEntry
                  containerStyle={styles.modalTextField}
                  inputContainerStyle={styles.modalTextFieldInput}
                />
              </View>
            ) : (
              <Text variant="xsReg" color={colors.text.tertiary} style={styles.modalDescription}>
                챌린지에 참가하면 한 라운드가 끝나기 전까지{'\n'}
                취소 및 중도 포기가 불가능해요
              </Text>
            )}
            <View style={[styles.modalButtons, isPasswordMode && styles.modalButtonsWithPassword]}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleParticipateConfirm}
                disabled={isPasswordMode && password.length === 0}
                activeOpacity={0.7}
              >
                <Text
                  variant="smMd"
                  color={
                    isPasswordMode && password.length === 0
                      ? colors.icon.gray
                      : colors.text.primary
                  }
                >
                  {isPasswordMode ? '확인' : '네'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleParticipateCancel}
                activeOpacity={0.7}
              >
                <Text variant="smMd" color={colors.text.primary}>
                  {isPasswordMode ? '취소' : '아니오'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
  headerRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(0),
    marginRight: -12,
  },
  headerIconButton: {
    width: scale(48),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    position: 'relative',
    width: '100%',
    height: verticalScale(240),
  },
  heroImageContainer: {
    position: 'absolute',
    top: verticalScale(0),
    left: scale(0),
    right: scale(0),
    bottom: verticalScale(0),
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: verticalScale(0),
    left: scale(0),
    right: scale(0),
    bottom: verticalScale(0),
    backgroundColor: '#000000',
    opacity: 0.6,
  },
  heroContent: {
    position: 'relative',
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(24),
    zIndex: 1,
    height: '100%',
    justifyContent: 'space-between',
  },
  heroTextContent: {
    flex: 1,
    marginTop: verticalScale(40),
  },
  challengeName: {
    marginBottom: verticalScale(4),
    lineHeight: verticalScale(26),
  },
  challengeDescription: {
    marginBottom: verticalScale(23),
    lineHeight: verticalScale(16),
  },
  participantInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: scale(1),
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  iconContainer24: {
    width: scale(24),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(16),
    gap: scale(12),
  },
  hostNickname: {
    flex: 1,
    lineHeight: verticalScale(20),
  },
  chevronContainer: {
    width: scale(48),
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionDivider: {
    height: verticalScale(8),
    backgroundColor: colors.background,
  },
  sectionDividerAfterTimeRange: {
    marginTop: verticalScale(28),
  },
  scheduleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(28),
    gap: scale(12),
  },
  daySelectionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(28),
  },
  dayButton: {
    width: scale(44),
    height: verticalScale(60),
    borderRadius: scale(30),
    borderWidth: scale(1.5),
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonCompleted: {
    backgroundColor: colors.primary.main,
    borderWidth: scale(0),
  },
  dayButtonRequired: {
    borderColor: colors.primary.main,
    backgroundColor: 'transparent',
  },
  timeRangeBox: {
    height: verticalScale(60),
    borderRadius: scale(10),
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(20),
    marginTop: verticalScale(16),
  },
  timeRangeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    paddingLeft: scale(20),
    gap: scale(6),
  },
  timeRangePeriod: {
    marginTop: verticalScale(4), // 작은 글자라서 시각적 정렬을 위해 약간 아래로
  },
  timeRangeDivider: {
    width: scale(1.5),
    height: verticalScale(20),
    backgroundColor: colors.button,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  verticalDivider: {
    width: scale(1.5),
    height: verticalScale(18),
    backgroundColor: colors.line,
  },
  section: {
    paddingHorizontal: scale(24),
    marginTop: verticalScale(36),
  },
  sectionNoPadding: {
    paddingHorizontal: scale(0),
    marginTop: verticalScale(12),
  },
  sectionTitleNoPadding: {
    paddingHorizontal: scale(24),
  },
  rankingSection: {
    marginBottom: verticalScale(60),
  },
  certificationSection: {
    paddingTop: verticalScale(28),
  },
  roundCarouselContainer: {
    marginBottom: verticalScale(24),
  },
  roundCarouselContent: {
    gap: scale(10),
    paddingHorizontal: scale(20),
  },
  roundCarouselContentScrolled: {
    paddingLeft: scale(0),
  },
  roundButton: {
    width: scale(60),
    height: verticalScale(60),
    borderRadius: scale(10),
    backgroundColor: colors.white,
    borderWidth: scale(1.5),
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButtonSelected: {
    backgroundColor: colors.primary.main,
    borderWidth: scale(0),
  },
  participantSummary: {
    flexDirection: 'column',
    gap: scale(16),
    paddingHorizontal: scale(24),
    marginBottom: verticalScale(12),
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemHeaderContainer: {
    flex: 1,
    position: 'relative',
  },
  summaryItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  summaryValue: {
    alignSelf: 'flex-end',
  },
  infoIconButton: {
    width: scale(16),
    height: verticalScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(10),
  },
  tooltip: {
    position: 'absolute',
    top: verticalScale(24),
    left: scale(84),
    height: verticalScale(32),
    borderRadius: scale(10),
    backgroundColor: colors.background,
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(8),
    justifyContent: 'center',
    zIndex: 10,
  },
  gridThumbnailOverlay: {
    position: 'absolute',
    top: verticalScale(0),
    left: scale(0),
    right: scale(0),
    bottom: verticalScale(0),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  gridThumbnailOverlayTransparent: {
    backgroundColor: 'transparent',
  },
  gridQuestionMarkContainer: {
    position: 'absolute',
    top: verticalScale(12),
    left: scale(12),
  },
  sectionHeaderOnly: {
    paddingHorizontal: scale(24),
    marginTop: verticalScale(36),
  },
  feedLoadingContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFeedContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: scale(10),
  },
  emptyFeedContainerPadding: {
    paddingVertical: verticalScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: scale(10),
    marginHorizontal: scale(24),
    marginTop: verticalScale(-12),
  },
  textFeedSection: {
    marginTop: verticalScale(-20),
  },
  sectionTitleRow: {
    paddingVertical: verticalScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(15),
    marginBottom: verticalScale(4),
  },
  sectionTitleRowNoPadding: {
    paddingHorizontal: scale(24),
  },
  sectionChevronButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    lineHeight: verticalScale(20),
    marginBottom: verticalScale(12),
  },
  sectionTitleNoMargin: {
    lineHeight: verticalScale(20),
  },
  contentBox: {
    backgroundColor: colors.background,
    borderRadius: scale(10),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(18),
  },
  rulesText: {
    lineHeight: verticalScale(18),
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: verticalScale(12),
  },
  rankingItemLast: {
    marginBottom: verticalScale(0),
  },
  rankNumber: {
    width: scale(24),
    lineHeight: verticalScale(20),
  },
  rankingNickname: {
    flex: 1,
    lineHeight: verticalScale(20),
  },
  rankingScore: {
    lineHeight: verticalScale(20),
  },
  buttonDivider: {
    height: verticalScale(1),
    backgroundColor: colors.line,
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    paddingTop: verticalScale(12),
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContent: {
    width: '100%',
    height: verticalScale(180),
    backgroundColor: colors.white,
    borderRadius: scale(20),
    paddingTop: verticalScale(28),
    paddingLeft: scale(24),
    justifyContent: 'space-between',
  },
  modalTitle: {
    lineHeight: verticalScale(22),
    marginBottom: -16,
  },
  modalTitleWithPassword: {
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(10),
  },
  modalDescription: {
    lineHeight: verticalScale(18),
  },
  modalTextFieldContainer: {
    marginLeft: -4,
    marginRight: scale(20),
  },
  modalTextField: {
    width: '100%',
  },
  modalTextFieldInput: {
    height: verticalScale(48),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: scale(4),
    paddingBottom: verticalScale(12),
    paddingRight: scale(16),
  },
  modalButtonsWithPassword: {
    marginTop: -16, // 비밀번호 모드일 때 타이틀과 텍스트 필드 사이 간격
  },
  modalButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    minWidth: scale(60),
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

