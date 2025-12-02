import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '../../components/common/Text';
import { TextField } from '../../components/common/TextField';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { colors } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
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
import QuestionMarkTextIcon from '../../../assets/icons/challenge-profile/question-mark-text.svg';
import QuestionMarkCircleIcon from '../../../assets/icons/challenge-profile/question-mark-circle.svg';
import LinkIcon from '../../../assets/icons/challenge-profile/link.svg';

type ChallengeProfileScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeProfile'>;
type ChallengeProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeProfile'
>;

interface RankingItem {
  rank: number;
  nickname: string;
  score: number;
}

interface CertificationItem {
  id: number;
  title: string;
  description: string;
  date: string;
  thumbnail: any;
}

export const ChallengeProfileScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeProfileScreenNavigationProp>();
  const route = useRoute<ChallengeProfileScreenRouteProp>();
  const { challengeId } = route.params;
  const [isLiked, setIsLiked] = useState(false);
  const [isObserverModeEnabled, setIsObserverModeEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'certification'>('profile');
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [showCertificationTooltip, setShowCertificationTooltip] = useState(false);
  const [roundCarouselScrollX, setRoundCarouselScrollX] = useState(0);
  // TODO: API 연동 후 인증 타입 정보 가져오기
  const [certificationType, setCertificationType] = useState<'text' | 'image'>('text');
  // TODO: API 연동 후 참가 상태 정보 가져오기
  const [isParticipated, setIsParticipated] = useState(false);
  // TODO: API 연동 후 요일별 인증 상태 정보 가져오기
  const [dayStatuses, setDayStatuses] = useState<{
    [key: string]: 'none' | 'required' | 'completed';
  }>({
    일: 'none',
    월: 'completed', // 인증 요일, 인증 완료
    화: 'none',
    수: 'none',
    목: 'required', // 인증 요일, 인증 전
    금: 'none',
    토: 'none',
  });

  const handleBack = () => {
    navigation.goBack();
  };

  // 임시 데이터
  const challengeData = {
    name: '백준 실버3 코테',
    description: '백준 실버3 매일 풀고 공유',
    participants: 10,
    maxParticipants: 30,
    isObserverMode: true,
    hostNickname: '김흐르',
    schedule: {
      days: '월/목',
      timeRange: '10:00 ~ 18:00',
    },
    rules: '해당 챌린지는 월요일과 목요일, 일주일에 2번을 인증해야 합니다. 오전 10시부터 오후 6시까지만 인증이 가능하므로 그 시간 안에 코딩테스트를 풀고 작성해주세요.',
    rankings: [
      { rank: 1, nickname: '헤더', score: 156 },
      { rank: 2, nickname: '헤더', score: 102 },
      { rank: 3, nickname: '헤더', score: 89 },
    ] as RankingItem[],
    certifications: [
      {
        id: 1,
        title: '해피뉴이어! 올해 마지막 인증 올립니다',
        description: '여기엔 상세내용이 들어가유~',
        date: '2025.12.02',
        thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
      },
      {
        id: 2,
        title: '인증 제목 2',
        description: '상세 내용 2',
        date: '2025.12.02',
        thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
      },
      {
        id: 3,
        title: '인증 제목 3',
        description: '상세 내용 3',
        date: '2025.12.02',
        thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
      },
      {
        id: 4,
        title: '인증 제목 4',
        description: '상세 내용 4',
        date: '2025.12.02',
        thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
      },
      {
        id: 5,
        title: '인증 제목 5',
        description: '상세 내용 5',
        date: '2025.12.02',
        thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
      },
      {
        id: 6,
        title: '인증 제목 6',
        description: '상세 내용 6',
        date: '2025.12.02',
        thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
      },
    ],
  };

  const handleShare = () => {
    // TODO: 공유 기능 구현
    console.log('공유하기');
  };

  const handleLike = () => {
    // TODO: 찜하기 기능 구현
    // 현재는 아이콘 이미지 상태만 변경
    setIsLiked(!isLiked);
  };

  const handleHostProfile = () => {
    // TODO: 방장 프로필 화면으로 이동
    console.log('방장 프로필');
  };

  const handleParticipate = () => {
    setShowParticipateModal(true);
    setIsPasswordMode(false);
    setPassword('');
    setPasswordError(undefined);
  };

  const handleParticipateConfirm = () => {
    // 비공개 챌린지인 경우 비밀번호 입력 모달로 전환
    const isPrivate = true; // TODO: API 연동 후 challengeData.isPrivate로 변경
    if (isPrivate && !isPasswordMode) {
      setIsPasswordMode(true);
      return;
    }

    if (isPasswordMode) {
      // 비밀번호 입력 확인
      if (password === '1234') {
        // TODO: API 연동 후 실제 참가 기능 구현하기
        setShowParticipateModal(false);
        setIsPasswordMode(false);
        setPassword('');
        setPasswordError(undefined);
        setIsParticipated(true);
      } else {
        setPasswordError('비밀번호를 다시 확인해 주세요');
      }
    } else {
      // TODO: API 연동 후 실제 참가 기능 구현하기
      setShowParticipateModal(false);
      setIsParticipated(true);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <Header
        onBack={handleBack}
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
              source={require('../../../assets/images/mock-challenge-profile.png')}
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
              {/* 관찰자 모드 (참가 전에만 표시) */}
              {!isParticipated && challengeData.isObserverMode && (
                <TouchableOpacity
                  style={styles.participantItem}
                  onPress={() => {
                    // TODO: UI 테스트를 위한 임시 토글 기능, API 연동 시 수정 예정
                    setIsObserverModeEnabled(!isObserverModeEnabled);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer24}>
                    {isObserverModeEnabled ? (
                      <ObserverEnabledIcon width={13} height={12} />
                    ) : (
                      <ObserverDisabledIcon width={17} height={12} />
                    )}
                  </View>
                  <Text
                    variant="xxs"
                    color={isObserverModeEnabled ? colors.white : colors.icon.gray}
                  >
                    관찰자 모드
                  </Text>
                </TouchableOpacity>
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
          <DefaultProfileIcon width={40} height={40} />
          <Text variant="smMd" color={colors.text.primary} style={styles.hostNickname}>
            {challengeData.hostNickname}
          </Text>
          <View style={styles.chevronContainer}>
            <ChevronRightTertiaryIcon width={6} height={12} />
          </View>
        </TouchableOpacity>

        {/* 구분선 */}
        <View style={styles.sectionDivider} />

        {/* 프로필/인증현황 탭 (관찰자 모드 활성화 또는 참가 후 표시) */}
        {(isObserverModeEnabled || isParticipated) && (
          <>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => setActiveTab('profile')}
                activeOpacity={0.7}
              >
                <Text
                  variant={activeTab === 'profile' ? 'xsMd' : 'xsReg'}
                  color={activeTab === 'profile' ? colors.primary.main : colors.text.secondary}
                >
                  프로필
                </Text>
                {activeTab === 'profile' && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => {
                  setActiveTab('certification');
                  // TODO: 개발 단계 - 인증 타입 전환 (API 연동 후 제거)
                  setCertificationType((prev) => (prev === 'text' ? 'image' : 'text'));
                }}
                activeOpacity={0.7}
              >
                <Text
                  variant={activeTab === 'certification' ? 'xsMd' : 'xsReg'}
                  color={activeTab === 'certification' ? colors.primary.main : colors.text.secondary}
                >
                  인증현황
                </Text>
                {activeTab === 'certification' && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            </View>
            <View style={styles.tabDivider} />
          </>
        )}

        {/* 프로필/인증현황 탭 내용 */}
        {(isObserverModeEnabled || isParticipated) && activeTab === 'certification' ? (
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
                {[6, 1, 2, 3, 4, 5].map((round, index) => (
                  <View
                    key={round}
                    style={[
                      styles.roundButton,
                      index === 0 && styles.roundButtonSelected,
                    ]}
                  >
                    <Text
                      variant={index === 0 ? 'smMd' : 'smReg'}
                      color={index === 0 ? colors.white : colors.text.tertiary}
                    >
                      {round}R
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 참가자 요약 */}
            <View style={styles.participantSummary}>
              <View style={styles.summaryItem}>
                <Text variant="xsReg" color={colors.text.secondary}>
                  총 참가자 수
                </Text>
                <Text variant="xsMd" color={colors.text.primary} style={styles.summaryValue}>
                  {challengeData.maxParticipants}명
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
                  {challengeData.maxParticipants}명
                </Text>
              </View>
            </View>

            {/* 챌린지 인증현황 */}
            <View style={certificationType === 'image' ? styles.sectionNoPadding : styles.section}>
              <View
                style={[
                  styles.sectionTitleRow,
                  certificationType === 'image' && styles.sectionTitleRowNoPadding,
                ]}
              >
                <Text
                  variant="header4"
                  color={colors.text.primary}
                  style={styles.sectionTitleNoMargin}
                >
                  챌린지 인증현황
                </Text>
                {isParticipated && (
                  <TouchableOpacity
                    style={styles.sectionChevronButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <ChevronRightIcGreyIcon width={5} height={10} />
                  </TouchableOpacity>
                )}
              </View>
              {certificationType === 'text' ? (
                // 글 인증(리스트 형태)
                <View style={styles.certificationList}>
                  {challengeData.certifications.map((cert) => (
                    <View key={cert.id} style={styles.certificationItem}>
                      <View style={styles.certificationContent}>
                        <Text variant="smMd" color={colors.text.primary} style={styles.certificationTitle}>
                          {cert.title}
                        </Text>
                        <Text variant="xxs" color={colors.text.tertiary} style={styles.certificationDescription}>
                          {cert.description}
                        </Text>
                        <View style={styles.certificationDate}>
                          <Text variant="xxs" color={colors.text.tertiary}>
                            {cert.date}
                          </Text>
                          <LinkIcon width={10} height={10} />
                        </View>
                      </View>
                      <View style={styles.certificationThumbnail}>
                        <Image source={cert.thumbnail} style={styles.thumbnailImage} />
                        <View style={styles.thumbnailOverlay}>
                          <QuestionMarkTextIcon width={30} height={36} />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                // 사진 인증(그리드 형태)
                <View style={styles.certificationGrid}>
                  {challengeData.certifications.map((cert) => (
                    <View key={cert.id} style={styles.certificationGridItem}>
                      <Image source={cert.thumbnail} style={styles.gridThumbnailImage} />
                      <View
                        style={[
                          styles.gridThumbnailOverlay,
                          isParticipated && styles.gridThumbnailOverlayTransparent,
                        ]}
                      >
                        <View style={styles.gridQuestionMarkContainer}>
                          <QuestionMarkCircleIcon width={24} height={24} />
                        </View>
                      </View>
                    </View>
                  ))}
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
                <View style={styles.timeRangeBox}>
                  <View style={styles.timeRangeItem}>
                    <Text variant="header2" color={colors.text.tertiary}>
                      10:00
                    </Text>
                    <Text variant="xsMd" color={colors.text.tertiary} style={styles.timeRangePeriod}>
                      AM
                    </Text>
                  </View>
                  <View style={styles.timeRangeDivider} />
                  <View style={styles.timeRangeItem}>
                    <Text variant="header2" color={colors.text.tertiary}>
                      06:00
                    </Text>
                    <Text variant="xsMd" color={colors.text.tertiary} style={styles.timeRangePeriod}>
                      PM
                    </Text>
                  </View>
                </View>

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

        {/* 챌린지 랭킹 */}
        {isParticipated ? (
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
        )}
          </>
        )}
      </ScrollView>

      {/* 참가하기/인증하기 버튼 */}
      <View style={styles.buttonDivider} />
      <View style={styles.buttonContainer}>
        <Button
          variant={isParticipated ? 'black' : 'primary'}
          size="medium"
          onPress={isParticipated ? () => console.log('인증하기') : handleParticipate}
        >
          {isParticipated ? '인증하기' : '참가하기'}
        </Button>
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
    paddingBottom: 20,
  },
  headerRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginRight: -12,
  },
  headerIconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -12, // 레이아웃에서 위아래로 12px씩 당겨서 실제 차지 공간은 24px로 줄임
  },
  heroSection: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  heroImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    opacity: 0.6,
  },
  heroContent: {
    position: 'relative',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    zIndex: 1,
    height: '100%',
    justifyContent: 'space-between',
  },
  heroTextContent: {
    flex: 1,
    marginTop: 40,
  },
  challengeName: {
    marginBottom: 4,
    lineHeight: 26,
  },
  challengeDescription: {
    marginBottom: 23,
    lineHeight: 16,
  },
  participantInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 1,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconContainer24: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  hostNickname: {
    flex: 1,
    lineHeight: 20,
  },
  chevronContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionDivider: {
    height: 8,
    backgroundColor: colors.background,
  },
  sectionDividerAfterTimeRange: {
    marginTop: 28,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 12,
    position: 'relative',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    width: 48,
    height: 3,
    backgroundColor: colors.primary.main,
  },
  tabDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: 20,
  },
  scheduleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 12,
  },
  daySelectionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  dayButton: {
    width: 44,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonCompleted: {
    backgroundColor: colors.primary.main,
    borderWidth: 0,
  },
  dayButtonRequired: {
    borderColor: colors.primary.main,
    backgroundColor: 'transparent',
  },
  timeRangeBox: {
    height: 60,
    borderRadius: 10,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
  },
  timeRangeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    paddingLeft: 20,
    gap: 6,
  },
  timeRangePeriod: {
    marginTop: 4, // 작은 글자라서 시각적 정렬을 위해 약간 아래로
  },
  timeRangeDivider: {
    width: 1.5,
    height: 20,
    backgroundColor: colors.button,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verticalDivider: {
    width: 1.5,
    height: 18,
    backgroundColor: colors.line,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 36,
  },
  sectionNoPadding: {
    paddingHorizontal: 0,
    marginTop: 36,
  },
  sectionTitleNoPadding: {
    paddingHorizontal: 24,
  },
  rankingSection: {
    marginBottom: 60,
  },
  certificationSection: {
    paddingTop: 28,
  },
  roundCarouselContainer: {
    marginBottom: 24,
  },
  roundCarouselContent: {
    gap: 10,
    paddingHorizontal: 20,
  },
  roundCarouselContentScrolled: {
    paddingLeft: 0,
  },
  roundButton: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButtonSelected: {
    backgroundColor: colors.primary.main,
    borderWidth: 0,
  },
  participantSummary: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
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
    gap: 4,
  },
  summaryValue: {
    alignSelf: 'flex-end',
  },
  infoIconButton: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  tooltip: {
    position: 'absolute',
    top: 24,
    left: 84,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.background,
    paddingHorizontal: 18,
    paddingVertical: 8,
    justifyContent: 'center',
    zIndex: 10,
  },
  certificationList: {
    gap: 0,
  },
  certificationItem: {
    flexDirection: 'row',
    height: 104,
    paddingVertical: 12,
    gap: 12,
  },
  certificationContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  certificationTitle: {
    lineHeight: 20,
  },
  certificationDescription: {
    lineHeight: 18,
    marginTop: 5,
  },
  certificationDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
  },
  certificationThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 12,
  },
  certificationGridItem: {
    width: (Dimensions.get('window').width - 6) / 3, // 화면 너비 - gap(3*2) / 3개
    height: (Dimensions.get('window').width - 6) / 3,
    overflow: 'hidden',
    position: 'relative',
  },
  gridThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  gridThumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  gridThumbnailOverlayTransparent: {
    backgroundColor: 'transparent',
  },
  gridQuestionMarkContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  sectionTitleRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 4,
  },
  sectionTitleRowNoPadding: {
    paddingHorizontal: 24,
  },
  sectionChevronButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionTitleNoMargin: {
    lineHeight: 20,
  },
  contentBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  rulesText: {
    lineHeight: 18,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  rankingItemLast: {
    marginBottom: 0,
  },
  rankNumber: {
    width: 24,
    lineHeight: 20,
  },
  rankingNickname: {
    flex: 1,
    lineHeight: 20,
  },
  rankingScore: {
    lineHeight: 20,
  },
  buttonDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    height: 180,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingTop: 28,
    paddingLeft: 24,
    justifyContent: 'space-between',
  },
  modalTitle: {
    lineHeight: 22,
    marginBottom: -16,
  },
  modalTitleWithPassword: {
    lineHeight: 22,
    marginBottom: 10,
  },
  modalDescription: {
    lineHeight: 18,
  },
  modalTextFieldContainer: {
    marginLeft: -4,
    marginRight: 20,
  },
  modalTextField: {
    width: '100%',
  },
  modalTextFieldInput: {
    height: 48,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
    paddingBottom: 12,
    paddingRight: 16,
  },
  modalButtonsWithPassword: {
    marginTop: -16, // 비밀번호 모드일 때 타이틀과 텍스트 필드 사이 간격
  },
  modalButton: {
    width: 60,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

