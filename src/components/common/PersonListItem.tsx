import React from 'react';
import { View, StyleSheet, GestureResponderEvent } from 'react-native';
import { Avatar } from '../MyPage/Avatar';
import { Text } from './Text';
import { Button } from './Button';
import { colors, spacing, radius } from '../../design/tokens';
import { scale, verticalScale } from '../../utils/scaling';

interface PersonListItemProps {
    avatarUrl?: string;
    nickname: string;
    tier?: string;
    isFollowing?: boolean;
    onPressFollow?: (event: GestureResponderEvent) => void;
    showFollowButton?: boolean;
    badge?: string;
    actionLabel?: string;
    actionDisabled?: boolean;
    compact?: boolean;
}

const PersonListItem = ({
    avatarUrl,
    nickname,
    tier,
    isFollowing = false,
    onPressFollow,
    showFollowButton = true,
    badge,
    actionLabel,
    actionDisabled = false,
    compact = false,
}: PersonListItemProps) => {

    const renderButton = () => {
        return (
            <Button
                size="small"
                variant={actionLabel ? 'white' : isFollowing ? 'outlinePrimary' : 'primary'}
                onPress={onPressFollow}
                disabled={actionDisabled}
                style={[
                    styles.followButton,
                    compact && styles.followButtonCompact,
                    { borderRadius: radius.xl },
                ]}
            >
                <Text
                    variant="xsMd"
                    color={actionLabel ? colors.text.tertiary : isFollowing ? colors.primary.main : colors.white}
                >
                    {actionLabel ?? (isFollowing ? '팔로잉' : '팔로우')}
                </Text>
            </Button>
        );
    };

    return (
        <View style={[styles.container, compact && styles.containerCompact]}>
            <Avatar uri={avatarUrl} size={40} />
            <View style={styles.infoContainer}>
                <Text variant="smMd" style={styles.nickname} numberOfLines={1}>{nickname}</Text>
                {badge && <View style={styles.dot} />}
                {badge && <Text variant="xsReg" color={colors.text.tertiary}>{badge}</Text>}
                {tier && <View style={styles.dot} />}
                {tier && <Text variant="smMd" color={colors.text.tertiary} style={styles.tierText}>{tier}</Text>}
            </View>
            {showFollowButton && renderButton()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    containerCompact: {
        paddingVertical: verticalScale(6),
    },
    infoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
        minWidth: 0,
    },
    nickname: {
        flexShrink: 1,
    },
    tierText: {
        // typography.xsReg and color is already set via props
    },
    followButton: {
        width: 100,
        height: 32,
        flexShrink: 0,
    },
    followButtonCompact: {
        width: scale(88),
        height: verticalScale(32),
    },
    dot: {
        width: scale(2),
        height: scale(2),
        borderRadius: scale(1),
        backgroundColor: colors.text.primary,
        marginHorizontal: 5,
    },
});

export default PersonListItem;
