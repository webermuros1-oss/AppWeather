/**
 * Entry point de la página de gráficas (pages/charts.html).
 * Requiere que el script de Chart.js (CDN) se haya cargado antes (va en el HTML).
 */

import { i18n } from "../i18n/index.js";
import { registerServiceWorker } from "../core/register-sw.js";
import { registerHeader } from "../ui/components/header.js";
import { registerFooter } from "../ui/components/footer.js";
import { initChartsPage } from "../ui/charts.js";

window.I18N = i18n;

registerServiceWorker();
registerHeader();
registerFooter();
initChartsPage();
