/**
 * KST(한국 표준시, UTC+9) 기준 시간 유틸리티
 * 
 * 디바이스의 로컬 타임존 설정과 관계없이 서비스 기준 시각(KST)을 정확히 계산
 * 반환된 Date 객체는 반드시 'getUTC*' 메서드를 통해 읽어야 KST 값이 반환됨
 */

const KST_OFFSET_MINUTES = 9 * 60;

/**
 * 디바이스 시각을 KST로 보정하여 UTC 기반 Date 객체로 반환
 */
export function getKstDateAsUtcBase(now: Date = new Date()): Date {
  // 로컬 시각을 UTC로 변환 후 KST 오프셋(+9h) 적용
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const kstMs = utcMs + KST_OFFSET_MINUTES * 60_000;
  return new Date(kstMs);
}

/**
 * 현재 KST 날짜 반환 (YYYY-MM-DD)
 */
export function getTodayYYYYMMDD_KST(now: Date = new Date()): string {
  const kst = getKstDateAsUtcBase(now);
  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kst.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 현재 KST 요일 반환 (0: 일요일 ~ 6: 토요일)
 */
export function getDayOfWeek_KST(now: Date = new Date()): number {
  const kst = getKstDateAsUtcBase(now);
  return kst.getUTCDay();
}

/**
 * 현재 KST 자정 이후 경과 시간(초) 반환
 */
export function getSecondsSinceMidnight_KST(now: Date = new Date()): number {
  const kst = getKstDateAsUtcBase(now);
  return kst.getUTCHours() * 3600 + kst.getUTCMinutes() * 60 + kst.getUTCSeconds();
}
