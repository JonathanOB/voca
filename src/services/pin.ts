/**
 * Carer PIN helpers. The lock is a convenience that stops accidental changes,
 * not a security feature: the PIN is stored as a hash on the device, and a
 * grown-up question lets anyone who forgets it choose a new one offline.
 */
import * as Crypto from 'expo-crypto';

export const PIN_LENGTH = 4;

export const isValidPin = (pin: string) => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);

export function hashPin(pin: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `voca-pin-v1:${pin}`);
}

export async function checkPin(pin: string, hash: string | null) {
  return !!hash && isValidPin(pin) && (await hashPin(pin)) === hash;
}

/** A sum with a two-digit answer: quick for an adult, a small hurdle for a young child. */
export function grownUpQuestion(rand: () => number = Math.random) {
  const a = 6 + Math.floor(rand() * 4);
  const b = 6 + Math.floor(rand() * 4);
  return { a, b, answer: a + b };
}
