import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '../MyPage/Avatar';
import { Text } from '../common/Text';
import { colors, spacing, radius } from '../../design/tokens';
import { format } from '../../libs/format';
import { scale } from '../../utils/scaling';

interface BlockedUserListItemProps {
    avatarUrl?: string;
    nickname: string;
    level: string;
    isUnblocked?: boolean;
    onUnblock: () => void;
}

const BlockedUserListItem = ({ avatarUrl, nickname, level, isUnblocked = false, onUnblock }: BlockedUserListItemProps) => {

    return (
        <View style={styles.container}>
            <Avatar uri={avatarUrl} size={40} />
            <View style={styles.infoContainer}>
                <Text style={styles.nickname}>{nickname}</Text>
                <View style={styles.dot} />
                <Text variant="xsReg" color={colors.text.tertiary} style={styles.tierText}>{format.level(level)}</Text>
            </View>
            <TouchableOpacity
                onPress={onUnblock}
                style={[
                    styles.button,
                    isUnblocked ? styles.buttonUnblocked : styles.buttonBlocked
                ]}
            >
                <Text
                    variant="xxs"
                    color={isUnblocked ? colors.primary.main : colors.white}
                >
                    {isUnblocked ? '차단 해제' : '차단됨'}
                </Text>
            </TouchableOpacity>
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
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: radius.xl,
    },
    buttonBlocked: {
        backgroundColor: '#FF6B61',
    },
    buttonUnblocked: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#FF6B61',
    },
    dot: {
        width: scale(2),
        height: scale(2),
        borderRadius: scale(1),
        backgroundColor: colors.text.primary,
        marginHorizontal: 5,
    },
});

export default BlockedUserListItem;
