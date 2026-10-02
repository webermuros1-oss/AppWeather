import { describe, it, expect } from "vitest";
import { beaufort, cardinal8Index, cardinal16 } from "../../src/domain/wind.js";

describe("beaufort", () => {
  it("devuelve 0 para calma o valores no válidos", () => {
    expect(beaufort(0)).toBe(0);
    expect(beaufort(-5)).toBe(0);
    expect(beaufort(NaN)).toBe(0);
  });

  it("clasifica correctamente los umbrales", () => {
    expect(beaufort(3)).toBe(1); // <6
    expect(beaufort(10)).toBe(2); // <12
    expect(beaufort(25)).toBe(4); // <29
    expect(beaufort(117)).toBe(11); // <118
  });

  it("satura a 12 (huracán)", () => {
    expect(beaufort(118)).toBe(12);
    expect(beaufort(300)).toBe(12);
  });
});

describe("cardinal8Index", () => {
  it("mapea grados a uno de los 8 sectores", () => {
    expect(cardinal8Index(0)).toBe(0); // N
    expect(cardinal8Index(45)).toBe(1); // NE
    expect(cardinal8Index(90)).toBe(2); // E
    expect(cardinal8Index(360)).toBe(0); // vuelve a N
  });

  it("tolera valores ausentes", () => {
    expect(cardinal8Index(null)).toBe(0);
    expect(cardinal8Index(undefined)).toBe(0);
  });
});

describe("cardinal16", () => {
  it("devuelve puntos cardinales de 16 direcciones", () => {
    expect(cardinal16(0)).toBe("N");
    expect(cardinal16(90)).toBe("E");
    expect(cardinal16(180)).toBe("S");
    expect(cardinal16(270)).toBe("O");
  });
});
