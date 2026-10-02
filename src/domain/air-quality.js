/**
 * Clasificación del índice de calidad del aire (AQI europeo) — puro.
 * Devuelve clase CSS, nivel (índice en los arrays i18n `aqiLabels`/`aqiDescs`)
 * y emoji. La UI resuelve las etiquetas traducidas.
 */

/**
 * @param {number} aqi
 * @returns {{ cls: string, level: number, emoji: string }}
 */
export function aqiInfo(aqi) {
  const value = Number.isFinite(aqi) ? aqi : 0;
  if (value <= 20) return { cls: "aqi-good", level: 0, emoji: "😊" };
  if (value <= 40) return { cls: "aqi-good", level: 1, emoji: "🙂" };
  if (value <= 60) return { cls: "aqi-moderate", level: 2, emoji: "😐" };
  if (value <= 80) return { cls: "aqi-unhealthy-sensitive", level: 3, emoji: "😷" };
  if (value <= 100) return { cls: "aqi-unhealthy", level: 4, emoji: "🤢" };
  if (value <= 150) return { cls: "aqi-very-unhealthy", level: 5, emoji: "🚨" };
  return { cls: "aqi-hazardous", level: 6, emoji: "☠️" };
}
