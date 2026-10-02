import { describe, it, expect } from "vitest";
import { FavoritesManager } from "../../src/state/favorites.js";

const CITY_A = { name: "A Coruña", country: "ES", latitude: 43.37, longitude: -8.4 };
const CITY_B = { name: "Madrid", country: "ES", latitude: 40.42, longitude: -3.7 };
const CITY_C = { name: "Lisboa", country: "PT", latitude: 38.72, longitude: -9.14 };

describe("FavoritesManager", () => {
  it("añade ciudades válidas y rechaza inválidas", () => {
    const fm = new FavoritesManager();
    expect(fm.addCity(CITY_A)).toBe(true);
    expect(fm.getCount()).toBe(1);
    expect(fm.addCity({ name: "Mala" })).toBe(false); // sin coordenadas
    expect(fm.addCity({ latitude: 1, longitude: 2 })).toBe(false); // sin nombre
    expect(fm.getCount()).toBe(1);
  });

  it("deduplica por nombre y reordena al final", () => {
    const fm = new FavoritesManager();
    fm.addCity(CITY_A);
    fm.addCity(CITY_B);
    fm.addCity(CITY_A); // vuelve a añadir A → debe quedar al final, sin duplicar
    expect(fm.getCount()).toBe(2);
    expect(fm.getCurrentCity().name).toBe("A Coruña");
  });

  it("respeta el máximo (descarta la más antigua)", () => {
    const fm = new FavoritesManager(2);
    fm.addCity(CITY_A);
    fm.addCity(CITY_B);
    fm.addCity(CITY_C);
    expect(fm.getCount()).toBe(2);
    expect(fm.getAllCities().map((c) => c.name)).toEqual(["Madrid", "Lisboa"]);
  });

  it("navega circularmente entre favoritos", () => {
    const fm = new FavoritesManager();
    fm.addCity(CITY_A);
    fm.addCity(CITY_B);
    // índice actual = 1 (Madrid)
    expect(fm.goToNext().name).toBe("A Coruña"); // da la vuelta
    expect(fm.goToPrevious().name).toBe("Madrid");
  });

  it("persiste y recarga desde el almacenamiento", () => {
    const fm1 = new FavoritesManager();
    fm1.addCity(CITY_A);
    fm1.addCity(CITY_B);
    const fm2 = new FavoritesManager();
    expect(fm2.getCount()).toBe(2);
    expect(fm2.getCurrentCity().name).toBe("Madrid"); // lastCity
  });

  it("tolera almacenamiento corrupto", () => {
    localStorage.setItem("pw_fav_cities", "{ no es json válido");
    const fm = new FavoritesManager();
    expect(fm.getAllCities()).toEqual([]);
  });
});
