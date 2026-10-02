/**
 * Controlador de internacionalización (singleton).
 * Lee/persiste el idioma en localStorage y notifica cambios por el bus de eventos.
 */

import { DEFAULT_LANG, STORAGE_KEYS } from "../core/config.js";
import { emitLangChanged } from "../core/events.js";
import { TRANSLATIONS, AVAILABLE_LANGS } from "./translations.js";

function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.lang);
    return stored && TRANSLATIONS[stored] ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export const i18n = {
  _lang: readStoredLang(),

  get lang() {
    return this._lang;
  },

  set lang(code) {
    if (!TRANSLATIONS[code] || code === this._lang) return;
    this._lang = code;
    try {
      localStorage.setItem(STORAGE_KEYS.lang, code);
    } catch {
      /* almacenamiento no disponible: seguimos en memoria */
    }
    if (typeof document !== "undefined") document.documentElement.lang = code;
    emitLangChanged(code);
  },

  /** Traduce una clave; cae a español y por último a la propia clave. */
  t(key) {
    return TRANSLATIONS[this._lang]?.[key] ?? TRANSLATIONS[DEFAULT_LANG]?.[key] ?? key;
  },

  /** Descripción traducida de un código WMO. */
  wmo(code) {
    return TRANSLATIONS[this._lang]?.wmo?.[code] ?? TRANSLATIONS[DEFAULT_LANG]?.wmo?.[code] ?? "—";
  },

  days() {
    return this.t("days");
  },

  months() {
    return this.t("months");
  },

  availableLangs() {
    return AVAILABLE_LANGS;
  },
};

// Sincroniza el atributo lang del documento al cargar.
if (typeof document !== "undefined") document.documentElement.lang = i18n.lang;
