import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '../../design/tokens';
import ChevronRightIcon from '../../../assets/icons/chevron-right-grey.svg';

interface SettingsMenuItemProps {
    icon: React.ReactNode;
    text: string;
    onPress?: () => void;
}

const SettingsMenuItem = ({ icon, text, onPress }: SettingsMenuItemProps) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container} disabled={!onPress}>
            <View style={styles.iconContainer}>{icon}</View>
            <Text variant="smMd" style={styles.text}>{text}</Text>
            <ChevronRightIcon width={24} height={24} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    iconContainer: {
        marginRight: spacing.sm,
    },
    text: {
        flex: 1,
    },
});

export default SettingsMenuItem;
