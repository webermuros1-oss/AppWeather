import { describe, it, expect } from "vitest";
import { weatherCategory, pickBackgroundImage, BACKGROUND_IMAGES } from "../../src/domain/backgrounds.js";

describe("weatherCategory", () => {
  it("clasifica los códigos WMO en categorías de fondo", () => {
    expect(weatherCategory(0)).toBe("sunny");
    expect(weatherCategory(2)).toBe("cloudy");
    expect(weatherCategory(61)).toBe("rainy");
    expect(weatherCategory(73)).toBe("snowy");
    expect(weatherCategory(95)).toBe("stormy");
    expect(weatherCategory(45)).toBe("foggy");
  });

  it("usa 'default' para código desconocido o nulo", () => {
    expect(weatherCategory(9999)).toBe("default");
    expect(weatherCategory(null)).toBe("default");
  });
});

describe("pickBackgroundImage", () => {
  it("elige del set diurno o nocturno", () => {
    const rand = () => 0; // primer elemento
    expect(pickBackgroundImage(0, 1, rand)).toBe(BACKGROUND_IMAGES.day.sunny[0]);
    expect(pickBackgroundImage(0, 0, rand)).toBe(BACKGROUND_IMAGES.night.sunny[0]);
  });

  it("devuelve un nombre de imagen válido de la categoría", () => {
    const img = pickBackgroundImage(61, 1, () => 0.99);
    expect(BACKGROUND_IMAGES.day.rainy).toContain(img);
  });
});
