import { describe, it, expect } from "vitest";
import { aqiInfo } from "../../src/domain/air-quality.js";

describe("aqiInfo", () => {
  it("asigna el nivel correcto según el AQI europeo", () => {
    expect(aqiInfo(10).level).toBe(0);
    expect(aqiInfo(30).level).toBe(1);
    expect(aqiInfo(50).level).toBe(2);
    expect(aqiInfo(70).level).toBe(3);
    expect(aqiInfo(90).level).toBe(4);
    expect(aqiInfo(120).level).toBe(5);
    expect(aqiInfo(200).level).toBe(6);
  });

  it("incluye clase CSS y emoji", () => {
    const info = aqiInfo(10);
    expect(info.cls).toBe("aqi-good");
    expect(typeof info.emoji).toBe("string");
  });

  it("trata valores no finitos como 0", () => {
    expect(aqiInfo(NaN).level).toBe(0);
  });
});
