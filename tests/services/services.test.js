import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchWeather } from "../../src/services/weather-service.js";
import { fetchMarine } from "../../src/services/marine-service.js";
import { searchCities, geocodeCity } from "../../src/services/geocoding-service.js";

function stubFetch(payload, ok = true, status = 200) {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok, status, json: async () => payload })));
}

afterEach(() => vi.unstubAllGlobals());

describe("weather-service", () => {
  it("normaliza la respuesta cruda de Open-Meteo", async () => {
    stubFetch({
      current: { temperature_2m: 18.4, weather_code: 3, is_day: 1, wind_speed_10m: 12 },
      daily: { time: ["2026-10-02"] },
      hourly: { time: ["2026-10-02T12:00"] },
    });
    const w = await fetchWeather(43.37, -8.4);
    expect(w.temperature).toBe(18.4);
    expect(w.weatherCode).toBe(3);
    expect(w.isDay).toBe(1);
    expect(w.windSpeed).toBe(12);
    expect(w.dailyForecast).toBeDefined();
    expect(w.hourlyForecast).toBeDefined();
  });
});

describe("marine-service", () => {
  it("marca hasMarineData=true cuando hay datos", async () => {
    stubFetch({ current: { wave_height: 1.2 } });
    const m = await fetchMarine(43.37, -8.4);
    expect(m.hasMarineData).toBe(true);
    expect(m.marine.wave_height).toBe(1.2);
  });

  it("devuelve hasMarineData=false ante error (no lanza)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 400, json: async () => ({}) })));
    const m = await fetchMarine(0, 0);
    expect(m.hasMarineData).toBe(false);
  });
});

describe("geocoding-service", () => {
  it("no llama a la API con menos de 2 caracteres", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect(await searchCities("a", "es")).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("devuelve la primera coincidencia con geocodeCity", async () => {
    stubFetch({ results: [{ name: "Madrid", latitude: 40.4, longitude: -3.7 }] });
    const city = await geocodeCity("Madrid", "es");
    expect(city.name).toBe("Madrid");
  });

  it("devuelve null si no hay resultados", async () => {
    stubFetch({ results: [] });
    expect(await geocodeCity("xyzxyz", "es")).toBeNull();
  });
});
