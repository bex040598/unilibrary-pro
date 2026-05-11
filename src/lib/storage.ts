const memory = new Map<string, string>();

export const STORAGE_KEYS = {
  app: "unilibrary_pro_state",
  language: "unilibrary_language"
} as const;

export const storageShim = {
  getItem: (name: string) => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(name);
    }

    return memory.get(name) ?? null;
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(name, value);
      return;
    }

    memory.set(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(name);
      return;
    }

    memory.delete(name);
  }
};
