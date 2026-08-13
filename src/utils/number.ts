export const formatNumber = (value: number): string =>
  String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatPoints = (value: number): string =>
  `${formatNumber(value)}P`;

export const formatSignedPoints = (value: number): string => {
  const sign = value < 0 ? '-' : '+';
  return `${sign}${formatNumber(Math.abs(value))}P`;
};
