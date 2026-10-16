import { checkPin, grownUpQuestion, hashPin, isValidPin } from './pin';

jest.mock('expo-crypto', () => {
  const { createHash } = jest.requireActual('crypto');
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    digestStringAsync: async (_alg: string, s: string) => createHash('sha256').update(s).digest('hex'),
  };
});

describe('carer PIN', () => {
  it('accepts exactly four digits', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('12a4')).toBe(false);
  });

  it('checks a PIN against its stored hash', async () => {
    const hash = await hashPin('2580');
    expect(hash).not.toContain('2580');
    expect(await checkPin('2580', hash)).toBe(true);
    expect(await checkPin('0000', hash)).toBe(false);
    expect(await checkPin('2580', null)).toBe(false);
  });

  it('asks a sum with a two-digit answer', () => {
    for (const r of [0, 0.3, 0.99]) {
      const q = grownUpQuestion(() => r);
      expect(q.answer).toBe(q.a + q.b);
      expect(q.answer).toBeGreaterThanOrEqual(12);
      expect(q.answer).toBeLessThanOrEqual(18);
    }
  });
});
