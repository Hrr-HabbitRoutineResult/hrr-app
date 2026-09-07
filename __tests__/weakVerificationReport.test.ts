import { apiClient } from '../src/libs/api/client';
import { reportWeakVerification } from '../src/libs/api/challenge';

jest.mock('../src/libs/api/client', () => ({
  apiClient: { post: jest.fn() },
}));

const post = jest.mocked(apiClient.post);

beforeEach(() => post.mockReset());

it('uses the existing weak-report query without a reason body', async () => {
  post.mockResolvedValue({ data: { isSuccess: true } });
  await expect(reportWeakVerification(42)).resolves.toBeUndefined();
  expect(post).toHaveBeenCalledWith('/api/v1/report/verification/weak?targetId=42');
});

it('preserves the duplicate code when HTTP succeeds but the API rejects', async () => {
  const data = {
    isSuccess: false,
    code: 'VERIFICATION40919',
    message: 'Server message may change',
  };
  post.mockResolvedValue({ status: 200, data });
  await expect(reportWeakVerification(42)).rejects.toMatchObject({
    response: { status: 200, data },
  });
});

it.each(['VERIFICATION40919', 'VERIFICATION409110', 'COMMON500'])(
  'preserves HTTP error details for %s',
  async code => {
    const error = { response: { status: 409, data: { code } } };
    post.mockRejectedValue(error);
    await expect(reportWeakVerification(42)).rejects.toBe(error);
  },
);
