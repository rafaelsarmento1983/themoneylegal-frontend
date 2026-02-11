// src/lib/toastFlags.ts
const KEY = "toast:session-expired";

export const sessionExpiredFlag = {
  set(message?: string) {
    localStorage.setItem(KEY, message ?? "Como você não estava aqui, desconectamos sua conta.");
  },
  get(): string | null {
    return localStorage.getItem(KEY);
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};
