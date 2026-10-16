/**
 * Carer lock state. When a PIN is set, editing and Settings ask for it once,
 * then stay unlocked for a few minutes (or until the app goes to the background).
 */
import { AppState } from 'react-native';
import { create } from 'zustand';

import { useApp } from './app-store';

export const UNLOCK_MS = 5 * 60_000;

export type PinMode = 'enter' | 'set';

interface PinRequest {
  id: number;
  mode: PinMode;
  resolve: (ok: boolean) => void;
}

interface LockState {
  unlocked: boolean;
  request: PinRequest | null;
}

export const useLock = create<LockState>(() => ({ unlocked: false, request: null }));

let expiry: ReturnType<typeof setTimeout> | null = null;
let requestId = 0;

export const isLockOn = () => !!useApp.getState().settings.pinHash;

export function markUnlocked() {
  if (expiry) clearTimeout(expiry);
  useLock.setState({ unlocked: true });
  expiry = setTimeout(lockNow, UNLOCK_MS);
}

/** A grown-up is still busy in a protected screen: restart the unlock timer. */
export function extendUnlock() {
  if (useLock.getState().unlocked) markUnlocked();
}

export function lockNow() {
  if (expiry) clearTimeout(expiry);
  expiry = null;
  useLock.setState({ unlocked: false });
}

function openPin(mode: PinMode): Promise<boolean> {
  return new Promise((resolve) => {
    useLock.getState().request?.resolve(false);
    useLock.setState({ request: { id: ++requestId, mode, resolve } });
  });
}

/** Resolves true when a change is allowed: no lock, already unlocked, or the PIN was entered. */
export function requireCarer(): Promise<boolean> {
  if (!isLockOn()) return Promise.resolve(true);
  if (useLock.getState().unlocked) {
    markUnlocked(); // keep it unlocked while a grown-up is busy making changes
    return Promise.resolve(true);
  }
  return openPin('enter');
}

/** Runs `fn` only if a change is allowed. */
export async function guarded(fn: () => void | Promise<void>) {
  if (await requireCarer()) await fn();
}

/** Asks for a new PIN twice and saves it. Resolves true when a PIN was saved. */
export function setupPin(): Promise<boolean> {
  return openPin('set');
}

/** Called by the PIN prompt when it closes. */
export function finishPin(ok: boolean) {
  const req = useLock.getState().request;
  useLock.setState({ request: null });
  if (ok) markUnlocked();
  req?.resolve(ok);
}

/** True when a PIN is set and changes are currently locked. */
export function useLocked() {
  const pinOn = useApp((s) => !!s.settings.pinHash);
  const unlocked = useLock((s) => s.unlocked);
  return pinOn && !unlocked;
}

// Lock again when Voca has been in the background for more than a minute. A quick trip to the
// device settings (e.g. to download a voice) does not lock a grown-up out mid-task.
export const BACKGROUND_GRACE_MS = 60_000;
let leftAt: number | null = null;
AppState.addEventListener('change', (state) => {
  if (state === 'background') leftAt = Date.now();
  else if (state === 'active' && leftAt !== null) {
    if (Date.now() - leftAt > BACKGROUND_GRACE_MS) lockNow();
    leftAt = null;
  }
});
