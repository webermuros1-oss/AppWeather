/**
 * Cliente HTTP central.
 *
 * Añade sobre `fetch`:
 *  - Timeout con AbortController (evita peticiones colgadas indefinidamente).
 *  - Manejo homogéneo de errores (lanza `HttpError` con status).
 *  - Parseo JSON seguro.
 *
 * Mantener el acceso a red en un único punto facilita testear, cachear y
 * aplicar políticas (timeouts, cabeceras) de forma consistente.
 */

import { REQUEST_TIMEOUT_MS } from "./config.js";

export class HttpError extends Error {
  constructor(message, { status = 0, url = "" } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
  }
}

/**
 * Construye una URL con query params de forma segura.
 * @param {string} base
 * @param {Record<string, string|number>} params
 * @returns {string}
 */
export function buildUrl(base, params = {}) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * Realiza una petición y devuelve el JSON parseado.
 * @param {string} url
 * @param {{ timeout?: number, headers?: Record<string,string>, signal?: AbortSignal }} [options]
 * @returns {Promise<any>}
 */
export async function fetchJson(url, options = {}) {
  const { timeout = REQUEST_TIMEOUT_MS, headers = {}, signal } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  // Permite abortos externos además del timeout interno.
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      throw new HttpError(`HTTP ${response.status} al pedir ${url}`, {
        status: response.status,
        url,
      });
    }
    return await response.json();
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (err?.name === "AbortError") {
      throw new HttpError(`Tiempo de espera agotado (${timeout} ms): ${url}`, { url });
    }
    throw new HttpError(`Error de red: ${err?.message ?? err}`, { url });
  } finally {
    clearTimeout(timer);
  }
}
