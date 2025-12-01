import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '../components/common/Text';
import { TextField } from '../components/common/TextField';
import { Button } from '../components/common/Button';
import { Header } from '../components/common/Header';
import { colors } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import ShareIcon from '../../assets/icons/share.svg';
import LikeSelectedIcon from '../../assets/icons/like-selected.svg';
import LikeUnselectedIcon from '../../assets/icons/like-unselected.svg';
import PeopleIcon from '../../assets/icons/people.svg';
import ObserverDisabledIcon from '../../assets/icons/observer-disabled.svg';
import ObserverEnabledIcon from '../../assets/icons/observer-enabled.svg';
import DefaultProfileIcon from '../../assets/icons/default-profile.svg';
import CalendarIcon from '../../assets/icons/calendar.svg';
import TimeRangeIcon from '../../assets/icons/time-range.svg';
import ChevronRightTertiaryIcon from '../../assets/icons/chevron-right-tertiary.svg';

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
      } else {
        setPasswordError('비밀번호를 다시 확인해 주세요');
      }
    } else {
      // TODO: API 연동 후 실제 참가 기능 구현하기
      setShowParticipateModal(false);
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
              source={require('../../assets/images/mock-challenge-profile.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* 오버레이 */}
            <View style={styles.heroOverlay} />
          </View>

          {/* 텍스트 컨텐츠 */}
          <View style={styles.heroContent}>
            <Text variant="header1" color={colors.white} style={styles.challengeName}>
              {challengeData.name}
            </Text>
            <Text variant="xsReg" color={colors.white} style={styles.challengeDescription}>
              {challengeData.description}
            </Text>

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

              {/* 관찰자 모드가 활성화 된 경우에만 표시 */}
              {challengeData.isObserverMode && (
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

        {/* 프로필/인증현황 탭 (관찰자 모드 활성화 시에만 표시) */}
        {isObserverModeEnabled && (
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
                onPress={() => setActiveTab('certification')}
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

        {/* 챌린지 랭킹 */}
        <View style={[styles.section, styles.rankingSection]}>
          <Text variant="header4" color={colors.text.primary} style={styles.sectionTitle}>
            챌린지 랭킹
          </Text>
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
      </ScrollView>

      {/* 참가하기 버튼 */}
      <View style={styles.buttonDivider} />
      <View style={styles.buttonContainer}>
        <Button variant="primary" size="medium" onPress={handleParticipate}>
          참가하기
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
    justifyContent: 'flex-end',
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
    paddingHorizontal: 25,
    paddingTop: 28,
    gap: 12,
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
  rankingSection: {
    marginBottom: 60,
  },
  sectionTitle: {
    marginBottom: 12,
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

