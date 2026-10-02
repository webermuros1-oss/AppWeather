/**
 * Mapeo de códigos WMO (World Meteorological Organization) usados por
 * Open-Meteo a: nombre de icono Meteocons (día/noche) y emoji de respaldo.
 *
 * Lógica pura y determinista → fácilmente testeable.
 */

/** code -> { day, night } nombre de icono Meteocons */
export const WMO_ICONS = Object.freeze({
  0: { day: "clear-day", night: "clear-night" },
  1: { day: "partly-cloudy-day", night: "partly-cloudy-night" },
  2: { day: "partly-cloudy-day", night: "partly-cloudy-night" },
  3: { day: "overcast", night: "overcast-night" },
  45: { day: "fog", night: "fog-night" },
  48: { day: "fog", night: "fog-night" },
  51: { day: "drizzle", night: "drizzle" },
  53: { day: "drizzle", night: "drizzle" },
  55: { day: "drizzle", night: "drizzle" },
  61: { day: "rain", night: "rain" },
  63: { day: "rain", night: "rain" },
  65: { day: "extreme-rain", night: "extreme-rain" },
  71: { day: "snow", night: "snow" },
  73: { day: "snow", night: "snow" },
  75: { day: "extreme-snow", night: "extreme-snow" },
  77: { day: "hail", night: "hail" },
  80: { day: "partly-cloudy-day-rain", night: "partly-cloudy-night-rain" },
  81: { day: "rain", night: "rain" },
  82: { day: "extreme-rain", night: "extreme-rain" },
  85: { day: "snow", night: "snow" },
  86: { day: "extreme-snow", night: "extreme-snow" },
  95: { day: "thunderstorms", night: "thunderstorms-night" },
  96: { day: "thunderstorms-rain", night: "thunderstorms-night-rain" },
  99: { day: "thunderstorms-rain", night: "thunderstorms-night-rain" },
});

/** code -> emoji (fallback cuando el CDN de iconos no carga) */
export const WMO_EMOJI = Object.freeze({
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "❄️", 77: "🌨️", 80: "🌦️", 81: "🌧️", 82: "🌧️",
  85: "🌨️", 86: "❄️", 95: "⛈️", 96: "⛈️", 99: "⛈️",
});

/**
 * Nombre del icono Meteocons para un código WMO.
 * @param {number} code
 * @param {boolean|number} isDay
 * @returns {string}
 */
export function resolveIconName(code, isDay = 1) {
  const entry = WMO_ICONS[code] ?? { day: "not-available", night: "not-available" };
  return isDay ? entry.day : entry.night;
}

/**
 * Emoji de respaldo para un código WMO.
 * @param {number} code
 * @returns {string}
 */
export function resolveEmoji(code) {
  return WMO_EMOJI[code] ?? "🌡️";
}
