import { PointCriteria } from '../types/ranking';

export const POINT_CRITERIA: PointCriteria[] = [
  { type: 'FIRST_VERIFICATION', title: '챌린지 첫 인증', points: 1 },
  {
    type: 'RANDOM_MISSION',
    title: '랜덤미션 참여',
    description: '1일 1회 제한',
    points: 1,
  },
  {
    type: 'FLAWLESS_ROUND',
    title: '라운드 무결석 완주',
    description: '미인증 없이 라운드를 종료했을 때',
    points: 3,
  },
  {
    type: 'CHALLENGE_MASTER',
    title: '챌린지 마스터',
    description: '동일한 챌린지에 3라운드 이상 참여했을 때',
    points: 3,
  },
  {
    type: 'WEEK1_PERFECT',
    title: '1주차 퍼펙트 인증',
    description: '1주차의 모든 인증일에 인증을 완료했을 때',
    points: 1,
  },
  {
    type: 'WEEK2_PERFECT',
    title: '2주차 퍼펙트 인증',
    description: '2주차의 모든 인증일에 인증을 완료했을 때',
    points: 2,
  },
  {
    type: 'WEEK3_PERFECT',
    title: '3주차 퍼펙트 인증',
    description: '3주차의 모든 인증일에 인증을 완료했을 때',
    points: 3,
  },
];
