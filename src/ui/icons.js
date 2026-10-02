/**
 * Render de iconos meteorológicos (Meteocons vía CDN) con respaldo a emoji.
 *
 * Seguridad: el respaldo NO usa `onerror=` inline (lo bloquea la CSP). En su
 * lugar se registra un único listener de `error` en fase de captura sobre el
 * contenedor, que sustituye la imagen rota por su emoji. `alt` va escapado.
 */

import { METEOCONS_CDN } from "../core/config.js";
import { resolveIconName, resolveEmoji } from "../domain/weather-codes.js";
import { escapeHtml } from "../core/dom.js";
import { i18n } from "../i18n/index.js";

/** Etiqueta traducida de un código WMO. */
export function weatherLabel(code) {
  return i18n.wmo(code);
}

/**
 * HTML de un icono meteorológico.
 * @param {number} code
 * @param {boolean|number} isDay
 * @param {number} size px
 * @returns {string}
 */
export function meteoconImg(code, isDay = 1, size = 64) {
  const name = resolveIconName(code, isDay);
  const label = escapeHtml(i18n.wmo(code));
  const w = Number.parseInt(size, 10) || 64;
  return (
    `<span class="wxIcon" style="display:inline-flex;overflow:hidden;width:${w}px;height:${w}px;flex-shrink:0;vertical-align:middle">` +
    `<img src="${METEOCONS_CDN}/${name}.svg" data-wx-code="${code}" width="${w}" height="${w}" alt="${label}" loading="lazy" style="width:100%;height:100%;object-fit:contain">` +
    `</span>`
  );
}

export function meteoconSmall(code, isDay = 1) {
  return meteoconImg(code, isDay, 48);
}

/**
 * Registra (una sola vez por contenedor) el respaldo a emoji para iconos rotos.
 * @param {Element|null} root
 */
export function wireIconFallbacks(root) {
  if (!root || root.__wxWired) return;
  root.__wxWired = true;
  root.addEventListener(
    "error",
    (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || !img.hasAttribute("data-wx-code")) return;
      const code = Number(img.getAttribute("data-wx-code"));
      const w = Number(img.getAttribute("width")) || 48;
      const span = document.createElement("span");
      span.style.cssText = `font-size:${Math.round(w * 0.8)}px;display:inline-flex;align-items:center;justify-content:center;width:${w}px;height:${w}px`;
      span.textContent = resolveEmoji(code);
      img.replaceWith(span);
    },
    true, // captura: los eventos `error` no burbujean
  );
}
