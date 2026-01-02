import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import SubpageHeader from '../components/common/SubpageHeader';
import ViewModeHeader, { ViewMode } from '../components/MyPage/ViewModeHeader';
import { PhotoCertificationGrid } from '../components/common/PhotoCertificationGrid';
import { TextCertificationList, TextCertificationItem } from '../components/common/TextCertificationList';
import { colors } from '../design/tokens';
import { useUserStore } from '../store/userSlice';
import { format } from '../libs/format';

const CertificationHistoryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [certificationViewMode, setCertificationViewMode] = useState<ViewMode>('grid');
  const { myVerificationHistory, fetchMyVerificationHistory } = useUserStore();

  useEffect(() => {
    // Data might already be fetched by MyScreen, but call it here as a fallback.
    if (myVerificationHistory.length === 0) {
      fetchMyVerificationHistory();
    }
  }, [fetchMyVerificationHistory, myVerificationHistory.length]);

  const certificationItems: TextCertificationItem[] = useMemo(() => {
    return myVerificationHistory.map((item) => ({
      id: item.verificationId,
      title: `[${item.challengeTitle}] ${item.title}`,
      description: item.content || '',
      date: format.date(item.verifiedAt),
      thumbnail: { uri: item.photoUrl },
    }));
  }, [myVerificationHistory]);

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
        <PhotoCertificationGrid items={certificationItems} showOverlay={false} />
      ) : (
        <TextCertificationList items={certificationItems} />
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
