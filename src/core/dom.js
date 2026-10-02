/**
 * Utilidades de DOM seguro.
 *
 * El motivo principal es la seguridad: la app construye HTML con datos que
 * provienen de APIs externas y de la entrada del usuario (nombres de ciudad,
 * calles del geocoding inverso...). Interpolar esos valores directamente en
 * `innerHTML` abre una vía de XSS. `escapeHtml` neutraliza esa superficie.
 */

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

/**
 * Escapa una cadena para insertarla de forma segura dentro de HTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"'`]/g, (ch) => HTML_ESCAPES[ch]);
}

/**
 * Tag de plantilla que escapa automáticamente las interpolaciones.
 * Uso: `safeHtml`<p>${nombreCiudad}</p>``  → el nombre queda escapado.
 * Para insertar HTML ya confiable, envuélvelo con `raw()`.
 * @returns {string}
 */
export function safeHtml(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    if (i === 0) return str;
    const value = values[i - 1];
    const rendered = value instanceof RawHtml ? value.value : escapeHtml(value);
    return acc + rendered + str;
  }, "");
}

class RawHtml {
  constructor(value) {
    this.value = String(value ?? "");
  }
}

/** Marca una cadena como HTML ya confiable para `safeHtml`. */
export function raw(value) {
  return new RawHtml(value);
}

/**
 * Asigna texto de forma segura (nunca interpreta HTML).
 * @param {Element|null} el
 * @param {unknown} text
 */
export function setText(el, text) {
  if (el) el.textContent = text === null || text === undefined ? "" : String(text);
}

/** `document.querySelector` acotado y tolerante a nulos. */
export function qs(selector, root = document) {
  return root ? root.querySelector(selector) : null;
}

/** `querySelectorAll` como array. */
export function qsa(selector, root = document) {
  return root ? Array.from(root.querySelectorAll(selector)) : [];
}
