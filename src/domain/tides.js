/**
 * Estimación de mareas (pleamar/bajamar) por cálculo lunar, sin API ni clave.
 *
 * Aproximación basada en el tránsito lunar y el período semidiurno M2
 * (12,4207 h). No sustituye a tablas oficiales, pero da una orientación
 * razonable y gratuita. Se mantiene puro: `now` es un parámetro para poder
 * testear de forma determinista.
 *
 * @param {number} lat
 * @param {number} lon
 * @param {Date} [now]
 * @returns {{ hasTideData: boolean, tides: Array<{dt:number,type:'High'|'Low'}>, isSpring: boolean }}
 */
export function computeLunarTides(lat, lon, now = new Date()) {
  const toRad = Math.PI / 180;
  const d = now.getTime() / 86400000 + 2440587.5 - 2451545.0; // días desde J2000

  // Longitud media y anomalía de la Luna (Meeus simplificado).
  const Lm = (218.316 + 13.176396 * d) % 360;
  const Mm = (134.963 + 13.064993 * d) % 360;
  const lam = (((Lm + 6.289 * Math.sin(Mm * toRad)) % 360) + 360) % 360;

  // Tiempo sidéreo de Greenwich → ángulo horario local de la Luna.
  const GMST = (((280.46061837 + 360.98564736629 * d) % 360) + 360) % 360;
  const HA = (((GMST + lon - lam) % 360) + 360) % 360;

  // Horas hasta el próximo tránsito superior (≈ pleamar).
  const moonDegPerHr = 360 / 24.8414;
  const hoursToTransit = ((360 - HA) % 360) / moonDegPerHr;

  const M2 = 12.4207; // período semidiurno lunar (horas)

  // Fase lunar: 0 = novilunio, ~14.77 = plenilunio.
  const moonAge = ((d % 29.530588853) + 29.530588853) % 29.530588853;
  const isSpring =
    moonAge < 2.5 || (moonAge > 13 && moonAge < 16.5) || moonAge > 27;

  const nowMs = now.getTime();
  const firstHighMs = nowMs + hoursToTransit * 3600000;
  const tides = [];

  for (let i = 0; tides.length < 4; i++) {
    const highMs = firstHighMs + i * M2 * 3600000;
    const lowMs = firstHighMs + (i + 0.5) * M2 * 3600000;
    if (highMs > nowMs) tides.push({ dt: Math.round(highMs / 1000), type: "High" });
    if (lowMs > nowMs) tides.push({ dt: Math.round(lowMs / 1000), type: "Low" });
  }

  return {
    hasTideData: true,
    tides: tides.sort((a, b) => a.dt - b.dt).slice(0, 4),
    isSpring,
  };
}
