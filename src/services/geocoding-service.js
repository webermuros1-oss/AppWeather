/**
 * Servicio de geocodificación (Open-Meteo Geocoding API).
 * El nombre de ciudad se escapa en la URL con `URLSearchParams` (buildUrl),
 * evitando inyección en la query.
 */

import { API_URLS } from "../core/config.js";
import { buildUrl, fetchJson } from "../core/http.js";

/**
 * Busca varias coincidencias (para el autocompletado).
 * @param {string} query
 * @param {string} lang
 * @param {number} [count]
 * @returns {Promise<Array<object>>}
 */
export async function searchCities(query, lang, count = 6) {
  const trimmed = (query ?? "").trim();
  if (trimmed.length < 2) return [];
  const url = buildUrl(API_URLS.geocoding, {
    name: trimmed,
    count,
    language: lang,
    format: "json",
  });
  const data = await fetchJson(url);
  return data.results ?? [];
}

/**
 * Devuelve la primera coincidencia o `null`.
 * @param {string} query
 * @param {string} lang
 * @returns {Promise<object|null>}
 */
export async function geocodeCity(query, lang) {
  const results = await searchCities(query, lang, 1);
  return results[0] ?? null;
}
