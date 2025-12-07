import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { colors } from '../../design/tokens';
import ChevronRightIcon from '../../../assets/icons/chevron-right-ic-grey.svg';
import ChevronRightSubIcon from '../../../assets/icons/chevron-right-sub.svg';

type CreateChallengeQ3NavigationProp = StackNavigationProp<RootStackParamList>;

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const CreateChallengeQ3 = () => {
  const navigation = useNavigation<CreateChallengeQ3NavigationProp>();

  // 현재 날짜 기준 달력 상태
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 달력 데이터 생성
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 이번 달 1일의 요일 (0: 일요일 ~ 6: 토요일)
    const firstDay = new Date(year, month, 1).getDay();

    // 이번 달 마지막 날짜
    const lastDate = new Date(year, month + 1, 0).getDate();

    // 날짜 배열 생성 (이전 달 빈칸 + 이번 달 날짜)
    const days: (number | null)[] = [];

    // 이전 달 빈칸 채우기
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 이번 달 날짜 채우기
    for (let i = 1; i <= lastDate; i++) {
      days.push(i);
    }

    return days;
  }, [currentDate]);

  const handlePrevMonth = () => {
    // 오늘 날짜 이전 달로는 이동 불가
    if (currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
      return;
    }
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    // 오늘 이전 날짜 선택 불가
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (newSelectedDate < startOfToday) {
      return;
    }

    // 이미 선택된 날짜를 다시 누르면 선택 해제
    if (selectedDate) {
      const selectedTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
      const newTime = newSelectedDate.getTime();
      if (selectedTime === newTime) {
        setSelectedDate(null);
        return;
      }
    }

    setSelectedDate(newSelectedDate);
  };

  const isNextEnabled = selectedDate !== null;

  const handleNext = () => {
    if (isNextEnabled) {
      navigation.navigate('CreateChallengeQ4');
    }
  };

  // 날짜 렌더링 헬퍼
  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isPast = date < startOfToday;

    // 선택된 날짜 (시작일)
    const isSelected = selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();

    // 3주 챌린지 기간 계산
    let isInPeriod = false;
    let isPeriodEnd = false;

    if (selectedDate) {
      const endDate = new Date(selectedDate);
      endDate.setDate(selectedDate.getDate() + 20); // 선택일 + 20일

      // 날짜 비교를 위해 시간 제거 (안전장치)
      const dTime = date.getTime();
      const sTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
      const eTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();

      isInPeriod = dTime >= sTime && dTime <= eTime;
      isPeriodEnd = dTime === eTime;
    }

    // 주 단위 끊김 처리
    const isWeekStart = index % 7 === 0;
    const isWeekEnd = index % 7 === 6;

    // 배경 막대 표시 여부
    // 왼쪽 연결: 기간 내이면서, 시작일이 아니고, 주의 시작이 아닐 때
    const showLeftBar = isInPeriod && !isSelected && !isWeekStart;
    // 오른쪽 연결: 기간 내이면서, 종료일이 아니고, 주의 끝이 아닐 때
    const showRightBar = isInPeriod && !isPeriodEnd && !isWeekEnd;

    // 원형 배경 표시 여부 (시작일, 종료일, 혹은 줄바꿈된 양 끝)
    // 시작일은 진한 원, 나머지는 연한 원
    const showLightCircle = isInPeriod && !isSelected && (isPeriodEnd || isWeekStart || isWeekEnd);

    return (
      <TouchableOpacity
        key={`day-${day}`}
        style={styles.dayCell}
        onPress={() => !isPast && handleDateSelect(day)}
        activeOpacity={isPast ? 1 : 0.7}
        disabled={isPast}
      >
        {/* 배경 막대들 */}
        {showLeftBar && <View style={styles.rangeBarLeft} />}
        {showRightBar && <View style={styles.rangeBarRight} />}

        {/* 원형 배경 (연한색 - 종료일/줄바꿈끝 등) */}
        {showLightCircle && <View style={styles.lightCircle} />}

        {/* 숫자 컨테이너 (선택된 날짜는 진한색 원형) */}
        <View style={[
          styles.dayNumberContainer,
          isSelected && styles.dayNumberSelected,
        ]}>
          <Text
            variant="md"
            color={
              isSelected
                ? colors.white
                : isPast
                  ? colors.icon.gray
                  : colors.text.primary
            }
          >
            {day}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 이전 달 이동 가능 여부 (현재 달이 오늘 달이면 불가능)
  const canGoPrev = currentDate.getTime() > new Date(today.getFullYear(), today.getMonth(), 1).getTime();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        title="챌린지 개설"
      />
      <ProgressBar currentStep={3} totalSteps={4} />

      <View style={styles.content}>
        <Text variant="header1" color={colors.text.primary} style={styles.title}>
          챌린지 시작일을 지정해 주세요
        </Text>

        <View style={styles.calendarContainer}>
          {/* 달력 헤더 (년월 이동) */}
          <View style={styles.calendarHeader}>
            <Text variant="header2" color={colors.text.secondary}>
              {currentDate.getFullYear()}년 {String(currentDate.getMonth() + 1).padStart(2, '0')}월
            </Text>
            <View style={styles.monthControls}>
              <TouchableOpacity onPress={handlePrevMonth} disabled={!canGoPrev} style={styles.arrowButton}>
                <View style={{ transform: [{ rotate: '180deg' }] }}>
                  {canGoPrev ? (
                    <ChevronRightSubIcon width={7} height={14} />
                  ) : (
                    <ChevronRightIcon width={7} height={14} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
                <ChevronRightSubIcon width={7} height={14} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 요일 헤더 */}
          <View style={styles.weekHeader}>
            {DAYS.map((day) => (
              <View key={day} style={styles.weekDayCell}>
                <Text variant="xsReg" color={colors.text.tertiary}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* 날짜 그리드 */}
          <View style={styles.daysGrid}>
            {calendarData.map((day, index) => renderDay(day, index))}
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant={isNextEnabled ? 'black' : 'gray'}
          size="medium"
          onPress={handleNext}
          disabled={!isNextEnabled}
        >
          다음
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    marginBottom: 46,
  },
  calendarContainer: {
    width: '100%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    paddingLeft: 12,
  },
  monthControls: {
    flexDirection: 'row',
    gap: 16,
  },
  arrowButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekDayCell: {
    marginTop: 10,
    width: '14.28%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayNumberContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    zIndex: 2,
  },
  dayNumberSelected: {
    backgroundColor: colors.primary.main,
  },
  // 배경 막대
  rangeBarLeft: {
    position: 'absolute',
    left: 0,
    width: '50%',
    height: 40,
    backgroundColor: colors.primary.lightest,
    zIndex: 1,
  },
  rangeBarRight: {
    position: 'absolute',
    right: 0,
    width: '50%',
    height: 40,
    backgroundColor: colors.primary.lightest,
    zIndex: 1,
  },
  lightCircle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.lightest,
    zIndex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
