import React from 'react';
import { View, StyleSheet, GestureResponderEvent } from 'react-native';
import { Avatar } from '../MyPage/Avatar';
import { Text } from './Text';
import { Button } from './Button';
import { colors, spacing, radius } from '../../design/tokens';

interface PersonListItemProps {
    avatarUrl?: string;
    nickname: string;
    tier?: string;
    isFollowing?: boolean;
    onPressFollow?: (event: GestureResponderEvent) => void;
    showFollowButton?: boolean;
}

const PersonListItem = ({ avatarUrl, nickname, tier, isFollowing = false, onPressFollow, showFollowButton = true }: PersonListItemProps) => {

    const renderButton = () => {
        return (
            <Button
                size="small"
                variant={isFollowing ? 'outlinePrimary' : 'primary'}
                onPress={onPressFollow}
                style={[styles.followButton, { borderRadius: radius.xl }]}
            >
                <Text variant="xxs" color={isFollowing ? colors.primary.main : colors.white}>
                    {isFollowing ? '팔로잉' : '팔로우'}
                </Text>
            </Button>
        );
    };

    return (
        <View style={styles.container}>
            <Avatar uri={avatarUrl} size={40} />
            <View style={styles.infoContainer}>
                <Text style={styles.nickname}>{nickname}</Text>
                {tier && <View style={styles.dot} />}
                {tier && <Text variant="xsReg" color={colors.text.tertiary} style={styles.tierText}>{tier}</Text>}
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
    infoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    nickname: {
    },
    tierText: {
        // typography.xsReg and color is already set via props
    },
    followButton: {
        width: 120,
        height: 40,
    },
    dot: {
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: colors.text.secondary,
        marginHorizontal: spacing.xs,
    },
});

export default PersonListItem;