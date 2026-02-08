import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, Alert, Image } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { Text } from '../common/Text';
import { colors } from '../../design/tokens';
import { CommentItem as CommentItemType } from '../../libs/api/challenge';
import { getS3ImageUrl } from '../../libs/s3';
import DefaultProfileIcon from '../../../assets/icons/challenge-profile/default-profile.svg';
import LikeUnselectedIcon from '../../../assets/icons/challenge-profile/like-unselected.svg';
import LikeSelectedIcon from '../../../assets/icons/challenge-profile/like-selected.svg';
import MoreIcon from '../../../assets/icons/more.svg';
import LockIcon from '../../../assets/icons/lock.svg';
import CommentIcon from '../../../assets/icons/comment.svg';
import AdoptableIcon from '../../../assets/icons/adoptable.svg';
import AdoptedIcon from '../../../assets/icons/adopted.svg';

interface CommentItemProps {
  comment: CommentItemType;
  onLike?: (commentId: number) => void;
  onReply?: () => void;
  onDelete?: (commentId: number) => void;
  onAdopt?: (commentId: number) => void;
  onBlock?: (commentId: number) => void; // 댓글 작성자 차단
  onProfilePress?: (userId: number) => void; // 프로필 클릭 시 호출
  isLiked?: boolean;
  isMine?: boolean;
  currentUserNickname?: string;
  isMenuOpen?: boolean;
  onMenuToggle?: (commentId: number) => void;
  onLayout?: (commentId: number, y: number) => void;
  isQuestion?: boolean;
  isResolved?: boolean;
  replyCount?: number;
  canSelectComment?: boolean; // 게시글 작성자만 채택 가능
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onReply,
  onDelete,
  onAdopt,
  onBlock,
  onProfilePress,
  isLiked = false,
  isMine = false,
  currentUserNickname,
  isMenuOpen = false,
  onMenuToggle,
  onLayout,
  isQuestion = false,
  isResolved = false,
  replyCount = 0,
  canSelectComment = false,
}) => {

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    // 24시간 이내면 상대적 시간 표시
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        if (diffInMinutes < 1) {
          return '방금 전';
        }
        return `${diffInMinutes}분 전`;
      }
      return `${diffInHours}시간 전`;
    }

    // 24시간 이후면 날짜/시간 표시
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 대댓글인 경우 왼쪽 여백 추가
  const isReply = comment.depth > 0;

  // 마스킹된 댓글 여부 (차단/삭제/탈퇴한 사용자 -> 익명 댓글은 제외)
  const isMasked = comment.userId === null && !comment.anonymous;

  // 차단된 사용자 여부 (userName 표시 안 해도 됨)
  const isBlocked = comment.content === "차단된 사용자의 댓글입니다.";

  // 프로필 이미지 표시 여부
  const showProfile = !isMasked;

  const handleDelete = () => {
    onMenuToggle?.(comment.commentId);
    Alert.alert(
      '삭제',
      '댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => onDelete?.(comment.commentId),
        },
      ]
    );
  };

  const handleBlock = () => {
    onMenuToggle?.(comment.commentId);
    Alert.alert(
      '차단',
      '이 댓글 작성자를 차단하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: () => onBlock?.(comment.commentId),
        },
      ]
    );
  };

  return (
    <View
      onLayout={(event) => {
        const y = event.nativeEvent.layout.y;
        onLayout?.(comment.commentId, y);
      }}
      style={[styles.container, isReply && styles.replyContainer]}
    >
      {/* 프로필 이미지 - 삭제/탈퇴는 숨김 */}
      {showProfile && (
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => comment.userId && onProfilePress?.(comment.userId)}
          activeOpacity={0.7}
          disabled={!comment.userId}
        >
          {getS3ImageUrl(comment.userProfileUrl) ? (
            <Image
              source={{ uri: getS3ImageUrl(comment.userProfileUrl)! }}
              style={styles.profileImage}
            />
          ) : (
            <DefaultProfileIcon width={32} height={32} />
          )}
        </TouchableOpacity>
      )}

      {/* 댓글 내용 */}
      <View style={[styles.contentContainer, !showProfile && styles.contentContainerNoProfile]}>
        {isBlocked ? (
          /* 차단된 사용자 - userName 없이 content만 표시 */
          <Text variant="xsReg" color={colors.text.secondary} style={styles.commentText}>
            {comment.content}
          </Text>
        ) : (
          <>
            {/* 사용자 닉네임과 작성 시간 */}
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.userInfoRow}
                onPress={() => comment.userId && onProfilePress?.(comment.userId)}
                activeOpacity={0.7}
                disabled={!comment.userId}
              >
                {/* {comment.anonymous && !isMasked && (
                  <View style={styles.lockIconContainer}>
                    <LockIcon width={10} height={12} />
                  </View>
                )} */}
                <Text
                  variant="smMd"
                  color={isMasked ? colors.text.secondary : colors.text.primary}
                >
                  {comment.userName}
                </Text>
                {!isMasked && (
                  <>
                    <View style={styles.dot} />
                    <Text variant="xxs" color={colors.icon.gray}>
                      {formatDate(comment.createdAt)}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {!isMasked && (
                <TouchableOpacity
                  onPress={() => onMenuToggle?.(comment.commentId)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.moreButton}
                >
                  <MoreIcon width={15} height={3} />
                </TouchableOpacity>
              )}
            </View>

            {/* 댓글 텍스트 */}
            <Text
              variant="xsReg"
              color={colors.text.secondary}
              style={styles.commentText}
            >
              {comment.content}
            </Text>
          </>
        )}

        {/* 액션 버튼 */}
        <View style={styles.actionsRow}>
          {/* 좋아요: 1차 런칭 제외 */}
          {/* TODO: 2차 런칭 시 좋아요 기능 추가 */}
          {/* {!isMasked && (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => onLike?.(comment.commentId)}
            >
              {isLiked ? (
                <LikeSelectedIcon width={14} height={12} />
              ) : (
                <LikeUnselectedIcon width={14} height={12} />
              )}
              <Text variant="xxs" color={colors.text.tertiary} style={styles.actionText}>
                {comment.likesCount || 0}
              </Text>
            </TouchableOpacity>
          )} */}

          {/* 답글: 항상 표시 */}
          {!isReply && (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={onReply}
            >
              <CommentIcon width={12} height={12} />
              <Text variant="xxs" color={colors.text.tertiary} style={styles.actionText}>
                {replyCount}
              </Text>
            </TouchableOpacity>
          )}

          {/* 채택: 마스킹되지 않은 경우만 */}
          {!isMasked && isQuestion && (comment.adopted || (canSelectComment && !isMine)) && (
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => onAdopt?.(comment.commentId)}
              disabled={comment.adopted || isResolved}
            >
              {comment.adopted ? (
                <AdoptedIcon width={52} height={20} />
              ) : (
                <AdoptableIcon width={52} height={20} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 더보기 메뉴 */}
      {isMenuOpen && (
        <>
          {/* 배경 오버레이 */}
          <Pressable
            style={styles.menuOverlay}
            onPress={() => onMenuToggle?.(comment.commentId)}
          />

          <View style={[
            styles.moreMenuContainer,
            styles.singleMenuContainer
          ]}>
            {isMine ? (
              // 내가 쓴 댓글인 경우 삭제만
              <TouchableOpacity
                style={styles.singleMenuButton}
                activeOpacity={0.9}
                onPress={handleDelete}
              >
                <Text variant="md" color={colors.primary.sub}>
                  삭제
                </Text>
              </TouchableOpacity>
            ) : (
              // 남이 쓴 댓글인 경우 차단만
              <TouchableOpacity
                style={styles.singleMenuButton}
                activeOpacity={0.9}
                onPress={handleBlock}
              >
                <Text variant="md" color={colors.primary.sub}>
                  차단
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: verticalScale(6),
    position: 'relative',
  },
  replyContainer: {
    marginLeft: scale(40),
    paddingVertical: verticalScale(8), // 대댓글들끼리의 간격 조정
  },
  profileContainer: {
    width: scale(32),
    height: verticalScale(32),
    borderRadius: scale(16),
    marginRight: scale(8),
    overflow: 'hidden',
  },
  profileImage: {
    width: scale(32),
    height: verticalScale(32),
    borderRadius: scale(16),
  },
  contentContainer: {
    flex: 1,
  },
  contentContainerNoProfile: {
    marginLeft: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  userInfoRow: {
    paddingTop: verticalScale(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    flex: 1,
  },
  lockIconContainer: {
    width: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: scale(2),
    height: verticalScale(2),
    borderRadius: scale(1),
    backgroundColor: colors.text.primary,
  },
  commentText: {
    marginBottom: verticalScale(4),
  },
  actionsRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: scale(4),
    height: verticalScale(30),
  },
  actionText: {
    marginLeft: scale(2),
  },
  moreButton: {
    padding: scale(4),
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  moreMenuContainer: {
    position: 'absolute',
    right: scale(0),
    top: scale(32),
    width: scale(160),
    height: verticalScale(92),
    backgroundColor: colors.white,
    borderRadius: scale(10),
    zIndex: 1000,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
  },
  singleMenuContainer: {
    height: verticalScale(46),
  },
  singleMenuButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
});

