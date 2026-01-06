import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar } from '../MyPage/Avatar';
import { Text } from '../common/Text';
import { Button } from '../common/Button';
import { colors, spacing, radius } from '../../design/tokens';

interface BlockedUserListItemProps {
    avatarUrl?: string;
    nickname: string;
    level: string;
    onUnblock: () => void;
}

const BlockedUserListItem = ({ avatarUrl, nickname, level, onUnblock }: BlockedUserListItemProps) => {

    return (
        <View style={styles.container}>
            <Avatar uri={avatarUrl} size={40} />
            <View style={styles.infoContainer}>
                <Text style={styles.nickname}>{nickname}</Text>
                <View style={styles.dot} />
                <Text variant="xsReg" color={colors.text.tertiary} style={styles.tierText}>{level}</Text>
            </View>
            <Button 
                size="small" 
                variant="outlinePrimary"
                onPress={onUnblock}
                style={[styles.button, { borderRadius: radius.xl }]}
            >
                <Text variant="xxs" color={colors.primary.main}>차단 해제</Text>
            </Button>
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
    },
    button: {
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

export default BlockedUserListItem;
