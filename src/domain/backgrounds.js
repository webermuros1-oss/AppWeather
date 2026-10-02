/**
 * Selección de fondo dinámico según el código WMO y si es de día o de noche.
 * La categorización es pura; la elección de imagen acepta un generador aleatorio
 * inyectable para poder testearla.
 */

export const BACKGROUND_IMAGES = Object.freeze({
  day: {
    sunny: ["sunny1", "sunny2", "beach"],
    cloudy: ["cloudy1", "cloudy2"],
    rainy: ["rainy1", "rainy2", "rainy3"],
    snowy: ["snowy1", "snowy2"],
    stormy: ["stormy1", "stormy2"],
    foggy: ["foggy1", "foggy2"],
    default: ["sunny1", "cloudy1", "rainy1"],
  },
  night: {
    sunny: ["nightClear1", "night1"],
    cloudy: ["nightCloudy1", "night2"],
    rainy: ["nightRainy1", "night1"],
    snowy: ["night1"],
    stormy: ["nightStormy1", "night2"],
    foggy: ["night2"],
    default: ["night1", "night2", "night3"],
  },
});

/**
 * Categoría de fondo para un código WMO.
 * @param {number|null} code
 * @returns {'sunny'|'cloudy'|'rainy'|'snowy'|'stormy'|'foggy'|'default'}
 */
export function weatherCategory(code) {
  if (code === null || code === undefined) return "default";
  if ([0, 1].includes(code)) return "sunny";
  if ([2, 3].includes(code)) return "cloudy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rainy";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snowy";
  if (code >= 95 && code <= 99) return "stormy";
  if ([45, 48].includes(code)) return "foggy";
  return "default";
}

/**
 * Nombre de archivo de imagen de fondo.
 * @param {number|null} code
 * @param {boolean|number} isDay
 * @param {() => number} [rand] generador [0,1) inyectable (default Math.random)
 * @returns {string}
 */
export function pickBackgroundImage(code = null, isDay = 1, rand = Math.random) {
  const set = isDay ? BACKGROUND_IMAGES.day : BACKGROUND_IMAGES.night;
  const imgs = set[weatherCategory(code)] ?? set.default;
  return imgs[Math.floor(rand() * imgs.length)];
}
