import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { Text } from '../components/common/Text';
import Toggle from '../components/common/Toggle';
import { colors } from '../design/tokens';

type NotificationItem = {
  id: string;
  label: string;
  description?: string;
};

const NOTIFICATION_ITEMS: NotificationItem[] = [
  {
    id: 'pause_all',
    label: '전체 일시 중단',
    description: '알림 수신이 일시 중단됩니다',
  },
  {
    id: 'challenge',
    label: '챌린지',
  },
  {
    id: 'certification',
    label: '인증 알림',
  },
];

const NotificationSettingsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_ITEMS.map(item => [item.id, false])),
  );

  const handleToggle = (id: string, value: boolean) => {
    setToggleStates(prev => ({ ...prev, [id]: value }));
  };

  return (
    <View style={styles.container}>
      <Header
        title="알림"
        onBack={() => navigation.goBack()}
        useSafeArea
        showDivider={true}
      />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text variant="header3" color={colors.text.primary}>
          푸시 알림
        </Text>

        <View style={styles.itemList}>
          {NOTIFICATION_ITEMS.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.item,
                index < NOTIFICATION_ITEMS.length - 1 && styles.itemGap,
              ]}
            >
              <View style={styles.itemLeft}>
                <Text variant="md" color={colors.text.primary}>
                  {item.label}
                </Text>
                {item.description && (
                  <View style={styles.descriptionGap}>
                    <Text variant="xsReg" color={colors.text.tertiary}>
                      {item.description}
                    </Text>
                  </View>
                )}
              </View>
              <Toggle
                value={toggleStates[item.id]}
                onValueChange={value => handleToggle(item.id, value)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  itemList: {
    marginTop: 31,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPaddingWithDesc: {
    paddingVertical: 10,
  },
  itemPaddingNoDesc: {
    paddingVertical: 14.5,
  },
  itemGap: {
    marginBottom: 12,
  },
  itemLeft: {
    flex: 1,
    marginRight: 16,
  },
  descriptionGap: {
    marginTop: 4,
  },
});
