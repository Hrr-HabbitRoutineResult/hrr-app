const formatParticipants = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

const date = (isoString: string): string => {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

const level = (levelString: string): string => {
  switch (levelString?.toUpperCase()) {
    case 'BRONZE':
      return '브론즈';
    case 'SILVER':
      return '실버';
    case 'GOLD':
      return '골드';
    case 'MASTER':
      return '마스터';
    case 'CHALLENGER':
      return '챌린저';
    default:
      return levelString;
  }
}

export const format = {
  participants: formatParticipants,
  date,
  level,
};

