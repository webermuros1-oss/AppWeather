/**
 * Servicio de calidad del aire (Open-Meteo Air Quality API).
 */

import { API_URLS } from "../core/config.js";
import { buildUrl, fetchJson } from "../core/http.js";

const CURRENT_FIELDS =
  "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi";

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{hasData:boolean, current?:object}>}
 */
export async function fetchAirQuality(lat, lon) {
  const url = buildUrl(API_URLS.airQuality, {
    latitude: lat,
    longitude: lon,
    current: CURRENT_FIELDS,
    hourly: "pm10,pm2_5,european_aqi",
    timezone: "auto",
  });
  const data = await fetchJson(url);
  if (!data?.current) return { hasData: false };
  return { hasData: true, current: data.current };
}
