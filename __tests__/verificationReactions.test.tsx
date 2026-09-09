import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { useVerificationReaction } from '../src/screens/ChallengeProfile/useVerificationReaction';

let like: ReturnType<typeof useVerificationReaction>;
let scrap: ReturnType<typeof useVerificationReaction>;
let screen: Renderer.ReactTestRenderer;

function Fixture() {
  like = useVerificationReaction();
  scrap = useVerificationReaction();
  return <><Text testID="like-count">{like.count}</Text><Text testID="scrap-count">{scrap.count}</Text></>;
}

beforeEach(async () => {
  await act(async () => { screen = Renderer.create(<Fixture />); });
});
afterEach(async () => { await act(async () => screen.unmount()); });

it('hydrates selected icons and counts from detail and renders zero as text', async () => {
  await act(async () => { like.sync(true, 12); scrap.sync(true, 3); });
  expect([like.selected, like.count, scrap.selected, scrap.count]).toEqual([true, 12, true, 3]);
  await act(async () => { like.sync(false, 0); scrap.sync(false, 0); });
  expect(screen.toJSON()).toEqual(expect.arrayContaining([
    expect.objectContaining({ props: expect.objectContaining({ testID: 'like-count' }), children: ['0'] }),
    expect.objectContaining({ props: expect.objectContaining({ testID: 'scrap-count' }), children: ['0'] }),
  ]));
});

it.each(['like', 'scrap'] as const)('%s supports ON → OFF → ON with count omitted', async kind => {
  const reaction = () => kind === 'like' ? like : scrap;
  await act(async () => reaction().sync(false, 7));
  const request = jest.fn(async selected => ({ selected: !selected }));
  // Reuse the same handler to catch stale closures between successful toggles.
  const toggle = reaction().toggle;
  for (const [selected, count] of [[true, 8], [false, 7], [true, 8]]) {
    await act(async () => { await toggle(request); });
    expect([reaction().selected, reaction().count]).toEqual([selected, count]);
  }
  expect(request.mock.calls.map(([selected]) => selected)).toEqual([false, true, false]);
});

it('prefers authoritative counts, including zero, over the local delta', async () => {
  await act(async () => like.sync(false, 20));
  await act(async () => { await like.toggle(async () => ({ selected: true, count: 30 })); });
  expect([like.selected, like.count]).toEqual([true, 30]);
  await act(async () => { await like.toggle(async () => ({ selected: false, count: 0 })); });
  expect([like.selected, like.count]).toEqual([false, 0]);
});

it('does not increment an already-selected response or produce negative counts', async () => {
  await act(async () => like.sync(true, 0));
  await act(async () => { await like.toggle(async () => ({ selected: true, count: null })); });
  expect([like.selected, like.count]).toEqual([true, 0]);
  await act(async () => { await like.toggle(async () => ({ selected: false })); });
  expect([like.selected, like.count]).toEqual([false, 0]);
});

it.each(['like', 'scrap'] as const)('%s preserves state on failure and allows a retry', async kind => {
  const reaction = () => kind === 'like' ? like : scrap;
  await act(async () => reaction().sync(true, 4));
  await act(async () => {
    await expect(reaction().toggle(async () => { throw new Error('network failed'); })).rejects.toThrow('network failed');
  });
  expect([reaction().selected, reaction().count, reaction().pending]).toEqual([true, 4, false]);
  await act(async () => { await reaction().toggle(async () => ({ selected: false })); });
  expect([reaction().selected, reaction().count]).toEqual([false, 3]);
});

it.each(['like', 'scrap'] as const)('%s issues one request for eight taps during a pending response', async kind => {
  const reaction = () => kind === 'like' ? like : scrap;
  await act(async () => reaction().sync(false, 0));
  let resolve!: (result: { selected: boolean }) => void;
  const request = jest.fn(() => new Promise<{ selected: boolean }>(done => { resolve = done; }));
  let requests!: Promise<void>[];
  await act(async () => { requests = Array.from({ length: 8 }, () => reaction().toggle(request)); });
  expect(request).toHaveBeenCalledTimes(1);
  expect(reaction().pending).toBe(true);
  await act(async () => { resolve({ selected: true }); await Promise.all(requests); });
  expect([reaction().selected, reaction().count, reaction().pending]).toEqual([true, 1, false]);
});

it('keeps simultaneous like and scrap responses independent', async () => {
  await act(async () => { like.sync(false, 2); scrap.sync(false, 9); });
  await act(async () => {
    await Promise.all([
      like.toggle(async () => ({ selected: true })),
      scrap.toggle(async () => ({ selected: true })),
    ]);
  });
  expect([like.selected, like.count, scrap.selected, scrap.count]).toEqual([true, 3, true, 10]);
});

it('rejects invalid detail and toggle fields instead of storing undefined or replacing them with zero', async () => {
  await act(async () => like.sync(false, 4));
  expect(() => like.sync(true, undefined as any)).toThrow('카운트');
  for (const result of [{ selected: undefined }, { selected: true, count: -1 }, { selected: true, count: NaN }]) {
    await act(async () => { await expect(like.toggle(async () => result as any)).rejects.toThrow(); });
    expect([like.selected, like.count, like.pending]).toEqual([false, 4, false]);
  }
});

it('does not toggle before the detail response initializes state', async () => {
  const request = jest.fn(async () => ({ selected: true }));
  await act(async () => { await like.toggle(request); });
  expect(request).not.toHaveBeenCalled();
});
