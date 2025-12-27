import React, { useState, useEffect } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Header } from '../../components/common/Header';
import { Text } from '../../components/common/Text';
import { TextField } from '../../components/common/TextField';
import { colors } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { getVerificationDetail, VerificationDetailResponse } from '../../libs/api/challenge';
import MoreIcon from '../../../assets/icons/more.svg';
import DefaultProfileIcon from '../../../assets/icons/challenge-profile/default-profile.svg';
import LikeSelectedIcon from '../../../assets/icons/challenge-profile/like-selected.svg';
import LikeUnselectedIcon from '../../../assets/icons/challenge-profile/like-unselected.svg';
import CommentIcon from '../../../assets/icons/comment.svg';
import ScrapIcon from '../../../assets/icons/scrap.svg';
import LockIcon from '../../../assets/icons/lock.svg';
import UnlockIcon from '../../../assets/icons/unlock.svg';
import SendIcon from '../../../assets/icons/send.svg';

type ChallengeCertificationDetailScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeCertificationDetail'>;
type ChallengeCertificationDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeCertificationDetail'
>;

export const ChallengeCertificationDetailScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeCertificationDetailScreenNavigationProp>();
  const route = useRoute<ChallengeCertificationDetailScreenRouteProp>();
  const { verification: initialVerification } = route.params;

  const [verification, setVerification] = useState<VerificationDetailResponse['result'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentPage, setCommentPage] = useState(1);
  const [isCommentLocked, setIsCommentLocked] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchVerificationDetail = async () => {
      try {
        setIsLoading(true);
        const verificationId = initialVerification?.verificationId || route.params.verificationId;
        
        if (!verificationId) {
          Alert.alert('오류', '게시글 정보를 불러올 수 없습니다.');
          navigation.goBack();
          return;
        }

        const result = await getVerificationDetail(verificationId, {
          page: commentPage,
          size: 10,
        });
        
        // photoUrl 끝 슬래시 제거
        if (result.photoUrl && result.photoUrl.endsWith('/')) {
          result.photoUrl = result.photoUrl.slice(0, -1);
        }
        
        setVerification(result);
      } catch (error: any) {
        Alert.alert('오류', error.message || '게시글을 불러오는데 실패했습니다.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationDetail();
  }, [commentPage]);

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  if (isLoading || !verification) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header
          onBack={handleBack}
          title="게시글"
          showDivider={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header
        onBack={handleBack}
        title="게시글"
        showDivider={true}
        rightContent={
          <TouchableOpacity activeOpacity={0.7}>
            <MoreIcon width={20} height={4} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 사용자 정보 */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <DefaultProfileIcon width={40} height={40} />
          </View>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text variant="smMd" color={colors.text.primary}>
                {verification.user.nickname}
              </Text>
              <View style={styles.dot} />
              <Text variant="smReg" color={colors.text.tertiary}>
                챌린저
              </Text>
            </View>
            <View style={styles.timeSpacing} />
            <Text variant="xxs" color={colors.icon.gray}>
              {formatDate(verification.createdAt)}
            </Text>
          </View>
        </View>

        {/* 질문 태그 */}
        {verification.isQuestion && (
          <View style={styles.questionTag}>
            <Text variant="xsMd" color={colors.white}>
              질문
            </Text>
          </View>
        )}

        {/* 제목 */}
        <Text variant="header4" color={colors.text.primary} style={styles.title}>
          {verification.title}
        </Text>

        {/* 내용 */}
        <Text variant="xsReg" color={colors.text.secondary} style={styles.content}>
          {verification.content}
        </Text>

        {/* 이미지 */}
        {verification.photoUrl ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: verification.photoUrl }}
              style={styles.image}
              resizeMode="cover"
              onLoad={() => {
              }}
              onError={(error) => {
              }}
            />
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Text variant="smReg" color={colors.text.tertiary}>
              이미지가 없습니다
            </Text>
          </View>
        )}

        {/* 좋아요, 댓글, 저장 */}
        <View style={styles.engagementSection}>
          <TouchableOpacity 
            style={styles.engagementItem} 
            activeOpacity={0.7}
            onPress={() => setIsLiked(!isLiked)}
          >
            <View style={styles.iconContainer}>
              {isLiked ? (
                <LikeSelectedIcon width={20} height={18} />
              ) : (
                <LikeUnselectedIcon width={20} height={18} />
              )}
            </View>
            <Text variant="xxs" color={colors.text.primary} style={styles.engagementCount}>
              0
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementItem} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <CommentIcon width={18} height={18} />
            </View>
            <Text variant="xxs" color={colors.text.primary} style={styles.engagementCount}>
              0
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementItem} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <ScrapIcon width={14} height={18} />
            </View>
            <Text variant="xxs" color={colors.text.primary} style={styles.engagementCount}>
              0
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 댓글 입력 필드 */}
      <View style={styles.commentInputContainer}>
        <TextField
          variant="default"
          placeholder="댓글을 입력하세요"
          leftIcon={
            <TouchableOpacity
              onPress={() => setIsCommentLocked(!isCommentLocked)}
              activeOpacity={0.7}
            >
              {isCommentLocked ? (
                <LockIcon width={10} height={12} />
              ) : (
                <UnlockIcon width={10} height={12} />
              )}
            </TouchableOpacity>
          }
          onLeftIconPress={() => setIsCommentLocked(!isCommentLocked)}
          rightIcon={
            <View style={styles.sendButton}>
              <SendIcon width={30} height={30} />
            </View>
          }
          onRightIconPress={() => {
            // TODO: 댓글 전송 로직
          }}
          containerStyle={styles.textFieldContainer}
        />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(100),
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  userAvatar: {
    width: scale(40),
    height: verticalScale(40),
    borderRadius: scale(20),
    marginRight: scale(12),
    overflow: 'hidden',
  },
  profileImage: {
    width: scale(40),
    height: verticalScale(40),
    borderRadius: scale(20),
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: scale(2),
    height: verticalScale(2),
    borderRadius: scale(1),
    backgroundColor: colors.text.primary,
    marginHorizontal: scale(4),
  },
  timeSpacing: {
    height: verticalScale(4),
  },
  questionTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.main,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
  },
  title: {
    marginBottom: verticalScale(6),
    lineHeight: verticalScale(20),
  },
  content: {
    marginBottom: verticalScale(16),
    lineHeight: verticalScale(18),
  },
  imageContainer: {
    width: '100%',
    marginBottom: verticalScale(8),
    borderRadius: scale(10),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  engagementSection: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(40),
    height: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  engagementCount: {
    marginLeft: scale(0),
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: verticalScale(0),
    left: scale(0),
    right: scale(0),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  textFieldContainer: {
    marginTop: verticalScale(16),
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
