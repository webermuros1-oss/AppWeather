/**
 * Servicio de geolocalización: posición del dispositivo + geocodificación
 * inversa (nombre/calle a partir de coordenadas).
 *
 * Estrategia de reverse-geocoding: Nominatim (OSM) para precisión a nivel de
 * calle y, si falla, BigDataCloud como respaldo. Ambas gratuitas y sin clave.
 */

import { API_URLS } from "../core/config.js";
import { buildUrl, fetchJson } from "../core/http.js";

/**
 * Obtiene la posición actual del dispositivo.
 * @param {PositionOptions} [options]
 * @returns {Promise<{latitude:number, longitude:number}>}
 */
export function getPosition(options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("geolocation-unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      options,
    );
  });
}

/**
 * Geocodificación inversa precisa (Nominatim) con respaldo (BigDataCloud).
 * @param {number} lat
 * @param {number} lon
 * @param {string} lang
 * @returns {Promise<{name:string, country:string, street:string, latitude:number, longitude:number}>}
 */
export async function reverseGeocode(lat, lon, lang = "es") {
  try {
    const url = buildUrl(API_URLS.reverseGeoPrecise, {
      lat,
      lon,
      format: "json",
      addressdetails: 1,
      zoom: 18,
      "accept-language": lang,
    });
    const data = await fetchJson(url, { headers: { "Accept-Language": lang } });
    const a = data.address ?? {};
    const name =
      a.hamlet || a.locality || a.neighbourhood || a.suburb || a.village ||
      a.town || a.city || a.municipality || a.county ||
      (data.display_name ? data.display_name.split(",")[0] : "Mi ubicación");
    const country = a.country_code ? a.country_code.toUpperCase() : (a.country ?? "");
    const street = a.road || a.pedestrian || a.path || a.footway || a.track || "";
    return { name, country, street, latitude: lat, longitude: lon };
  } catch {
    return reverseGeocodeFallback(lat, lon, lang);
  }
}

async function reverseGeocodeFallback(lat, lon, lang) {
  const url = buildUrl(API_URLS.reverseGeoFallback, {
    latitude: lat,
    longitude: lon,
    localityLanguage: lang,
  });
  const data = await fetchJson(url);
  const name = data.city || data.locality || data.principalSubdivision || "Mi ubicación";
  return { name, country: data.countryCode ?? "", street: "", latitude: lat, longitude: lon };
}

/**
 * Posición actual ya resuelta a nombre de lugar.
 * @param {string} lang
 * @returns {Promise<{name:string, country:string, street:string, latitude:number, longitude:number}>}
 */
export async function resolveCurrentLocation(lang = "es") {
  const { latitude, longitude } = await getPosition();
  return reverseGeocode(latitude, longitude, lang);
}
