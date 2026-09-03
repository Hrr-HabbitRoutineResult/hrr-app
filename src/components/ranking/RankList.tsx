import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../../design/tokens';
import { RankEntry } from '../../types/ranking';
import { formatPoints } from '../../utils/number';
import { scale, verticalScale } from '../../utils/scaling';
import ProfileDefault from '../../../assets/icons/mypage/profile-default.svg';
import { Text } from '../common/Text';

interface RankListProps {
  top5: RankEntry[];
  me?: RankEntry;
}

const Avatar: React.FC<{ uri?: string }> = ({ uri }) =>
  uri ? (
    <Image source={{ uri }} style={styles.avatar} />
  ) : (
    <ProfileDefault width={scale(40)} height={scale(40)} />
  );

export const RankList: React.FC<RankListProps> = ({ top5, me }) => {
  const shouldAppendMe = Boolean(me && me.rank > 5);
  const rows = shouldAppendMe && me ? [...top5, me] : top5;

  return (
    <View>
      {rows.map((entry, index) => {
        const isMe = entry.userId === me?.userId;
        const startsDetachedRow = shouldAppendMe && index === top5.length;
        return (
          <View
            key={`${entry.userId}:${entry.rank}`}
            style={[
              styles.row,
              startsDetachedRow && styles.detachedRow,
              isMe && styles.myRow,
            ]}
            testID={isMe ? 'my-rank-row' : `rank-row-${entry.userId}`}
          >
            <View style={styles.left}>
              <Text
                variant="header4"
                color={colors.text.primary}
                style={styles.rankNumber}
              >
                {entry.rank}
              </Text>
              <Avatar uri={entry.avatarUrl} />
              <Text
                variant="xsMd"
                color={colors.text.primary}
                numberOfLines={1}
                style={styles.nickname}
              >
                {entry.nickname}
              </Text>
            </View>
            <Text
              variant="caption"
              color={colors.text.primary}
              style={styles.points}
            >
              {formatPoints(entry.points)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    height: verticalScale(60),
    borderRadius: scale(12),
    paddingHorizontal: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detachedRow: {
    marginTop: verticalScale(2),
  },
  myRow: {
    backgroundColor: colors.primary.lightest,
    borderWidth: scale(1),
    borderColor: colors.primary.main,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    width: scale(30),
    marginRight: scale(8),
    textAlign: 'right',
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.line,
  },
  nickname: {
    flex: 1,
    marginLeft: scale(10),
  },
  points: {
    marginLeft: scale(12),
    textAlign: 'right',
  },
});
