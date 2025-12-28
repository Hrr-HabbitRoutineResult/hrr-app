import React, { useState, useEffect, useCallback } from 'react';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Header } from '../../components/common/Header';
import { Text } from '../../components/common/Text';
import { TextField } from '../../components/common/TextField';
import { colors, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import {
  getVerificationDetail,
  VerificationDetailResponse,
  updateVerification,
  deleteVerification
} from '../../libs/api/challenge';
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
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);

  const fetchVerificationDetail = useCallback(async () => {
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
  }, [commentPage, initialVerification, route.params.verificationId, navigation]);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchVerificationDetail();
    }, [fetchVerificationDetail])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMorePress = () => {
    setIsActionSheetVisible(true);
  };

  const handleCloseActionSheet = () => {
    setIsActionSheetVisible(false);
  };

  const handleEdit = () => {
    setIsActionSheetVisible(false);

    if (!verification) return;

    // 수정 화면으로 이동
    navigation.navigate('ChallengeCertificationEdit', {
      verification: verification
    });
  };

  const handleDelete = async () => {
    setIsActionSheetVisible(false);

    if (!verification) return;

    Alert.alert(
      '삭제',
      '게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteVerification(verification.verificationId);

              navigation.goBack();

              // Alert는 비동기적으로 표시
              setTimeout(() => {
                Alert.alert('성공', '게시글이 삭제되었습니다.');
              }, 100);
            } catch (error: any) {
              Alert.alert('오류', error.message || '게시글 삭제에 실패했습니다.');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleMorePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
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

      {/* 액션 시트 */}
      <Modal
        visible={isActionSheetVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseActionSheet}
      >
        <Pressable style={styles.actionSheetOverlay} onPress={handleCloseActionSheet}>
          <View style={styles.actionSheetContainer}>
            {/* 수정/삭제 버튼 */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.9}
                onPress={handleEdit}
              >
                <Text variant="md" color={colors.text.primary}>
                  수정
                </Text>
              </TouchableOpacity>

              <View style={styles.actionDivider} />

              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.9}
                onPress={handleDelete}
              >
                <Text variant="md" color={colors.primary.sub}>
                  삭제
                </Text>
              </TouchableOpacity>
            </View>

            {/* 취소 버튼 */}
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.9}
              onPress={handleCloseActionSheet}
            >
              <Text variant="md" color={colors.text.primary}>
                취소
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(32, 32, 32, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: verticalScale(40),
  },
  actionSheetContainer: {
    alignItems: 'center',
  },
  actionButtonsContainer: {
    width: scale(350),
    height: verticalScale(100),
    backgroundColor: colors.white,
    borderRadius: scale(10),
    borderWidth: 1.5,
    borderColor: colors.line,
    marginBottom: verticalScale(12),
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  cancelButton: {
    width: scale(350),
    height: verticalScale(48),
    backgroundColor: colors.white,
    borderRadius: scale(10),
    borderWidth: 1.5,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
