/**
 * Entry point de la página de radar (pages/radar.html).
 * Requiere que el script de Leaflet (CDN) se haya cargado antes (va en el HTML).
 */

import { i18n } from "../i18n/index.js";
import { registerServiceWorker } from "../core/register-sw.js";
import { registerHeader } from "../ui/components/header.js";
import { registerFooter } from "../ui/components/footer.js";
import { initRadarPage } from "../ui/radar.js";

window.I18N = i18n;

registerServiceWorker();
registerHeader();
registerFooter();
window.addEventListener("load", initRadarPage);
