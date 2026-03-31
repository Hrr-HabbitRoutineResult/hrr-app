import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { Text } from '../components/common/Text';
import Toggle from '../components/common/Toggle';
import { colors } from '../design/tokens';
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettings,
} from '../libs/api/notification';

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
  const [loading, setLoading] = useState(true);
  const [pauseAll, setPauseAll] = useState(false);
  const [individualStates, setIndividualStates] = useState({
    challenge: false,
    certification: false,
  });
  // TODO: 추후 업데이트 시 사용 가능하도록 추가
  const hiddenFields = useRef<Pick<NotificationSettings, 'isFollowEnabled' | 'isBadgeEnabled'>>({
    isFollowEnabled: true,
    isBadgeEnabled: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await getNotificationSettings();
        setPauseAll(result.isAllPaused);
        setIndividualStates({
          challenge: result.isChallengeEnabled,
          certification: result.isVerificationEnabled,
        });
        hiddenFields.current = {
          isFollowEnabled: result.isFollowEnabled,
          isBadgeEnabled: result.isBadgeEnabled,
        };
      } catch (e) {
        // 조회 실패 시 기본값 유지
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 알림 설정 업데이트
  const patchSettings = useCallback(
    async (next: { pauseAll: boolean; challenge: boolean; certification: boolean }) => {
      const body = {
        isAllPaused: next.pauseAll,
        isChallengeEnabled: next.challenge,
        isVerificationEnabled: next.certification,
        ...hiddenFields.current,
      };
      try {
        await updateNotificationSettings(body);
      } catch (e) {
        setPauseAll(!next.pauseAll);
        setIndividualStates({ challenge: next.challenge, certification: next.certification });
      }
    },
    [],
  );

  // 알림 토글 처리
  const handleToggle = (id: string, value: boolean) => {
    if (id === MASTER_ID) {
      setPauseAll(value);
      patchSettings({ pauseAll: value, ...individualStates });
    } else {
      // pauseAll ON 상태에서 개별 토글을 켜면 나머지는 false로 리셋
      const base = pauseAll
        ? Object.fromEntries(INDIVIDUAL_IDS.map(k => [k, false]))
        : { ...individualStates };
      const nextIndividual = { ...base, [id]: value } as typeof individualStates;
      const nextPauseAll = value ? false : pauseAll;
      setIndividualStates(nextIndividual);
      setPauseAll(nextPauseAll);
      patchSettings({ pauseAll: nextPauseAll, ...nextIndividual });
    }
  };

  // 알림 토글 값 반환
  const getToggleValue = (id: string) => {
    if (id === MASTER_ID) return pauseAll;
    return pauseAll ? false : individualStates[id as keyof typeof individualStates];
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
