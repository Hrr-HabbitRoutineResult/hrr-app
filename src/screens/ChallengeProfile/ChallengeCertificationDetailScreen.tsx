import React, { useState, useEffect, useCallback, useRef } from 'react';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import { getErrorMessage, getErrorInfo } from '../../utils/errorHandler';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Pressable, KeyboardAvoidingView, Platform, Keyboard, TextInput, Dimensions, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ImageViewer from 'react-native-image-zoom-viewer';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Text } from '../../components/common/Text';
import { TextField } from '../../components/common/TextField';
import { CommentItem } from '../../components/challenge/CommentItem';
import { BottomSheet } from '../../components/common/BottomSheet';
import { ReportBottomSheet } from '../../components/common/ReportBottomSheet';
import { ActionSheet, ActionSheetItem } from '../../components/common/ActionSheet';
import { colors, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { useUserStore } from '../../store/userSlice';
import {
  getVerificationDetail,
  VerificationDetailResponse,
  updateVerification,
  deleteVerification,
  getComments,
  createComment,
  deleteComment,
  adoptComment,
  blockComment,
  CommentItem as CommentItemType,
  GetCommentsResponse,
  reportVerificationPost,
  reportUser,
  reportWeakVerification,
  ReportReason
} from '../../libs/api/challenge';
import { format } from '../../libs/format';
import { getS3ImageUrl } from '../../libs/s3';
import MoreIcon from '../../../assets/icons/more.svg';
import DefaultProfileIcon from '../../../assets/icons/challenge-profile/default-profile.svg';
import LikeSelectedIcon from '../../../assets/icons/challenge-profile/like-selected.svg';
import LikeUnselectedIcon from '../../../assets/icons/challenge-profile/like-unselected.svg';
import CommentIcon from '../../../assets/icons/comment.svg';
import ScrapIcon from '../../../assets/icons/scrap.svg';
import LockIcon from '../../../assets/icons/lock.svg';
import UnlockIcon from '../../../assets/icons/unlock.svg';
import SendIcon from '../../../assets/icons/send.svg';
import ChevronDownIcon from '../../../assets/icons/chevron-down-text-primary.svg';
import DeleteViewerIcon from '../../../assets/icons/challenge-profile/delete-viewer.svg';
import RefreshableScrollView from '../../components/common/RefreshableScrollView';
type ChallengeCertificationDetailScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeCertificationDetail'>;
type ChallengeCertificationDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeCertificationDetail'
>;

// 플랫폼별 키보드 오프셋
const KEYBOARD_OFFSET_IOS = 0;

export const ChallengeCertificationDetailScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeCertificationDetailScreenNavigationProp>();
  const route = useRoute<ChallengeCertificationDetailScreenRouteProp>();
  const { verification: initialVerification } = route.params;
  const insets = useSafeAreaInsets();
  const { userInfo } = useUserStore();

  const commentInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const commentYPositions = useRef<Record<string | number, number>>({});

  const [verification, setVerification] = useState<VerificationDetailResponse['result'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentPage, setCommentPage] = useState(1);
  const [isCommentLocked, setIsCommentLocked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Android 시스템 네비게이션 바로 인한 높이 조정
  const commentInputBottomPadding = Platform.OS === 'android'
    ? verticalScale(36) - insets.bottom
    : verticalScale(36);

  // 댓글 관련 state
  const [comments, setComments] = useState<GetCommentsResponse['result'] | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyToComment, setReplyToComment] = useState<CommentItemType | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [openMenuCommentId, setOpenMenuCommentId] = useState<number | null>(null);
  const [isAdoptBottomSheetVisible, setIsAdoptBottomSheetVisible] = useState(false);
  const [selectedCommentForAdopt, setSelectedCommentForAdopt] = useState<number | null>(null);

  // 신고 관련 state
  const [isReportPostBottomSheetVisible, setIsReportPostBottomSheetVisible] = useState(false);
  const [isReportUserBottomSheetVisible, setIsReportUserBottomSheetVisible] = useState(false);

  // 이미지 뷰어 관련 state
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

      // textImages 배열 끝 슬래시 제거
      if (result.textImages && Array.isArray(result.textImages)) {
        result.textImages = result.textImages.map(url =>
          url.endsWith('/') ? url.slice(0, -1) : url
        );
      }

      setVerification(result);

      // 댓글 조회 (모든 페이지)
      let allComments: CommentItemType[] = [];
      let allAdoptedChildren: CommentItemType[] = [];
      let adoptedParent: CommentItemType | null = null;
      let currentPage = 1;
      let isLastPage = false;
      let commentsResult: GetCommentsResponse['result'];

      // 모든 페이지 순회
      do {
        const pageResult = await getComments(verificationId, {
          page: currentPage,
          size: 10,
        });

        // 첫 페이지 결과 저장 (메타데이터용)
        if (currentPage === 1) {
          commentsResult = pageResult;
        }

        // adoptedParent는 null이 아닌 첫 번째 것을 사용
        if (pageResult.adoptedParent && !adoptedParent) {
          adoptedParent = pageResult.adoptedParent;
        }

        // adoptedChildren 수집 (중복 제거)
        if (pageResult.adoptedChildren && pageResult.adoptedChildren.length > 0) {
          pageResult.adoptedChildren.forEach(child => {
            if (!allAdoptedChildren.find(c => c.commentId === child.commentId)) {
              allAdoptedChildren.push(child);
            }
          });
        }

        // 일반 댓글 수집
        allComments = [...allComments, ...pageResult.comments];

        isLastPage = pageResult.last;
        currentPage++;
      } while (!isLastPage);

      // 최종 결과 설정
      commentsResult = {
        ...commentsResult!,
        adoptedParent,
        adoptedChildren: allAdoptedChildren,
        comments: allComments,
        last: true,
      };

      setComments(commentsResult);

      // 채택된 댓글이 있는 부모 댓글을 찾아서 기본적으로 펼쳐진 상태로 설정
      const allCommentsForExpanded = [
        ...(commentsResult.adoptedParent ? [commentsResult.adoptedParent] : []),
        ...commentsResult.adoptedChildren,
        ...commentsResult.comments,
      ];

      const parentComments = allCommentsForExpanded.filter(c => c.depth === 0);
      const childComments = allCommentsForExpanded.filter(c => c.depth > 0);

      parentComments.forEach(parent => {
        const children = childComments.filter(child => child.parentId === parent.commentId);
        // 부모가 채택되었거나 자식 중에 채택된 댓글이 있으면 펼침
        if (parent.adopted || children.some(child => child.adopted)) {
          setExpandedComments(prev => {
            const newSet = new Set(prev);
            newSet.add(parent.commentId);
            return newSet;
          });
        }
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, '게시글을 불러오는데 실패했습니다.');
      Alert.alert('오류', errorMessage);
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

  // 키보드 이벤트 리스너
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  // 프로필 클릭 핸들러 -> 본인이면 My, 다른 유저면 User 화면으로 이동
  const handleProfilePress = (userId: number) => {
    if (userInfo?.userId === userId) {
      navigation.navigate('HomeTabs', { screen: '마이' });
    } else {
      navigation.navigate('User', { userId });
    }
  };

  const handleMorePress = () => {
    setIsActionSheetVisible(true);
  };

  const handleEdit = () => {
    if (!verification) return;

    // 타입에 따라 다른 수정 화면으로 이동
    if (verification.type === 'TEXT') {
      navigation.navigate('ChallengeCertificationTextEdit', {
        verification: verification
      });
    } else {
      navigation.navigate('ChallengeCertificationEdit', {
        verification: verification
      });
    }
  };

  const handleDelete = async () => {
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
              const errorMessage = getErrorMessage(error, '게시글 삭제에 실패했습니다.');
              Alert.alert('오류', errorMessage);
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  // 부실인증 신고하기
  const handleReportPoorVerification = async () => {
    if (!verification) return;

    Alert.alert(
      '부실인증 신고',
      '해당 게시글을 부실인증으로 신고하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '신고',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportWeakVerification(verification.verificationId);
              Alert.alert('신고 완료', '신고가 접수되었습니다.');
            } catch (error: any) {
              const { title, message } = getErrorInfo(error, '신고에 실패했습니다.');
              Alert.alert(title, message);
            }
          }
        },
      ]
    );
  };

  // 게시글 신고하기
  const handleReportPost = () => {
    setIsReportPostBottomSheetVisible(true);
  };

  // 사용자 신고하기
  const handleReportUser = () => {
    setIsReportUserBottomSheetVisible(true);
  };

  // 게시글 신고 제출
  const handleSubmitReportPost = async (reason: ReportReason, description: string) => {
    if (!verification) return;

    try {
      await reportVerificationPost({
        targetId: verification.verificationId,
        reason: reason,
        description: description
      });

      setIsReportPostBottomSheetVisible(false);
      Alert.alert('신고 완료', '신고가 접수되었습니다.');
    } catch (error: any) {
      const { title, message } = getErrorInfo(error, '신고에 실패했습니다.');
      Alert.alert(title, message);
    }
  };

  // 사용자 신고 제출
  const handleSubmitReportUser = async (reason: ReportReason, description: string) => {
    if (!verification) return;

    try {
      await reportUser({
        targetId: verification.user.userId,
        reason: reason,
        description: description
      });

      setIsReportUserBottomSheetVisible(false);
      Alert.alert('신고 완료', '신고가 접수되었습니다.');
    } catch (error: any) {
      const { title, message } = getErrorInfo(error, '신고에 실패했습니다.');
      Alert.alert(title, message);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!verification || !commentText.trim()) return;

    try {
      setIsSubmittingComment(true);

      const parentId = replyToComment?.commentId;

      // 댓글 작성
      await createComment(verification.verificationId, {
        content: commentText.trim(),
        anonymous: isCommentLocked,
        parentId: parentId,
      });

      // 댓글 입력창 초기화
      setCommentText('');

      // 답글을 작성한 경우 해당 부모 댓글을 펼침
      if (replyToComment) {
        setExpandedComments(prev => {
          const newSet = new Set(prev);
          newSet.add(replyToComment.commentId);
          return newSet;
        });
      }

      setReplyToComment(null);

      // 키보드 닫기
      Keyboard.dismiss();

      // 댓글 목록 새로고침
      const commentsResult = await getComments(verification.verificationId, {
        page: 1,
        size: 10,
      });
      setComments(commentsResult);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, '댓글 작성에 실패했습니다.');
      Alert.alert('오류', errorMessage);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 답글 작성 시작
  const handleReplyToComment = (comment: CommentItemType) => {
    setReplyToComment(comment);

    // 해당 댓글로 스크롤
    const commentY = commentYPositions.current[comment.commentId];
    if (commentY !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: Math.max(0, commentY - verticalScale(20)),
        animated: true,
      });
    }

    // 입력창에 포커스 (키보드 올라옴)
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 300);
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!verification) return;

    try {
      await deleteComment(commentId);

      // 댓글 목록 새로고침
      const commentsResult = await getComments(verification.verificationId, {
        page: 1,
        size: 10,
      });
      setComments(commentsResult);

      // 답글이 0개가 된 부모 댓글은 자동으로 접기
      const allComments = [
        ...(commentsResult.adoptedParent ? [commentsResult.adoptedParent] : []),
        ...commentsResult.adoptedChildren,
        ...commentsResult.comments,
      ];

      const parentComments = allComments.filter(c => c.depth === 0);
      const childComments = allComments.filter(c => c.depth > 0);

      setExpandedComments(prev => {
        const newSet = new Set(prev);
        parentComments.forEach(parent => {
          const children = childComments.filter(child => child.parentId === parent.commentId);
          if (children.length === 0 && newSet.has(parent.commentId)) {
            newSet.delete(parent.commentId);
          }
        });
        return newSet;
      });

      Alert.alert('성공', '댓글이 삭제되었습니다.');
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, '댓글 삭제에 실패했습니다.');
      Alert.alert('오류', errorMessage);
    }
  };

  // 댓글 채택 (바텀시트 열기)
  const handleAdoptComment = (commentId: number) => {
    setSelectedCommentForAdopt(commentId);
    setIsAdoptBottomSheetVisible(true);
  };

  // 댓글 채택 확인
  const confirmAdoptComment = async () => {
    if (!verification || !selectedCommentForAdopt) return;

    try {
      await adoptComment(verification.verificationId, selectedCommentForAdopt);

      // 바텀시트 닫기
      setIsAdoptBottomSheetVisible(false);
      setSelectedCommentForAdopt(null);

      // 게시글 정보 다시 조회 (isResolved 업데이트)
      await fetchVerificationDetail();

      Alert.alert('성공', '댓글이 채택되었습니다.');
    } catch (error: any) {
      // 바텀시트 닫기
      setIsAdoptBottomSheetVisible(false);
      setSelectedCommentForAdopt(null);

      const errorMessage = getErrorMessage(error, '댓글 채택에 실패했습니다.');

      Alert.alert('오류', errorMessage);
    }
  };

  // 댓글 작성자 차단
  const handleBlockUser = async (commentId: number) => {
    try {
      await blockComment(commentId);

      Alert.alert('차단 완료', '해당 사용자가 차단되었습니다.');

      // 댓글 목록 새로고침 (차단된 사용자 댓글이 마스킹 처리됨)
      if (verification) {
        const commentsResult = await getComments(verification.verificationId, {
          page: 1,
          size: 10,
        });
        setComments(commentsResult);
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, '사용자 차단에 실패했습니다.');
      Alert.alert('오류', errorMessage);
    }
  };

  // 답글 펼치기/접기 토글
  const toggleRepliesExpand = (commentId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // 댓글 메뉴 토글
  const handleMenuToggle = (commentId: number) => {
    setOpenMenuCommentId(prev => prev === commentId ? null : commentId);
  };

  // 댓글 목록을 부모-자식 구조로 정리
  const getCommentTree = () => {
    if (!comments) return [];

    // 모든 댓글 합치기
    const allComments = [
      ...(comments.adoptedParent ? [comments.adoptedParent] : []),
      ...comments.adoptedChildren,
      ...comments.comments,
    ];

    const parentComments = allComments.filter(c => c.depth === 0);
    const childComments = allComments.filter(c => c.depth > 0);

    // 부모 댓글을 시간순으로 정렬
    const sortedParents = parentComments.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return sortedParents.map(parent => ({
      parent,
      children: childComments.filter(child => child.parentId === parent.commentId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }));
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

  // 액션 시트 아이템 구성
  const actionSheetItems: ActionSheetItem[] = verification.isMine
    ? [
      {
        label: '수정',
        onPress: handleEdit,
      },
      {
        label: '삭제',
        onPress: handleDelete,
        destructive: true,
      },
    ]
    : [
      {
        label: '부실인증 신고하기',
        onPress: handleReportPoorVerification,
        destructive: true,
      },
      {
        label: '게시글 신고하기',
        onPress: handleReportPost,
        destructive: true,
      },
      {
        label: '사용자 신고하기',
        onPress: handleReportUser,
        destructive: true,
      },
    ];

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

      <RefreshableScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isKeyboardVisible && {
            paddingBottom: keyboardHeight + verticalScale(80), // 키보드 높이 + 댓글 입력창 높이
          }
        ]}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchVerificationDetail}
      >
        {/* 사용자 정보 */}
        <TouchableOpacity
          style={styles.userSection}
          onPress={() => handleProfilePress(verification.user.userId)}
          activeOpacity={0.7}
        >
          <View style={styles.userAvatar}>
            {getS3ImageUrl(verification.user.profileImageUrl) ? (
              <Image
                source={{ uri: getS3ImageUrl(verification.user.profileImageUrl)! }}
                style={styles.profileImage}
              />
            ) : (
              <DefaultProfileIcon width={40} height={40} />
            )}
          </View>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text variant="smMd" color={colors.text.primary}>
                {verification.user.nickname}
              </Text>
              <View style={styles.dot} />
              <Text variant="smReg" color={colors.text.tertiary}>
                {format.level(verification.user.level)}
              </Text>
            </View>
            <View style={styles.timeSpacing} />
            <Text variant="xxs" color={colors.icon.gray}>
              {formatDate(verification.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 질문 태그 */}
        {verification.isQuestion && (
          <View style={[
            styles.questionTag,
            verification.isResolved && styles.resolvedTag
          ]}>
            <Text variant="xsMd" color={colors.white}>
              {verification.isResolved ? '채택' : '질문'}
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
        {(() => {
          // 사진 인증 게시물의 경우 photoUrl, 텍스트 인증 게시물의 경우 textImages 사용
          const images = verification.type === 'TEXT'
            ? (verification.textImages || [])
            : (verification.photoUrl ? [verification.photoUrl] : []);

          if (images.length === 0) return null;

          return (
            <View style={styles.imagesContainer}>
              {images.map((imageUrl, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedImageIndex(index);
                    setCurrentImageIndex(index);
                    setIsImageViewerVisible(true);
                  }}
                  style={styles.imageContainer}
                >
                  <Image
                    source={{ uri: imageUrl as string }}
                    style={styles.image}
                    resizeMode="cover"
                    onLoad={() => { }}
                    onError={(error) => { }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          );
        })()}

        {/* 링크 */}
        {verification.textUrl && (
          <TouchableOpacity
            style={styles.linkBox}
            onPress={() => {
              Linking.canOpenURL(verification.textUrl).then(supported => {
                if (supported) {
                  Linking.openURL(verification.textUrl);
                }
              });
            }}
            activeOpacity={0.7}
          >
            <Text variant="smReg" color={colors.text.secondary} numberOfLines={1} style={styles.linkText}>
              {verification.textUrl}
            </Text>
          </TouchableOpacity>
        )}

        {/* 좋아요, 댓글, 스크랩 */}
        <View style={[
          styles.engagementSection,
          !(comments && (comments.adoptedParent || comments.comments.length > 0)) && styles.engagementSectionNoComments
        ]}>
          {/* 런칭 시 좋아요 기능 제외 */}
          {/* <View style={styles.engagementItem}>
            <TouchableOpacity
              style={styles.iconContainer}
              activeOpacity={0.7}
              onPress={() => setIsLiked(!isLiked)}
            >
              {isLiked ? (
                <LikeSelectedIcon width={20} height={18} />
              ) : (
                <LikeUnselectedIcon width={20} height={18} />
              )}
            </TouchableOpacity>
            <Text variant="xxs" color={colors.text.primary} style={styles.engagementCount}>
              0
            </Text>
          </View> */}
          <View style={styles.engagementItem}>
            <TouchableOpacity style={styles.iconContainer} activeOpacity={0.7}>
              <CommentIcon width={18} height={18} />
            </TouchableOpacity>
            <Text variant="xxs" color={colors.text.primary} style={styles.engagementCount}>
              {comments?.totalCount || 0}
            </Text>
          </View>
          {/* 런칭 시 스크랩 기능 제외 */}
          {/* <View style={styles.engagementItem}>
            <TouchableOpacity style={styles.iconContainer} activeOpacity={0.7}>
              <ScrapIcon width={14} height={18} />
            </TouchableOpacity>
            <Text variant="xxs" color={colors.text.primary} style={styles.engagementCount}>
              0
            </Text>
          </View> */}
        </View>

        {/* 댓글 목록 */}
        {comments && (comments.adoptedParent || comments.comments.length > 0) && (
          <View
            style={styles.commentsSection}
            onLayout={(event) => {
              // commentsSection의 Y 좌표 저장
              commentYPositions.current['_sectionY'] = event.nativeEvent.layout.y;
            }}
          >
            {getCommentTree().map(({ parent, children }, index) => {
              return (
                <View
                  key={parent.commentId}
                  onLayout={(event) => {
                    // 각 댓글 그룹의 Y 좌표 저장 (commentSection 기준)
                    commentYPositions.current[`_group_${parent.commentId}`] = event.nativeEvent.layout.y;
                  }}
                >
                  {/* 부모 댓글 */}
                  <CommentItem
                    comment={parent}
                    isMine={parent.myComment}
                    currentUserNickname={verification?.user.nickname}
                    isMenuOpen={openMenuCommentId === parent.commentId}
                    onMenuToggle={handleMenuToggle}
                    onLayout={(commentId, y) => {
                      // 부모 댓글의 절대 Y값 계산
                      const groupY = commentYPositions.current[`_group_${parent.commentId}`] || 0;
                      const sectionY = commentYPositions.current['_sectionY'] || 0;
                      commentYPositions.current[commentId] = sectionY + groupY + y;
                    }}
                    onLike={(commentId) => {
                      // TODO: 댓글 좋아요 처리
                    }}
                    onReply={() => handleReplyToComment(parent)}
                    onDelete={handleDeleteComment}
                    onBlock={handleBlockUser}
                    onAdopt={handleAdoptComment}
                    onProfilePress={handleProfilePress}
                    isQuestion={verification?.isQuestion}
                    isResolved={verification?.isResolved}
                    canSelectComment={verification?.canSelectComment}
                    replyCount={children.length}
                  />

                  {/* 답글 보기 버튼 (접힌 상태) */}
                  {children.length > 0 && !expandedComments.has(parent.commentId) && (
                    <TouchableOpacity
                      style={styles.toggleRepliesButton}
                      activeOpacity={0.7}
                      onPress={() => toggleRepliesExpand(parent.commentId)}
                    >
                      <View style={styles.chevronContainer}>
                        <ChevronDownIcon width={9} height={5} />
                      </View>
                      <Text variant="xsReg" color={colors.text.tertiary}>
                        답글 보기
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* 자식 댓글 (대댓글) -> 자식이 실제로 있을 때만 표시 */}
                  {expandedComments.has(parent.commentId) && children.length > 0 && (
                    <>
                      {children.map((child) => {
                        return (
                          <CommentItem
                            key={child.commentId}
                            comment={child}
                            isMine={child.myComment}
                            currentUserNickname={verification?.user.nickname}
                            isMenuOpen={openMenuCommentId === child.commentId}
                            onMenuToggle={handleMenuToggle}
                            onLayout={(commentId, y) => {
                              // 대댓글의 절대 Y값 계산
                              const groupY = commentYPositions.current[`_group_${parent.commentId}`] || 0;
                              const sectionY = commentYPositions.current['_sectionY'] || 0;
                              commentYPositions.current[commentId] = sectionY + groupY + y;
                            }}
                            onLike={(commentId) => {
                              // TODO: 댓글 좋아요 처리
                            }}
                            onDelete={handleDeleteComment}
                            onBlock={handleBlockUser}
                            onAdopt={handleAdoptComment}
                            onProfilePress={handleProfilePress}
                            isQuestion={verification?.isQuestion}
                            isResolved={verification?.isResolved}
                            canSelectComment={verification?.canSelectComment}
                          />
                        );
                      })}

                      {/* 답글 숨기기 버튼 */}
                      <TouchableOpacity
                        style={[
                          styles.toggleRepliesButton,
                          styles.toggleRepliesButtonHide
                        ]}
                        activeOpacity={0.7}
                        onPress={() => toggleRepliesExpand(parent.commentId)}
                      >
                        <View style={[styles.chevronContainer, { transform: [{ rotate: '180deg' }] }]}>
                          <ChevronDownIcon width={9} height={5} />
                        </View>
                        <Text variant="xsReg" color={colors.text.tertiary}>
                          답글 숨기기
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </RefreshableScrollView>

      {/* 댓글 입력 필드 */}
      {verification.canWriteComment && (
        <>
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView
              behavior="padding"
              keyboardVerticalOffset={KEYBOARD_OFFSET_IOS}
              style={styles.keyboardAvoidingView}
            >
              <View style={[
                styles.commentInputContainer,
                { paddingBottom: commentInputBottomPadding },
                isKeyboardVisible && styles.commentInputContainerKeyboard,
              ]}>
                <TextField
                  ref={commentInputRef}
                  variant="default"
                  placeholder="댓글을 입력하세요"
                  value={commentText}
                  onChangeText={setCommentText}
                  editable={!isSubmittingComment}
                  leftIcon={
                    <View style={styles.lockIconContainer}>
                      <TouchableOpacity
                        onPress={() => setIsCommentLocked(!isCommentLocked)}
                        activeOpacity={0.7}
                        style={styles.lockIconButton}
                      >
                        {isCommentLocked ? (
                          <LockIcon width={10} height={12} />
                        ) : (
                          <UnlockIcon width={10} height={12} />
                        )}
                      </TouchableOpacity>
                    </View>
                  }
                  onLeftIconPress={() => setIsCommentLocked(!isCommentLocked)}
                  rightIcon={
                    <View style={styles.sendIconContainer}>
                      <TouchableOpacity
                        onPress={handleSubmitComment}
                        activeOpacity={0.7}
                        style={styles.sendIconButton}
                        disabled={isSubmittingComment}
                      >
                        {isSubmittingComment ? (
                          <ActivityIndicator size="small" color={colors.primary.main} />
                        ) : (
                          <SendIcon width={30} height={30} />
                        )}
                      </TouchableOpacity>
                    </View>
                  }
                  onRightIconPress={handleSubmitComment}
                  containerStyle={styles.textFieldContainer}
                  inputContainerStyle={styles.commentInputField}
                />
              </View>
            </KeyboardAvoidingView>
          ) : (
            <View style={[
              styles.keyboardAvoidingView,
              isKeyboardVisible && { bottom: keyboardHeight }
            ]}>
              <View style={[
                styles.commentInputContainer,
                { paddingBottom: commentInputBottomPadding },
                isKeyboardVisible && styles.commentInputContainerKeyboard,
              ]}>
                <TextField
                  ref={commentInputRef}
                  variant="default"
                  placeholder="댓글을 입력하세요"
                  value={commentText}
                  onChangeText={setCommentText}
                  editable={!isSubmittingComment}
                  leftIcon={
                    <View style={styles.lockIconContainer}>
                      <TouchableOpacity
                        onPress={() => setIsCommentLocked(!isCommentLocked)}
                        activeOpacity={0.7}
                        style={styles.lockIconButton}
                      >
                        {isCommentLocked ? (
                          <LockIcon width={10} height={12} />
                        ) : (
                          <UnlockIcon width={10} height={12} />
                        )}
                      </TouchableOpacity>
                    </View>
                  }
                  onLeftIconPress={() => setIsCommentLocked(!isCommentLocked)}
                  rightIcon={
                    <View style={styles.sendIconContainer}>
                      <TouchableOpacity
                        onPress={handleSubmitComment}
                        activeOpacity={0.7}
                        style={styles.sendIconButton}
                        disabled={isSubmittingComment}
                      >
                        {isSubmittingComment ? (
                          <ActivityIndicator size="small" color={colors.primary.main} />
                        ) : (
                          <SendIcon width={30} height={30} />
                        )}
                      </TouchableOpacity>
                    </View>
                  }
                  onRightIconPress={handleSubmitComment}
                  containerStyle={styles.textFieldContainer}
                  inputContainerStyle={styles.commentInputField}
                />
              </View>
            </View>
          )}
        </>
      )}

      {/* 게시글 더보기 액션 시트 */}
      <ActionSheet
        visible={isActionSheetVisible}
        onClose={() => setIsActionSheetVisible(false)}
        items={actionSheetItems}
      />

      {/* 채택 확인 바텀시트 */}
      <BottomSheet
        visible={isAdoptBottomSheetVisible}
        height={440}
        scrollEnabled={false}
        onClose={() => {
          setIsAdoptBottomSheetVisible(false);
          setSelectedCommentForAdopt(null);
        }}
      >
        <View style={styles.adoptBottomSheetContent}>
          <Text variant="header4" color={colors.text.tertiary} style={styles.adoptBottomSheetTitle}>
            채택하기
          </Text>
          <View style={styles.adoptBottomSheetDivider} />

          <View style={styles.adoptBottomSheetBody}>
            <Text variant="header3" color={colors.text.primary} style={styles.adoptBottomSheetQuestion}>
              해당 댓글을 채택하시겠어요?
            </Text>

            <Text variant="smReg" color={colors.text.tertiary} style={styles.adoptBottomSheetDescription}>
              댓글 채택 시 상단의 질문 표시는 채택으로 변경됩니다
            </Text>

            <Text variant="smReg" color={colors.text.tertiary} style={styles.adoptBottomSheetDescription}>
              댓글 채택이 완료되면 취소가 불가능합니다
            </Text>
          </View>

          <View style={styles.adoptBottomSheetDivider} />

          <View style={styles.adoptBottomSheetFooter}>
            <Button
              variant="black"
              onPress={confirmAdoptComment}
            >
              채택하기
            </Button>
          </View>
        </View>
      </BottomSheet>

      {/* 게시글 신고 바텀시트 */}
      <ReportBottomSheet
        visible={isReportPostBottomSheetVisible}
        type="post"
        onClose={() => setIsReportPostBottomSheetVisible(false)}
        onSubmit={handleSubmitReportPost}
      />

      {/* 사용자 신고 바텀시트 */}
      <ReportBottomSheet
        visible={isReportUserBottomSheetVisible}
        type="user"
        onClose={() => setIsReportUserBottomSheetVisible(false)}
        onSubmit={handleSubmitReportUser}
      />

      {/* 이미지 확대 뷰어 */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        onRequestClose={() => setIsImageViewerVisible(false)}
      >
        <ImageViewer
          imageUrls={(() => {
            // 사진 인증 게시물의 경우 photoUrl 사용, 텍스트 인증 게시물의 경우 textImages 사용
            const images = verification?.type === 'TEXT'
              ? (verification?.textImages || [])
              : (verification?.photoUrl ? [verification.photoUrl] : []);

            return images.map(url => ({ url: url as string }));
          })()}
          index={selectedImageIndex}
          enableSwipeDown
          onSwipeDown={() => setIsImageViewerVisible(false)}
          backgroundColor="rgba(0, 0, 0, 1)"
          renderIndicator={() => <View />}
          saveToLocalByLongPress={false}
          onChange={(index) => setCurrentImageIndex(index || 0)}
          renderHeader={() => (
            <View style={styles.imageViewerHeader}>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0)']}
                style={styles.imageViewerGradient}
              />
              <TouchableOpacity
                onPress={() => setIsImageViewerVisible(false)}
                activeOpacity={0.7}
                style={styles.imageViewerCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <DeleteViewerIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
          )}
          renderFooter={() => {
            // 사진 인증 게시물의 경우 photoUrl, 텍스트 인증 게시물의 경우 textImages 사용
            const images = verification?.type === 'TEXT'
              ? (verification?.textImages || [])
              : (verification?.photoUrl ? [verification.photoUrl] : []);
            const totalImages = images.length;
            if (totalImages <= 1) return <View />;

            return (
              <View style={styles.imageViewerFooter}>
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.imageViewerIndicator}>
                  {Array.from({ length: totalImages }).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicatorDot,
                        currentImageIndex === index ? styles.indicatorDotActive : styles.indicatorDotInactive
                      ]}
                    />
                  ))}
                </View>
              </View>
            );
          }}
        />
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
    marginRight: scale(12),
    borderRadius: scale(20),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
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
    height: verticalScale(1),
  },
  questionTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.main,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
  },
  resolvedTag: {
    backgroundColor: colors.text.primary,
  },
  title: {
    marginBottom: verticalScale(6),
    lineHeight: verticalScale(20),
  },
  content: {
    marginBottom: verticalScale(16),
  },
  linkBox: {
    height: verticalScale(48),
    backgroundColor: colors.background,
    borderRadius: scale(10),
    marginBottom: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
  },
  linkText: {
    flex: 1,
  },
  imagesContainer: {
    gap: verticalScale(8),
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
    marginBottom: verticalScale(24),
    paddingBottom: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  engagementSectionNoComments: {
    marginBottom: verticalScale(65),
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
  commentsSection: {
    // paddingTop: verticalScale(1),
  },
  toggleRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    paddingLeft: scale(30),
    marginBottom: verticalScale(8),
  },
  toggleRepliesButtonHide: {
    marginBottom: verticalScale(8), // 다음 댓글과의 간격
  },
  chevronContainer: {
    width: scale(28),
    height: verticalScale(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  commentInputContainer: {
    paddingHorizontal: scale(12),
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  commentInputContainerKeyboard: {
    paddingBottom: verticalScale(0),
  },
  textFieldContainer: {
    marginTop: verticalScale(4),
  },
  commentInputField: {
    height: verticalScale(44),
    paddingLeft: scale(4),
    paddingRight: scale(3),
  },
  lockIconContainer: {
    marginRight: scale(-8), // TextField의 기본 iconContainer marginRight(8) 상쇄
  },
  lockIconButton: {
    width: scale(36),
    height: verticalScale(36),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconContainer: {
    marginRight: scale(-8),
  },
  sendIconButton: {
    width: scale(40),
    height: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  adoptBottomSheetContent: {
    flex: 1,
    marginHorizontal: scale(-20),
    marginTop: verticalScale(-16),
  },
  adoptBottomSheetTitle: {
    textAlign: 'center',
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(16),
  },
  adoptBottomSheetDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: scale(20),
  },
  adoptBottomSheetBody: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(32),
  },
  adoptBottomSheetQuestion: {
    lineHeight: moderateScale(23),
    marginBottom: verticalScale(20),
  },
  adoptBottomSheetDescription: {
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(6),
  },
  adoptBottomSheetFooter: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(12),
    alignItems: 'center',
  },
  imageViewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  imageViewerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(100),
  },
  imageViewerCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(20),
    left: scale(20),
    width: scale(44),
    height: verticalScale(44),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  imageViewerFooter: {
    width: Dimensions.get('window').width,
    height: verticalScale(100),
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  imageViewerIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(30),
    zIndex: 1001,
  },
  indicatorDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    marginHorizontal: scale(4),
  },
  indicatorDotActive: {
    backgroundColor: colors.white,
  },
  indicatorDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});
