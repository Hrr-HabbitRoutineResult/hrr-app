import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { Text } from '../common/Text';
import { colors } from '../../design/tokens';
import { CommentItem as CommentItemType } from '../../libs/api/challenge';
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
  isLiked?: boolean;
  isMine?: boolean;
  currentUserNickname?: string;
  isMenuOpen?: boolean;
  onMenuToggle?: (commentId: number) => void;
  onLayout?: (commentId: number, y: number) => void;
  isQuestion?: boolean;
  isResolved?: boolean;
  replyCount?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onReply,
  onDelete,
  onAdopt,
  isLiked = false,
  isMine = false,
  currentUserNickname,
  isMenuOpen = false,
  onMenuToggle,
  onLayout,
  isQuestion = false,
  isResolved = false,
  replyCount = 0,
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

  // 표시할 닉네임 결정
  // TODO: 백엔드 API 수정 이후 변경 필요
  const displayName =
    isMine
      ? currentUserNickname
      : comment.userName;

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

  return (
    <View
      onLayout={(event) => {
        const y = event.nativeEvent.layout.y;
        onLayout?.(comment.commentId, y);
      }}
      style={[styles.container, isReply && styles.replyContainer]}
    >
      {/* 프로필 이미지 */}
      <View style={styles.profileContainer}>
        <DefaultProfileIcon width={32} height={32} />
      </View>

      {/* 댓글 내용 */}
      <View style={styles.contentContainer}>
        {/* 사용자 닉네임과 작성 시간 */}
        <View style={styles.headerRow}>
          <View style={styles.userInfoRow}>
            {comment.anonymous && (
              <View style={styles.lockIconContainer}>
                <LockIcon width={10} height={12} />
              </View>
            )}
            <Text variant="smMd" color={colors.text.primary}>
              {displayName}
            </Text>
            <View style={styles.dot} />
            <Text variant="xxs" color={colors.icon.gray}>
              {formatDate(comment.createdAt)}
            </Text>
          </View>
          {isMine && (
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
        <Text variant="xsReg" color={colors.text.secondary} style={styles.commentText}>
          {comment.content}
        </Text>

        {/* 좋아요 및 답글 버튼 */}
        <View style={styles.actionsRow}>
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

          {isQuestion && !isMine && (
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
            isMine && styles.singleMenuContainer
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
              // 남이 쓴 댓글인 경우 채팅하기/차단
              <>
                <TouchableOpacity
                  style={styles.menuButton}
                  activeOpacity={0.9}
                  onPress={() => {
                    onMenuToggle?.(comment.commentId);
                    // TODO: 채팅하기 기능
                  }}
                >
                  <Text variant="md" color={colors.text.primary}>
                    채팅하기
                  </Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuButton}
                  activeOpacity={0.9}
                  onPress={() => {
                    onMenuToggle?.(comment.commentId);
                    // TODO: 차단 기능
                  }}
                >
                  <Text variant="md" color={colors.primary.sub}>
                    차단
                  </Text>
                </TouchableOpacity>
              </>
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
    paddingVertical: verticalScale(12),
    position: 'relative',
  },
  replyContainer: {
    marginLeft: scale(40),
  },
  profileContainer: {
    width: scale(32),
    height: verticalScale(32),
    borderRadius: scale(16),
    marginRight: scale(8),
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
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
    marginBottom: verticalScale(12),
  },
  actionsRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
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
    top: scale(24),
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

