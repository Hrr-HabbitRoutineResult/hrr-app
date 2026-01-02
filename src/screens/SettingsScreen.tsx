import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import SubpageHeader from '../components/common/SubpageHeader';
import { colors } from '../design/tokens';
import SettingsMenuItem from '../components/common/SettingsMenuItem';
import PersonIcon from '../../assets/icons/person.svg';
import LockIcon from '../../assets/icons/lock.svg';
import AlarmIcon from '../../assets/icons/alarm.svg';

const SettingsScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <SubpageHeader 
                title="설정"
                onBackPress={() => navigation.goBack()}
                useSafeArea 
            />
            <View style={styles.content}>
                <SettingsMenuItem
                    icon={<PersonIcon width={24} height={24} />}
                    text="계정 정보"
                    onPress={() => console.log('계정 정보')}
                />
                <SettingsMenuItem
                    icon={<LockIcon width={24} height={24} />}
                    text="개인정보 처리방침"
                    onPress={() => console.log('개인정보 처리방침')}
                />
                <SettingsMenuItem
                    icon={<AlarmIcon width={24} height={24} />}
                    text="알림 설정"
                    onPress={() => console.log('알림 설정')}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        flex: 1,
        marginTop: 20,
    }
});

export default SettingsScreen;
