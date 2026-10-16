import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  tone: 'info' | 'success' | 'warning';
  action?: { label: string; onPress: () => void };
}

interface UiState {
  toasts: Toast[];
  showToast: (message: string, opts?: Partial<Omit<Toast, 'id' | 'message'>> & { duration?: number }) => void;
  dismissToast: (id: number) => void;
}

let nextId = 1;

export const useUi = create<UiState>((set, get) => ({
  toasts: [],
  showToast: (message, opts = {}) => {
    const id = nextId++;
    const toast: Toast = { id, message, tone: opts.tone ?? 'info', action: opts.action };
    set({ toasts: [...get().toasts.slice(-2), toast] });
    setTimeout(() => get().dismissToast(id), opts.duration ?? (opts.action ? 6000 : 3200));
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = (message: string, opts?: Parameters<UiState['showToast']>[1]) =>
  useUi.getState().showToast(message, opts);
