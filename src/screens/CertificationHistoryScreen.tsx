import React, { useState, useMemo, useCallback } from 'react';
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
import { scale, verticalScale } from '../utils/scaling';

type CertificationHistoryScreenRouteProp = RouteProp<RootStackParamList, 'CertificationHistory'>;

const CertificationHistoryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<CertificationHistoryScreenRouteProp>();
  const userId = route.params?.userId;
  const isMe = !userId;

  const [certificationViewMode, setCertificationViewMode] = useState<ViewMode>('grid');

  // State for other user's data
  const [otherUserHistory, setOtherUserHistory] = useState<VerificationHistoryItem[]>([]);
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
            // isPublic 체크 없이 모든 인증 기록을 표시합니다.
            if (result.verifications) {
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
      title: item.title,
      description: item.content || '',
      date: format.date(item.verifiedAt),
      thumbnail: item.photoUrl ? { uri: item.photoUrl } : null,
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

    if (certificationItems.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>인증 기록이 없습니다</Text>
        </View>
      );
    }

    return (
      <View style={styles.listWrapper}>
        {certificationViewMode === 'grid' ? (
          <View style={styles.photoGridContainer}>
            <PhotoCertificationGrid
              items={certificationItems}
              showOverlay={false}
              containerPadding={0}
              onItemPress={(item) =>
                navigation.navigate('ChallengeCertificationDetail', {
                  verificationId: item.id,
                })
              }
            />
          </View>
        ) : (
          <TextCertificationList
            items={certificationItems}
            containerPadding={0}
            onItemPress={(item) =>
              navigation.navigate('ChallengeCertificationDetail', {
                verificationId: item.id,
              })
            }
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="인증 기록"
        onBack={() => navigation.goBack()}
        useSafeArea
        showDivider
      />
      <View style={styles.contentWrapper}>
        <ViewModeHeader
          title="전체 기록"
          initialMode={certificationViewMode}
          onViewModeChange={(mode) => setCertificationViewMode(mode)}
        />
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentWrapper: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(14),
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: scale(20),
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
  photoGridContainer: {
    marginHorizontal: -scale(20),
  },
});

export default CertificationHistoryScreen;
