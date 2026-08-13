import React from 'react';
import { SvgProps } from 'react-native-svg';
import { PointCriteriaType } from '../../types/ranking';
import FaceSmile from '../../../assets/icons/point/face-smile.svg';
import IcRandom from '../../../assets/icons/point/ic_random.svg';
import IcFlag from '../../../assets/icons/point/ic_flag.svg';
import IcTrophy from '../../../assets/icons/point/ic_trophy.svg';
import IcCalendar from '../../../assets/icons/point/ic_calendar.svg';

const criteriaIconByType: Record<PointCriteriaType, React.FC<SvgProps>> = {
  FIRST_VERIFICATION: FaceSmile,
  RANDOM_MISSION: IcRandom,
  FLAWLESS_ROUND: IcFlag,
  CHALLENGE_MASTER: IcTrophy,
  WEEK1_PERFECT: IcCalendar,
  WEEK2_PERFECT: IcCalendar,
  WEEK3_PERFECT: IcCalendar,
};

export const CriteriaIcon: React.FC<{ type: PointCriteriaType } & SvgProps> = ({
  type,
  ...props
}) => {
  const Icon = criteriaIconByType[type];
  return <Icon {...props} />;
};
