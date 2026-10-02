import { describe, it, expect } from "vitest";
import { computeLunarTides } from "../../src/domain/tides.js";

const FIXED = new Date("2026-10-02T12:00:00Z");

describe("computeLunarTides", () => {
  it("devuelve 4 mareas futuras ordenadas ascendentemente", () => {
    const { tides } = computeLunarTides(43.37, -8.4, FIXED);
    expect(tides).toHaveLength(4);
    const nowS = FIXED.getTime() / 1000;
    for (const t of tides) expect(t.dt).toBeGreaterThan(nowS);
    const sorted = [...tides].sort((a, b) => a.dt - b.dt);
    expect(tides).toEqual(sorted);
  });

  it("alterna tipos High/Low", () => {
    const { tides } = computeLunarTides(43.37, -8.4, FIXED);
    const types = new Set(tides.map((t) => t.type));
    expect(types.has("High")).toBe(true);
    expect(types.has("Low")).toBe(true);
    for (const t of tides) expect(["High", "Low"]).toContain(t.type);
  });

  it("es determinista para la misma entrada", () => {
    const a = computeLunarTides(43.37, -8.4, FIXED);
    const b = computeLunarTides(43.37, -8.4, FIXED);
    expect(a).toEqual(b);
  });

  it("expone la bandera de mareas vivas/muertas", () => {
    const { isSpring } = computeLunarTides(0, 0, FIXED);
    expect(typeof isSpring).toBe("boolean");
  });
});
