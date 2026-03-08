// ─── Chaves ───────────────────────────────────────────────────────────────────
export const KEY_ITEMS        = "wl:items";
export const KEY_RESERVATIONS = "wl:reservations";
export const KEY_SETTINGS     = "wl:settings";

// ─── Adapter (window.storage em Claude.ai, localStorage no browser) ───────────
export const storage = {
  get: async (key) => {
    if (window.storage?.get) {
      const result = await window.storage.get(key, true).catch(() => null);
      return result ? { value: result.value } : null;
    }
    const value = localStorage.getItem(key);
    return value ? { value } : null;
  },

  set: async (key, value) => {
    if (window.storage?.set) {
      await window.storage.set(key, value, true).catch(() => {});
    } else {
      localStorage.setItem(key, value);
    }
  },
};
