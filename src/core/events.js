/**
 * Bus de eventos de la aplicación (pub/sub ligero sobre `document`).
 *
 * Desacopla los componentes (header, footer, páginas) del controlador
 * principal: el buscador emite `citySelected` sin saber quién lo escucha, y el
 * selector de idioma emite `langChanged`. Centralizar aquí evita strings
 * mágicos repartidos por el código.
 */

import { APP_EVENTS } from "./config.js";

/** @param {CustomEventInit} detail */
export function emitCitySelected(detail) {
  document.dispatchEvent(new CustomEvent(APP_EVENTS.citySelected, { detail }));
}

export function onCitySelected(handler) {
  document.addEventListener(APP_EVENTS.citySelected, handler);
  return () => document.removeEventListener(APP_EVENTS.citySelected, handler);
}

export function emitLangChanged(lang) {
  document.dispatchEvent(new CustomEvent(APP_EVENTS.langChanged, { detail: { lang } }));
}

export function onLangChanged(handler) {
  document.addEventListener(APP_EVENTS.langChanged, handler);
  return () => document.removeEventListener(APP_EVENTS.langChanged, handler);
}
