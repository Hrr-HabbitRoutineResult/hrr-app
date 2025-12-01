import React from 'react';
import { View } from 'react-native';
import { HomeTabParamList } from '../../navigation/types';
import { colors } from '../../design/tokens';

// Import SVG icons
import HomeIconColor from '../../../assets/icons/homescreen/bottomtapbar/ic_home_color.svg';
import HomeIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_home.svg';
import SearchIconColor from '../../../assets/icons/homescreen/bottomtapbar/ic_search_color.svg';
import SearchIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_search.svg';
import ChatIconColor from '../../../assets/icons/homescreen/bottomtapbar/ic_chat_color.svg';
import ChatIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_chat.svg';
import MyIconColor from '../../../assets/icons/homescreen/bottomtapbar/ic_my_color.svg';
import MyIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_my.svg';

type Props = {
  routeName: keyof HomeTabParamList;
  focused: boolean;
};

const BottomTabBarIcons = ({ routeName, focused }: Props) => {
  const iconSize = 24; // You can adjust the size as needed

  const renderIcon = () => {
    switch (routeName) {
      case '홈':
        return focused ? (
          <HomeIconColor width={iconSize} height={iconSize} />
        ) : (
          <HomeIcon width={iconSize} height={iconSize} color={colors.icon.gray} />
        );
      case '검색':
        return focused ? (
          <SearchIconColor width={iconSize} height={iconSize} />
        ) : (
          <SearchIcon width={iconSize} height={iconSize} color={colors.icon.gray} />
        );
      case '채팅':
        return focused ? (
          <ChatIconColor width={iconSize} height={iconSize} />
        ) : (
          <ChatIcon width={iconSize} height={iconSize} color={colors.icon.gray} />
        );
      case '마이':
        return focused ? (
          <MyIconColor width={iconSize} height={iconSize} />
        ) : (
          <MyIcon width={iconSize} height={iconSize} color={colors.icon.gray} />
        );
      default:
        return null;
    }
  };

  return <View>{renderIcon()}</View>;
};

export default BottomTabBarIcons;
