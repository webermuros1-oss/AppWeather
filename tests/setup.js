import { beforeEach } from "vitest";

// Estado limpio entre tests (localStorage es compartido en jsdom).
beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* no-op */
  }
});
