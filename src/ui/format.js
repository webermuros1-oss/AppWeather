/**
 * Formateadores de presentación que combinan lógica de dominio pura con las
 * etiquetas traducidas (i18n). Mantener esto separado del dominio evita acoplar
 * los cálculos a los textos.
 */

import { i18n } from "../i18n/index.js";
import { cardinal8Index } from "../domain/wind.js";
import { uvLevelIndex } from "../domain/uv.js";

/** Dirección del viento entre paréntesis, ej. "(NO)". Vacío si no hay dato. */
export function windDirectionLabel(deg) {
  if (deg === null || deg === undefined || !Number.isFinite(deg)) return "";
  const dirs = i18n.t("windDirs");
  return `(${dirs[cardinal8Index(deg)]})`;
}

/** Etiqueta traducida del índice UV. */
export function uvLabel(uv) {
  const labels = i18n.t("uvLabels");
  return labels[uvLevelIndex(uv)];
}

/** Hora local HH:MM en el idioma activo. */
export function formatTime(dateLike) {
  return new Date(dateLike).toLocaleTimeString(i18n.lang, { hour: "2-digit", minute: "2-digit" });
}

/** Fecha larga en el idioma activo, ej. "Lunes, 2 de Octubre de 2026". */
export function formatLongDate(date = new Date()) {
  const days = i18n.days();
  const months = i18n.months();
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}
