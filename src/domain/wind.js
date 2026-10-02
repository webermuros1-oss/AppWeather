/**
 * Cálculos de viento (puros): escala Beaufort y rosa de los vientos.
 */

// Umbrales superiores (km/h) de cada grado Beaufort 0..11; >=118 => 12.
const BEAUFORT_THRESHOLDS = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];

/**
 * Grado de la escala Beaufort (0..12) para una velocidad en km/h.
 * @param {number} kmh
 * @returns {number}
 */
export function beaufort(kmh) {
  if (!Number.isFinite(kmh) || kmh < 0) return 0;
  const idx = BEAUFORT_THRESHOLDS.findIndex((v) => kmh < v);
  return idx === -1 ? 12 : idx;
}

/**
 * Índice (0..7) en una tabla de 8 puntos cardinales para una dirección en grados.
 * Úsalo con el array i18n `windDirs` (["N","NE","E",...]).
 * @param {number} degrees
 * @returns {number}
 */
export function cardinal8Index(degrees) {
  if (degrees === null || degrees === undefined || !Number.isFinite(degrees)) return 0;
  return Math.round(degrees / 45) % 8;
}

const CARDINAL_16 = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO",
];

/**
 * Punto cardinal de 16 direcciones (usado en la brújula de las gráficas).
 * @param {number} degrees
 * @returns {string}
 */
export function cardinal16(degrees) {
  if (!Number.isFinite(degrees)) return CARDINAL_16[0];
  return CARDINAL_16[Math.round(degrees / 22.5) % 16];
}
