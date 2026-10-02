/**
 * Clasificación del índice UV (puro).
 */

/**
 * Índice (0..5) en la tabla i18n `uvLabels`
 * (["—","Bajo","Moderado","Alto","Muy alto","Extremo"]).
 * @param {number} uv
 * @returns {number}
 */
export function uvLevelIndex(uv) {
  if (!uv || !Number.isFinite(uv) || uv <= 0) return 0;
  if (uv <= 2) return 1;
  if (uv <= 5) return 2;
  if (uv <= 7) return 3;
  if (uv <= 10) return 4;
  return 5;
}
