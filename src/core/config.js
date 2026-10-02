/**
 * Configuración central de la aplicación.
 * Todas las APIs son gratuitas y sin clave (keyless). No hay secretos en el cliente.
 */

export const API_URLS = Object.freeze({
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  weather: "https://api.open-meteo.com/v1/forecast",
  marine: "https://marine-api.open-meteo.com/v1/marine",
  airQuality: "https://air-quality-api.open-meteo.com/v1/air-quality",
  reverseGeoPrecise: "https://nominatim.openstreetmap.org/reverse",
  reverseGeoFallback: "https://api.bigdatacloud.net/data/reverse-geocode-client",
});

/** CDN de iconos meteorológicos animados (Meteocons). */
export const METEOCONS_CDN = "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg";

/** Tiempo máximo (ms) para peticiones de red antes de abortar. */
export const REQUEST_TIMEOUT_MS = 12000;

/** Número máximo de ciudades favoritas almacenadas. */
export const MAX_FAVORITES = 4;

/** Claves de localStorage (namespaced para evitar colisiones). */
export const STORAGE_KEYS = Object.freeze({
  favorites: "pw_fav_cities",
  lastCity: "pw_last_city",
  lang: "pw_lang",
});

/** Nombres de eventos del bus de la app (CustomEvent sobre `document`). */
export const APP_EVENTS = Object.freeze({
  citySelected: "citySelected",
  langChanged: "langChanged",
});

/** Idioma por defecto cuando no hay preferencia guardada. */
export const DEFAULT_LANG = "es";
