import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import ViewModeHeader, { ViewMode } from '../components/MyPage/ViewModeHeader';
import { PhotoCertificationGrid } from '../components/common/PhotoCertificationGrid';
import { TextCertificationList, TextCertificationItem } from '../components/common/TextCertificationList';
import { colors, spacing, typography } from '../design/tokens';
import { useUserStore } from '../store/userSlice';
import { format } from '../libs/format';
import { getVerificationHistoryById, VerificationHistoryItem } from '../libs/api/user';

type CertificationHistoryScreenRouteProp = RouteProp<RootStackParamList, 'CertificationHistory'>;

const CertificationHistoryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<CertificationHistoryScreenRouteProp>();
  const userId = route.params?.userId;
  const isMe = !userId;

  const [certificationViewMode, setCertificationViewMode] = useState<ViewMode>('grid');
  
  // State for other user's data
  const [otherUserHistory, setOtherUserHistory] = useState<VerificationHistoryItem[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Global state for logged-in user
  const { myVerificationHistory, fetchMyVerificationHistory } = useUserStore();

  useFocusEffect(
    useCallback(() => {
      if (isMe) {
        if (myVerificationHistory.length === 0) {
          fetchMyVerificationHistory();
        }
      } else {
        const fetchOtherUserHistory = async () => {
          setIsLoading(true);
          try {
            const result = await getVerificationHistoryById(userId);
            setIsPublic(result.isPublic);
            if(result.isPublic) {
                setOtherUserHistory(result.verifications.content);
            }
          } catch (error) {
            // Handle error
          } finally {
            setIsLoading(false);
          }
        };
        fetchOtherUserHistory();
      }
    }, [isMe, userId, fetchMyVerificationHistory, myVerificationHistory.length])
  );
  
  const historySource = isMe ? myVerificationHistory : otherUserHistory;

  const certificationItems: TextCertificationItem[] = useMemo(() => {
    return (historySource || []).map((item) => ({
      id: item.verificationId,
      title: `[${item.challengeTitle}] ${item.title}`,
      description: item.content || '',
      date: format.date(item.verifiedAt),
      thumbnail: { uri: item.photoUrl },
    }));
  }, [historySource]);

  const renderContent = () => {
    if (isLoading) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator />
            </View>
        )
    }

    if (!isMe && !isPublic) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>비공개 프로필입니다.</Text>
            </View>
        );
    }

    if (certificationItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>인증 기록이 없습니다</Text>
            </View>
        );
    }

    return certificationViewMode === 'grid' ? (
        <PhotoCertificationGrid items={certificationItems} showOverlay={false} containerPadding={spacing.md} />
      ) : (
        <TextCertificationList items={certificationItems} containerPadding={spacing.md} />
      );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="인증 기록"
        onBack={() => navigation.goBack()}
        useSafeArea
      />
      <ViewModeHeader 
        title="전체 기록"
        initialMode={certificationViewMode}
        onViewModeChange={(mode) => setCertificationViewMode(mode)}
      />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.md,
    color: colors.text.secondary,
  },
});

export default CertificationHistoryScreen;
