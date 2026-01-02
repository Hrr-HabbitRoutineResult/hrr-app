import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import SubpageHeader from '../components/common/SubpageHeader';
import ViewModeHeader, { ViewMode } from '../components/MyPage/ViewModeHeader';
import { PhotoCertificationGrid } from '../components/common/PhotoCertificationGrid';
import { TextCertificationList, TextCertificationItem } from '../components/common/TextCertificationList';
import { colors } from '../design/tokens';

const CertificationHistoryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [certificationViewMode, setCertificationViewMode] = useState<ViewMode>('grid');

  const mockChallengeItems: TextCertificationItem[] = [
    {
      id: 1,
      title: '매일 아침 운동 인증',
      description: '아침 7시 기상 후 헬스장 방문 인증 글입니다.',
      date: '2024.01.15',
      thumbnail: require('../../assets/images/mock-challenge-profile.png'),
    },
    {
      id: 2,
      title: '하루 물 2L 마시기 챌린지',
      description: '깨끗한 물 2리터 마시고 건강해지기!',
      date: '2024.01.14',
      thumbnail: require('../../assets/images/mock-challenge-profile.png'),
    },
    {
      id: 3,
      title: '주 3회 독서 챌린지',
      description: '꾸준히 독서하는 습관을 들여보아요.',
      date: '2024.01.13',
      thumbnail: require('../../assets/images/mock-challenge-profile.png'),
    },
        {
      id: 4,
      title: '매일 아침 운동 인증',
      description: '아침 7시 기상 후 헬스장 방문 인증 글입니다.',
      date: '2024.01.15',
      thumbnail: require('../../assets/images/mock-challenge-profile.png'),
    },
    {
      id: 5,
      title: '하루 물 2L 마시기 챌린지',
      description: '깨끗한 물 2리터 마시고 건강해지기!',
      date: '2024.01.14',
      thumbnail: require('../../assets/images/mock-challenge-profile.png'),
    },
    {
      id: 6,
      title: '주 3회 독서 챌린지',
      description: '꾸준히 독서하는 습관을 들여보아요.',
      date: '2024.01.13',
      thumbnail: require('../../assets/images/mock-challenge-profile.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <SubpageHeader 
        title="인증 기록"
        onBackPress={() => navigation.goBack()}
        useSafeArea
      />
      <ViewModeHeader 
        title="전체 기록"
        initialMode={certificationViewMode}
        onViewModeChange={(mode) => setCertificationViewMode(mode)}
      />
      {certificationViewMode === 'grid' ? (
        <PhotoCertificationGrid items={mockChallengeItems} showOverlay={false} />
      ) : (
        <TextCertificationList items={mockChallengeItems} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default CertificationHistoryScreen;
