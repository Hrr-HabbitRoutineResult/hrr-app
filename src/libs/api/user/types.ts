export type ApiLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'MASTER' | 'CHALLENGER';

export enum Level {
  BRONZE,
  SILVER,
  GOLD,
  MASTER,
  CHALLENGER,
}

export const mapLevelStringToEnum = (levelString?: ApiLevel | string): Level => {
  switch (levelString) {
    case 'BRONZE':
      return Level.BRONZE;
    case 'SILVER':
      return Level.SILVER;
    case 'GOLD':
      return Level.GOLD;
    case 'MASTER':
      return Level.MASTER;
    case 'CHALLENGER':
      return Level.CHALLENGER;
    default:
      return Level.BRONZE;
  }
};

export const levelToDisplayString: { [key in Level]: string } = {
  [Level.BRONZE]: '브론즈',
  [Level.SILVER]: '실버',
  [Level.GOLD]: '골드',
  [Level.MASTER]: '마스터',
  [Level.CHALLENGER]: '챌린저',
};
