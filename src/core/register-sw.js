/**
 * Registro del Service Worker con el scope correcto.
 *
 * El SW vive en la raíz del sitio (`/service-worker.js`) para que su scope
 * cubra tanto `index.html` como las páginas en `/pages/`. Desde una subcarpeta
 * se registra con ruta relativa y scope hacia la raíz.
 */
export function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    const inPages = window.location.pathname.includes("/pages/");
    const url = (inPages ? "../" : "./") + "service-worker.js";
    navigator.serviceWorker
      .register(url, { scope: inPages ? "../" : "./" })
      .then((reg) => console.info("SW registrado:", reg.scope))
      .catch((err) => console.error("SW error:", err));
  });
}
