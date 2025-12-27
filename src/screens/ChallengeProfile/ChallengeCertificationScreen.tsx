import React, { useState } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Circle } from 'react-native-svg';
import { Header } from '../../components/common/Header';
import { TabBar, TabItem } from '../../components/common/TabBar';
import { PhotoCertificationGrid, PhotoCertificationItem } from '../../components/common/PhotoCertificationGrid';
import { TextCertificationList, TextCertificationItem } from '../../components/common/TextCertificationList';
import { Button } from '../../components/common/Button';
import { Text } from '../../components/common/Text';
import DefaultProfileIcon from '../../../assets/icons/challenge-profile/default-profile.svg';
import { colors } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';

type ChallengeCertificationScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeCertification'>;
type ChallengeCertificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeCertification'
>;

// TODO: API 연동 후 실제 데이터로 교체
const mockCertifications: PhotoCertificationItem[] = [
  {
    id: 1,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 2,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 3,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 4,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 5,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 6,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 7,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 8,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 9,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 10,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 11,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 12,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 13,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
  {
    id: 14,
    thumbnail: require('../../../assets/images/mock-challenge-profile.png'),
  },
];

export const ChallengeCertificationScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeCertificationScreenNavigationProp>();
  const route = useRoute<ChallengeCertificationScreenRouteProp>();
  const [activeTab, setActiveTab] = useState<'my' | 'challenger'>('my');
  const [roundCarouselScrollX, setRoundCarouselScrollX] = useState(0);
  const [selectedRound, setSelectedRound] = useState(6);
  // TODO: API 연동 후 실제 인증 타입으로 변경
  const [myCertificationType, setMyCertificationType] = useState<'image' | 'text'>('image');
  const [challengerCertificationType, setChallengerCertificationType] = useState<'image' | 'text'>('image');

  const tabs: TabItem[] = [
    { key: 'my', label: '마이' },
    { key: 'challenger', label: '챌린저' },
  ];

  // TODO: API 연동 후 실제 데이터로 교체
  const mockTextCertifications: TextCertificationItem[] = [
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
  ];

  // TODO: API 연동 후 실제 데이터로 교체
  // 참여한 라운드 목록 (챌린저 탭에서 사용)
  const participatedRounds = [6, 3, 4, 5];

  // 라운드 목록 (맨 앞 라운드=현재 진행 중인 라운드)
  const rounds = [6, 1, 2, 3, 4, 5];
  const firstRound = rounds[0]; // 기본값(맨 앞 라운드)

  const isParticipated = (round: number) => participatedRounds.includes(round);
  const isFirstRound = (round: number, index: number) => index === 0;

  const handleRoundPress = (round: number) => {
    // 이미 선택된 라운드를 다시 클릭하면 기본값(맨 앞 라운드)로 이동
    if (selectedRound === round) {
      setSelectedRound(firstRound);
    } else {
      setSelectedRound(round);
    }
  };

  // TODO: API 연동 후 실제 데이터로 교체
  const completedCount = 23;
  const totalCount = 30;
  const progressPercentage = (completedCount / totalCount) * 100;

  // 원형 그래프 계산
  const size = 240; // 원형 그래프 크기(240x240)
  const center = size / 2; // 원형 그래프 중심
  const radius = (size - 20) / 2; // 원형 그래프 반지름(strokeWidth 10*2 빼고 / 2)
  const circumference = 2 * Math.PI * radius; // 원형 그래프 원주
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference; // 원형 그래프 시작 위치

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="인증현황"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(key) => {
            const newTab = key as 'my' | 'challenger';
            // TODO: API 연동 후 제거 (탭 클릭 시 인증 타입 전환)
            if (key === 'my' && activeTab === 'my') {
              setMyCertificationType((prev) => (prev === 'image' ? 'text' : 'image'));
            } else if (key === 'challenger' && activeTab === 'challenger') {
              setChallengerCertificationType((prev) => (prev === 'image' ? 'text' : 'image'));
            } else {
              setActiveTab(newTab);
            }
          }}
        />

        {activeTab === 'my' ? (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* 프로필 영역 */}
            <View style={styles.profileSection}>
              <DefaultProfileIcon width={100} height={100} />
              <View style={styles.profileInfo}>
                <Text variant="header2" color={colors.text.primary} style={styles.nickname}>
                  해빗
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text variant="xsReg" color={colors.text.tertiary}>
                      인증
                    </Text>
                    <Text variant="xsMd" color={colors.text.primary}>
                      10회
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="xsReg" color={colors.text.tertiary}>
                      경고
                    </Text>
                    <Text variant="xsMd" color={colors.text.primary}>
                      0회
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 진행 중 버튼 */}
            <View style={styles.buttonContainer}>
              <Button variant="black" size="medium" onPress={() => { }}>
                1R째 진행 중
              </Button>
            </View>

            {/* 구분선 */}
            <View style={styles.sectionDivider} />

            {/* 인증 목록 */}
            {myCertificationType === 'image' ? (
              // 사진 인증(그리드 형태)
              <View style={styles.gridContainer}>
                <PhotoCertificationGrid
                  items={mockCertifications}
                  onItemPress={(item) => {
                    // TODO: 인증 상세 화면으로 이동
                  }}
                />
              </View>
            ) : (
              // 글 인증(리스트 형태)
              <TextCertificationList
                items={mockTextCertifications}
                onItemPress={(item) => {
                  // TODO: 인증 상세 화면으로 이동
                }}
              />
            )}
          </ScrollView>
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* 원형 그래프 영역 */}
            <View style={styles.progressSection}>
              <View style={styles.circularProgressContainer}>
                <Svg width={size} height={size} style={styles.circularProgressSvg}>
                  {/* 배경 원 */}
                  <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={colors.background}
                    strokeWidth={10}
                    fill="none"
                  />
                  {/* 진행 원 */}
                  <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={colors.primary.main}
                    strokeWidth={10}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${center} ${center})`}
                  />
                </Svg>
                <View style={styles.progressTextContainer}>
                  <Text variant="header1" color={colors.text.primary}>
                    {completedCount} / {totalCount}
                  </Text>
                </View>
              </View>

              {/* 통계 정보 */}
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text variant="xsReg" color={colors.text.tertiary}>
                    총인원
                  </Text>
                  <Text variant="xsMd" color={colors.text.primary}>
                    {totalCount}명
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text variant="xsReg" color={colors.text.tertiary}>
                    인증완료
                  </Text>
                  <Text variant="xsMd" color={colors.text.primary}>
                    {completedCount}명
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text variant="xsReg" color={colors.text.tertiary}>
                    미인증
                  </Text>
                  <Text variant="xsMd" color={colors.text.primary}>
                    {totalCount - completedCount}명
                  </Text>
                </View>
              </View>
            </View>

            {/* 구분선 */}
            <View style={styles.sectionDivider} />

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
                {rounds.map((round, index) => {
                  const participated = isParticipated(round);
                  const isFirst = isFirstRound(round, index);
                  const isSelected = selectedRound === round;

                  // 참여하지 않은 라운드는 클릭 불가
                  if (!participated) {
                    return (
                      <View
                        key={round}
                        style={[styles.roundButton, styles.roundButtonNotParticipated]}
                      >
                        <Text variant="smReg" color={colors.button}>
                          {round}R
                        </Text>
                      </View>
                    );
                  }

                  // 맨 앞 라운드 (현재 진행 중인 라운드)
                  if (isFirst) {
                    return (
                      <TouchableOpacity
                        key={round}
                        style={[
                          styles.roundButton,
                          styles.roundButtonFirst,
                        ]}
                        onPress={() => handleRoundPress(round)}
                        activeOpacity={0.7}
                      >
                        <Text variant="smReg" color={colors.primary.main}>
                          {round}R
                        </Text>
                      </TouchableOpacity>
                    );
                  }

                  // 참여한 라운드 (선택 가능)
                  return (
                    <TouchableOpacity
                      key={round}
                      style={[
                        styles.roundButton,
                        isSelected ? styles.roundButtonSelected : styles.roundButtonParticipated,
                      ]}
                      onPress={() => handleRoundPress(round)}
                      activeOpacity={0.7}
                    >
                      <Text
                        variant={isSelected ? 'smMd' : 'smReg'}
                        color={isSelected ? colors.white : colors.text.tertiary}
                      >
                        {round}R
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 인증 목록 */}
            {challengerCertificationType === 'image' ? (
              // 사진 인증(그리드 형태)
              <View style={styles.gridContainer}>
                <PhotoCertificationGrid
                  items={mockCertifications}
                  onItemPress={(item) => {
                    // TODO: 인증 상세 화면으로 이동
                  }}
                />
              </View>
            ) : (
              // 글 인증(리스트 형태)
              <TextCertificationList
                items={mockTextCertifications}
                onItemPress={(item) => {
                  // TODO: 인증 상세 화면으로 이동
                }}
              />
            )}
          </ScrollView>
        )}
      </View>
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
    paddingBottom: verticalScale(50),
  },
  gridContainer: {
    paddingBottom: verticalScale(0),
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(12),
    gap: scale(20),
  },
  profileInfo: {
    flex: 1,
  },
  nickname: {
    marginBottom: verticalScale(12),
  },
  statsRow: {
    flexDirection: 'row',
    gap: scale(30),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(24),
    alignItems: 'center',
  },
  sectionDivider: {
    height: verticalScale(8),
    backgroundColor: colors.background,
  },
  // 챌린저 탭 - 원형 그래프 영역
  progressSection: {
    height: verticalScale(368),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
  },
  circularProgressContainer: {
    width: scale(240),
    height: verticalScale(240),
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(32),
  },
  circularProgressSvg: {
    position: 'absolute',
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: scale(16),
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: scale(8),
    alignItems: 'center',
  },
  // 라운드 캐러셀
  roundCarouselContainer: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(28),
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
  roundButtonFirst: {
    borderColor: colors.primary.main,
  },
  roundButtonNotParticipated: {
    borderColor: colors.line,
    opacity: 0.5,
  },
  roundButtonParticipated: {
    borderColor: colors.text.tertiary,
  },
  roundButtonSelected: {
    backgroundColor: colors.primary.main,
    borderWidth: scale(0),
  },
});

