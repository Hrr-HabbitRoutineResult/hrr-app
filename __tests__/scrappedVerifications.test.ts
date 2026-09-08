import { apiClient } from '../src/libs/api/client';
import { getScrappedVerifications } from '../src/libs/api/user';

jest.mock('../src/libs/api/client', () => ({
  apiClient: { get: jest.fn() },
}));

const get = jest.mocked(apiClient.get);
const emptyPage = {
  content: [], currentPage: 1, size: 20,
  hasNext: false, first: true, last: true,
};

beforeEach(() => get.mockReset());

it.each(['CAMERA', 'TEXT'] as const)(
  'uses the authenticated-user endpoint and accepts an empty %s page',
  async type => {
    get.mockResolvedValue({ status: 200, data: { isSuccess: true, result: emptyPage } });
    await expect(getScrappedVerifications(type)).resolves.toEqual(emptyPage);
    expect(get).toHaveBeenCalledWith('/api/v1/user/me/verifications/scrap', {
      params: { type, page: 1, size: 20 },
    });
  },
);

it('preserves the documented scrap fields and pagination', async () => {
  const page = {
    ...emptyPage, currentPage: 2, first: false, last: false, hasNext: true,
    content: [{ verificationId: 10, type: 'TEXT', imageUrl: null,
      createdDate: '2026.09.08', hasLink: true }],
  };
  get.mockResolvedValue({ status: 200, data: { isSuccess: true, result: page } });
  await expect(getScrappedVerifications('TEXT', 2, 20)).resolves.toBe(page);
  expect(get).toHaveBeenCalledWith('/api/v1/user/me/verifications/scrap', {
    params: { type: 'TEXT', page: 2, size: 20 },
  });
});

it('rejects an application error even when HTTP succeeds', async () => {
  get.mockResolvedValue({ status: 200, data: {
    isSuccess: false, message: '조회 실패', result: null,
  } });
  await expect(getScrappedVerifications('CAMERA')).rejects.toThrow('조회 실패');
});

it('preserves an HTTP failure instead of returning an empty list', async () => {
  const error = { response: { status: 401, data: { code: 'AUTH001' } } };
  get.mockRejectedValue(error);
  await expect(getScrappedVerifications('TEXT')).rejects.toBe(error);
});
