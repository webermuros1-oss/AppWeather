import { describe, it, expect } from "vitest";
import { resolveIconName, resolveEmoji } from "../../src/domain/weather-codes.js";

describe("resolveIconName", () => {
  it("distingue día y noche", () => {
    expect(resolveIconName(0, 1)).toBe("clear-day");
    expect(resolveIconName(0, 0)).toBe("clear-night");
  });

  it("usa 'not-available' para códigos desconocidos", () => {
    expect(resolveIconName(1234, 1)).toBe("not-available");
  });
});

describe("resolveEmoji", () => {
  it("devuelve el emoji correcto", () => {
    expect(resolveEmoji(0)).toBe("☀️");
    expect(resolveEmoji(95)).toBe("⛈️");
  });

  it("cae a termómetro si el código es desconocido", () => {
    expect(resolveEmoji(1234)).toBe("🌡️");
  });
});
