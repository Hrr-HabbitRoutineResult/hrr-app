import { useCallback, useRef, useState } from 'react';

type Reaction = { selected: boolean; count: number };
type ToggleResult = { selected: boolean; count?: number | null };

const readSelected = (value: unknown): boolean => {
  if (typeof value !== 'boolean') {
    throw new Error('좋아요/스크랩 상태 응답이 올바르지 않습니다.');
  }
  return value;
};

const readCount = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('좋아요/스크랩 카운트 응답이 올바르지 않습니다.');
  }
  return value;
};

/** 상세 조회로 초기화하고, 성공한 토글만 선택 상태와 카운트에 함께 반영한다. */
export const useVerificationReaction = () => {
  const [reaction, setReaction] = useState<Reaction>({ selected: false, count: 0 });
  const [pending, setPending] = useState(false);
  const current = useRef<Reaction | null>(null);
  const inFlight = useRef(false);

  const sync = useCallback((selected: boolean, count: number) => {
    const next = { selected: readSelected(selected), count: readCount(count) };
    current.current = next;
    setReaction(next);
  }, []);

  const toggle = useCallback(async (request: (selected: boolean) => Promise<ToggleResult>) => {
    // React가 disabled를 반영하기 전 같은 프레임의 추가 탭도 차단한다.
    if (inFlight.current || !current.current) return;
    inFlight.current = true;
    setPending(true);
    const previous = current.current;

    try {
      const result = await request(previous.selected);
      const selected = readSelected(result.selected);
      const count = result.count == null
        ? Math.max(0, previous.count + Number(selected) - Number(previous.selected))
        : readCount(result.count);
      const next = { selected, count };

      // 응답에 카운트가 있으면 서버 값을 우선한다. 없을 때만 실제 상태 차이를 적용한다.
      // ref도 즉시 갱신해 다음 탭이 이전 render의 selected 값을 사용하지 않게 한다.
      current.current = next;
      setReaction(next);
    } finally {
      // 실패 시 reaction을 변경하지 않아 기존 아이콘과 카운트가 유지된다.
      inFlight.current = false;
      setPending(false);
    }
  }, []);

  return { ...reaction, pending, sync, toggle };
};
