import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { colors, spacing } from '../design/tokens';
import SettingSection from '../components/MyPage/SettingSection';
import SettingItem from '../components/MyPage/SettingItem';

// Import Icons
import IcMyIcon from '../../assets/icons/settingpage/ic_my.svg';
import IcHeartDefaultIcon from '../../assets/icons/settingpage/ic_heart default.svg';
import IcCheckIcon from '../../assets/icons/settingpage/ic_check.svg';
import IcLockIcon from '../../assets/icons/settingpage/ic_lock.svg';
import IcBlockIcon from '../../assets/icons/settingpage/ic_block.svg';
import IcAlarmIcon from '../../assets/icons/settingpage/ic_alarm.svg';

const SettingsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const settingsData = [
    {
      title: '',
      items: [
        {
          label: '계정 설정',
          icon: <IcMyIcon width={24} height={24} />,
          onPress: () => navigation.navigate('AccountSettings'),
        },
      ],
    },
    {
      title: '서비스 설정',
      items: [
        {
          label: '알림',
          icon: <IcAlarmIcon width={24} height={24} />,
          onPress: () => navigation.navigate('NotificationSettings'),
        },
      ],
    },
    {
      title: '챌린지',
      items: [
        {
          label: '찜한 챌린지',
          icon: <IcHeartDefaultIcon width={24} height={24} />,
          onPress: () => navigation.navigate('LikedChallenge'),
        },
        {
          label: '종료한 챌린지',
          icon: <IcCheckIcon width={24} height={24} />,
          onPress: () => navigation.navigate('CompletedChallenge'),
        },
      ],
    },
    {
      title: '내 활동',
      items: [
        // {
        //   label: '계정 공개 범위',
        //   icon: <IcLockIcon width={24} height={24} />,
        // },
        {
          label: '차단한 사용자',
          icon: <IcBlockIcon width={24} height={24} />,
          onPress: () => navigation.navigate('BlockedUserScreen'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="설정"
        onBack={() => navigation.goBack()}
        useSafeArea
        showDivider={true}
      />
      <ScrollView style={styles.content}>
        {settingsData.map((section, sectionIndex) => (
          <SettingSection key={sectionIndex} title={section.title} isLast={sectionIndex === settingsData.length - 1}>
            {section.items.map((item, itemIndex) => (
              <SettingItem
                key={itemIndex}
                label={item.label}
                icon={item.icon}
                onPress={item.onPress}
              />
            ))}
          </SettingSection>
        ))}
      </ScrollView>
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
  },
});

export default SettingsScreen;
