import { describe, it, expect } from "vitest";
import { uvLevelIndex } from "../../src/domain/uv.js";

describe("uvLevelIndex", () => {
  it("devuelve 0 para ausente/cero/negativo", () => {
    expect(uvLevelIndex(0)).toBe(0);
    expect(uvLevelIndex(null)).toBe(0);
    expect(uvLevelIndex(-1)).toBe(0);
  });

  it("clasifica por tramos estándar", () => {
    expect(uvLevelIndex(2)).toBe(1); // bajo
    expect(uvLevelIndex(5)).toBe(2); // moderado
    expect(uvLevelIndex(7)).toBe(3); // alto
    expect(uvLevelIndex(10)).toBe(4); // muy alto
    expect(uvLevelIndex(11)).toBe(5); // extremo
  });
});
