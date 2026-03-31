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

const MASTER_ID = 'pause_all';

const NOTIFICATION_ITEMS: NotificationItem[] = [
  {
    id: MASTER_ID,
    label: '전체 일시 중단',
    description: '알림 수신이 일시 중단됩니다',
  },
  {
    id: 'challenge',
    label: '챌린지',
  },
  {
    id: 'certification',
    label: '인증',
  },
];

const INDIVIDUAL_IDS = NOTIFICATION_ITEMS.map(i => i.id).filter(id => id !== MASTER_ID);

const NotificationSettingsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [pauseAll, setPauseAll] = useState(false);
  const [individualStates, setIndividualStates] = useState<Record<string, boolean>>(
    Object.fromEntries(INDIVIDUAL_IDS.map(id => [id, false])),
  );

  const handleToggle = (id: string, value: boolean) => {
    if (id === MASTER_ID) {
      setPauseAll(value);
    } else {
      setIndividualStates(prev => ({ ...prev, [id]: value }));
    }
  };

  const getToggleValue = (id: string) => {
    if (id === MASTER_ID) return pauseAll;
    return pauseAll ? false : individualStates[id];
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
                item.description ? styles.itemPaddingWithDesc : styles.itemPaddingNoDesc,
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
                value={getToggleValue(item.id)}
                onValueChange={value => handleToggle(item.id, value)}
                disabled={item.id !== MASTER_ID && pauseAll}
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
