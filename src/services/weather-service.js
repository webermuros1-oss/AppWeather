/**
 * Servicio de meteorología (Open-Meteo Forecast API).
 * Devuelve un objeto normalizado para que la UI no dependa de la forma cruda
 * de la respuesta de la API.
 */

import { API_URLS } from "../core/config.js";
import { buildUrl, fetchJson } from "../core/http.js";

const CURRENT_FIELDS =
  "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,apparent_temperature,precipitation,rain,showers,snowfall,pressure_msl,surface_pressure,cloud_cover,visibility,uv_index,is_day,cape,dew_point_2m";

const HOURLY_FIELDS =
  "temperature_2m,precipitation_probability,weather_code,relative_humidity_2m,precipitation,apparent_temperature,wind_speed_10m,wind_direction_10m,visibility,cloud_cover,dew_point_2m,is_day";

const DAILY_FIELDS =
  "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,rain_sum,snowfall_sum,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant";

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>} datos meteorológicos normalizados
 */
export async function fetchWeather(lat, lon) {
  const url = buildUrl(API_URLS.weather, {
    latitude: lat,
    longitude: lon,
    current: CURRENT_FIELDS,
    hourly: HOURLY_FIELDS,
    daily: DAILY_FIELDS,
    timezone: "auto",
    forecast_days: 7,
  });

  const data = await fetchJson(url);
  const c = data.current ?? {};

  return {
    temperature: c.temperature_2m,
    apparentTemperature: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    dewPoint: c.dew_point_2m,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    windGusts: c.wind_gusts_10m,
    weatherCode: c.weather_code,
    isDay: c.is_day,
    precipitation: c.precipitation,
    rain: c.rain,
    showers: c.showers,
    snowfall: c.snowfall,
    pressure: c.pressure_msl,
    surfacePressure: c.surface_pressure,
    cloudCover: c.cloud_cover,
    visibility: c.visibility,
    uvIndex: c.uv_index,
    cape: c.cape,
    dailyForecast: data.daily,
    hourlyForecast: data.hourly,
  };
}
