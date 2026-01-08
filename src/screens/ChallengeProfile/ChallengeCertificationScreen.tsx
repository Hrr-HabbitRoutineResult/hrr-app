import React, { useState, useEffect } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
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
import {
  getMyVerifications,
  MyVerificationInfo,
  getVerificationStat,
  VerificationStat,
  getChallengeRounds,
  RoundItem,
  getVerificationFeed,
  VerificationFeedItem,
} from '../../libs/api/challenge';

type ChallengeCertificationScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeCertification'>;
type ChallengeCertificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeCertification'
>;

export const ChallengeCertificationScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeCertificationScreenNavigationProp>();
  const route = useRoute<ChallengeCertificationScreenRouteProp>();
  const { challengeId } = route.params;

  const [activeTab, setActiveTab] = useState<'my' | 'challenger'>('challenger');
  const [roundCarouselScrollX, setRoundCarouselScrollX] = useState(0);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  // 마이 탭 데이터
  const [myData, setMyData] = useState<MyVerificationInfo | null>(null);
  const [isMyLoading, setIsMyLoading] = useState(true);

  // 챌린저 탭 데이터
  const [statData, setStatData] = useState<VerificationStat | null>(null);
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [challengerFeed, setChallengerFeed] = useState<VerificationFeedItem[]>([]);
  const [isChallengerLoading, setIsChallengerLoading] = useState(true);
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  const tabs: TabItem[] = [
    { key: 'my', label: '마이' },
    { key: 'challenger', label: '챌린저' },
  ];

  // 화면이 포커스될 때마다 현재 활성화된 탭의 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      if (activeTab === 'my') {
        fetchMyVerifications();
      } else if (activeTab === 'challenger') {
        fetchChallengerData();
      }
    }, [activeTab])
  );

  // 선택된 라운드 변경 시 피드 로딩
  useEffect(() => {
    if (activeTab === 'challenger' && selectedRound !== null) {
      fetchChallengerFeed(selectedRound);
    }
  }, [selectedRound, activeTab]);

  const fetchMyVerifications = async () => {
    try {
      setIsMyLoading(true);
      const data = await getMyVerifications(challengeId, { page: 1, size: 100 });
      setMyData(data);
    } catch (error: any) {
      Alert.alert('오류', error.message || '내 인증 현황을 불러오는데 실패했습니다.');
    } finally {
      setIsMyLoading(false);
    }
  };

  const fetchChallengerData = async () => {
    try {
      setIsChallengerLoading(true);

      // 통계 정보 조회
      const stat = await getVerificationStat(challengeId);
      setStatData(stat);

      // 라운드 목록 조회
      const roundsList = await getChallengeRounds(challengeId);
      setRounds(roundsList);

      // 현재 라운드를 기본 선택
      const currentRound = roundsList.find(r => r.isCurrentRound);
      let initialRoundNumber: number | null = null;
      if (currentRound) {
        initialRoundNumber = currentRound.roundNumber;
      } else if (roundsList.length > 0) {
        initialRoundNumber = roundsList[0].roundNumber;
      }
      
      setSelectedRound(initialRoundNumber);

      // 라운드가 있으면 해당 라운드의 피드를 즉시 조회
      if (initialRoundNumber !== null) {
        await fetchChallengerFeed(initialRoundNumber);
      } else {
        setChallengerFeed([]);
      }

    } catch (error: any) {
      Alert.alert('오류', error.message || '챌린저 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsChallengerLoading(false);
    }
  };

  const fetchChallengerFeed = async (roundNumber: number) => {
    try {
      setIsFeedLoading(true);
      const feedData = await getVerificationFeed(challengeId, {
        roundNumber,
        page: 1,
        size: 100,
      });
      setChallengerFeed(feedData.content);
    } catch (error: any) {
      Alert.alert('오류', error.message || '인증 피드를 불러오는데 실패했습니다.');
      setChallengerFeed([]);
    } finally {
      setIsFeedLoading(false);
    }
  };

  // 인증 타입 판별 (마이 탭)
  const myCertificationType = myData?.verifications?.content?.length && myData.verifications.content.length > 0
    ? myData.verifications.content[0].type === 'TEXT' ? 'text' : 'image'
    : 'image';

  // 인증 타입 판별 (챌린저 탭)
  const challengerCertificationType = challengerFeed.length > 0
    ? challengerFeed[0].type === 'TEXT' ? 'text' : 'image'
    : 'image';

  // TODO: 참여한 라운드 정보를 알 수 있는 API 필요
  const isParticipated = (round: number) => true; // 임시로 모든 라운드 참여 가능
  const isFirstRound = (round: RoundItem) => round.isCurrentRound;

  const handleRoundPress = (round: number) => {
    // 이미 선택된 라운드를 다시 클릭하면 현재 라운드로 이동
    const currentRound = rounds.find(r => r.isCurrentRound);
    if (selectedRound === round && currentRound) {
      setSelectedRound(currentRound.roundNumber);
    } else {
      setSelectedRound(round);
    }
  };

  // 통계 계산
  const completedCount = statData?.certifiedCount || 0;
  const totalCount = statData?.totalParticipantCount || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
          onTabChange={(key) => setActiveTab(key as 'my' | 'challenger')}
        />

        {activeTab === 'my' ? (
          isMyLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
          ) : myData ? (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {/* 프로필 영역 */}
              <View style={styles.profileSection}>
                <DefaultProfileIcon width={100} height={100} />
                <View style={styles.profileInfo}>
                  <Text variant="header2" color={colors.text.primary} style={styles.nickname}>
                    {myData.nickname}
                  </Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text variant="xsReg" color={colors.text.tertiary}>
                        인증
                      </Text>
                      <Text variant="xsMd" color={colors.text.primary}>
                        {myData.totalVerificationCount}회
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text variant="xsReg" color={colors.text.tertiary}>
                        경고
                      </Text>
                      <Text variant="xsMd" color={colors.text.primary}>
                        {myData.warningCount}회
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* 진행 중 버튼 */}
              <View style={styles.buttonContainer}>
                <Button variant="black" size="medium" onPress={() => { }}>
                  {`${myData.currentRoundSequence}R째 진행 중`}
                </Button>
              </View>

              {/* 구분선 */}
              <View style={styles.sectionDivider} />

              {/* 인증 목록 */}
              {myData.verifications.content.length > 0 ? (
                myCertificationType === 'text' ? (
                  // 글 인증(리스트 형태)
                  <TextCertificationList
                    items={myData.verifications.content.map(item => ({
                      id: item.verificationId,
                      title: item.title,
                      description: item.content,
                      date: item.createdDate,
                      thumbnail: item.imageUrl
                        ? { uri: item.imageUrl }
                        : require('../../../assets/images/mock-challenge-profile.png'),
                      hasLink: item.hasLink,
                      isQuestion: item.isQuestion,
                      isResolved: item.isResolved,
                    }))}
                    onItemPress={(item) => {
                      navigation.navigate('ChallengeCertificationDetail', {
                        verificationId: item.id,
                      });
                    }}
                  />
                ) : (
                  // 사진 인증(그리드 형태)
                  <View style={styles.gridContainer}>
                    <PhotoCertificationGrid
                      items={myData.verifications.content.map(item => ({
                        id: item.verificationId,
                        thumbnail: { uri: item.imageUrl },
                        isQuestion: item.isQuestion,
                        isResolved: item.isResolved,
                      }))}
                      onItemPress={(item) => {
                        navigation.navigate('ChallengeCertificationDetail', {
                          verificationId: item.id,
                        });
                      }}
                    />
                  </View>
                )
              ) : (
                <View style={styles.emptyContainer}>
                  <Text variant="xsReg" color={colors.text.tertiary}>
                    아직 인증 게시글이 없습니다.
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : null
        ) : (
          isChallengerLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
          ) : statData ? (
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
                  {rounds.map((round) => {
                    const participated = isParticipated(round.roundNumber);
                    const isFirst = isFirstRound(round);
                    const isSelected = selectedRound === round.roundNumber;

                    // 참여하지 않은 라운드는 클릭 불가
                    if (!participated) {
                      return (
                        <View
                          key={round.roundNumber}
                          style={[styles.roundButton, styles.roundButtonNotParticipated]}
                        >
                          <Text variant="smReg" color={colors.button}>
                            {round.roundNumber}R
                          </Text>
                        </View>
                      );
                    }

                    // 맨 앞 라운드 (현재 진행 중인 라운드)
                    if (isFirst) {
                      return (
                        <TouchableOpacity
                          key={round.roundNumber}
                          style={[
                            styles.roundButton,
                            styles.roundButtonFirst,
                          ]}
                          onPress={() => handleRoundPress(round.roundNumber)}
                          activeOpacity={0.7}
                        >
                          <Text variant="smReg" color={colors.primary.main}>
                            {round.roundNumber}R
                          </Text>
                        </TouchableOpacity>
                      );
                    }

                    // 참여한 라운드 (선택 가능)
                    return (
                      <TouchableOpacity
                        key={round.roundNumber}
                        style={[
                          styles.roundButton,
                          isSelected ? styles.roundButtonSelected : styles.roundButtonParticipated,
                        ]}
                        onPress={() => handleRoundPress(round.roundNumber)}
                        activeOpacity={0.7}
                      >
                        <Text
                          variant={isSelected ? 'smMd' : 'smReg'}
                          color={isSelected ? colors.white : colors.text.tertiary}
                        >
                          {round.roundNumber}R
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 인증 목록 */}
              {isFeedLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary.main} />
                </View>
              ) : challengerFeed.length > 0 ? (
                challengerCertificationType === 'text' ? (
                  // 글 인증(리스트 형태)
                  <TextCertificationList
                    items={challengerFeed.map(item => ({
                      id: item.verificationId,
                      title: item.title,
                      description: item.content,
                      date: item.createdDate,
                      thumbnail: item.imageUrl
                        ? { uri: item.imageUrl }
                        : require('../../../assets/images/mock-challenge-profile.png'),
                      hasLink: item.hasLink,
                      isQuestion: item.isQuestion,
                      isResolved: item.isResolved,
                    }))}
                    onItemPress={(item) => {
                      navigation.navigate('ChallengeCertificationDetail', {
                        verificationId: item.id,
                      });
                    }}
                  />
                ) : (
                  // 사진 인증(그리드 형태)
                  <View style={styles.gridContainer}>
                    <PhotoCertificationGrid
                      items={challengerFeed.map(item => ({
                        id: item.verificationId,
                        thumbnail: { uri: item.imageUrl },
                        isQuestion: item.isQuestion,
                        isResolved: item.isResolved,
                      }))}
                      onItemPress={(item) => {
                        navigation.navigate('ChallengeCertificationDetail', {
                          verificationId: item.id,
                        });
                      }}
                    />
                  </View>
                )
              ) : (
                <View style={styles.emptyContainer}>
                  <Text variant="xsReg" color={colors.text.tertiary}>
                    아직 인증 게시글이 없습니다.
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : null
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: verticalScale(60),
    alignItems: 'center',
    justifyContent: 'center',
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

