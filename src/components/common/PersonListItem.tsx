import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar } from '../MyPage/Avatar';
import { Text } from './Text';
import { Button } from './Button';
import { colors, spacing, radius } from '../../design/tokens';

interface PersonListItemProps {
    avatarUrl?: string;
    nickname: string;
    tier?: string;
    isFollowing?: boolean;
    onPressFollow?: () => void;
}

const PersonListItem = ({ avatarUrl, nickname, tier, isFollowing = false, onPressFollow }: PersonListItemProps) => {
    const [isConfirmingUnfollow, setIsConfirmingUnfollow] = useState(false);

    const handlePress = () => {
        if (isFollowing && !isConfirmingUnfollow) {
            setIsConfirmingUnfollow(true);
        } else {
            onPressFollow?.();
            setIsConfirmingUnfollow(false);
        }
    };

    const renderButton = () => {
        if (isConfirmingUnfollow) {
            return (
                <Button 
                    size="small" 
                    variant="white"
                    onPress={handlePress}
                    style={[styles.followButton, { borderRadius: radius.xl }]}
                >
                    <Text variant="xxs" color={colors.primary.sub}>언팔로잉</Text>
                </Button>
            );
        }

        return (
            <Button 
                size="small" 
                variant={isFollowing ? 'outlinePrimary' : 'primary'}
                onPress={handlePress}
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
            {renderButton()}
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
        width: 100,
        height: 32,
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
