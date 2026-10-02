/**
 * Entry point de la página principal (index.html).
 * Monta los Web Components, registra el Service Worker y arranca el dashboard.
 */

import { i18n } from "./i18n/index.js";
import { registerServiceWorker } from "./core/register-sw.js";
import { registerHeader } from "./ui/components/header.js";
import { registerFooter } from "./ui/components/footer.js";
import { startDashboard } from "./app/dashboard.js";

// Expuesto para depuración manual en consola (la app usa el módulo importado).
window.I18N = i18n;

registerServiceWorker();
registerHeader();
registerFooter();
startDashboard();
