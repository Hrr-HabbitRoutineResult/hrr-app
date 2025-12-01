import React from 'react';
import { View } from 'react-native';
import { HomeTabParamList } from '../../navigation/types';
import { colors } from '../../design/tokens';

// Import SVG icons
import HomeIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_home_color.svg';
import SearchIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_search.svg';
import ChatIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_chat.svg';
import MyIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_my.svg';

type Props = {
  routeName: keyof HomeTabParamList;
  focused: boolean;
};

const BottomTabBarIcons = ({ routeName, focused }: Props) => {
  const iconColor = focused ? colors.primary.main : colors.icon.gray;
  const iconSize = 24; // You can adjust the size as needed

  const renderIcon = () => {
    switch (routeName) {
      case '홈':
        return <HomeIcon width={iconSize} height={iconSize} color={iconColor} />;
      case '검색':
        return <SearchIcon width={iconSize} height={iconSize} color={iconColor} />;
      case '채팅':
        return <ChatIcon width={iconSize} height={iconSize} color={iconColor} />;
      case '마이':
        return <MyIcon width={iconSize} height={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  return <View>{renderIcon()}</View>;
};

export default BottomTabBarIcons;
