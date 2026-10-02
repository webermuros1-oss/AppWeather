/**
 * Servicio marítimo (Open-Meteo Marine API).
 * No todas las ubicaciones tienen datos (solo costa/océano): ante error o
 * respuesta no-ok devuelve `{ hasMarineData: false }` en lugar de lanzar.
 */

import { API_URLS } from "../core/config.js";
import { buildUrl, fetchJson } from "../core/http.js";

const MARINE_FIELDS =
  "wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity,ocean_current_direction";

/**
 * @param {number} lat
 * @param {number} lon
 * @param {{ hourly?: string }} [opts] campos horarios extra (para gráficas)
 * @returns {Promise<{hasMarineData:boolean, marine?:object, hourly?:object}>}
 */
export async function fetchMarine(lat, lon, opts = {}) {
  try {
    const url = buildUrl(API_URLS.marine, {
      latitude: lat,
      longitude: lon,
      current: MARINE_FIELDS,
      hourly: opts.hourly,
      timezone: "auto",
    });
    const data = await fetchJson(url);
    if (!data?.current) return { hasMarineData: false };
    return { hasMarineData: true, marine: data.current, hourly: data.hourly };
  } catch {
    return { hasMarineData: false };
  }
}
