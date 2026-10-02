/**
 * Web Component del footer de navegación (móvil). Scroll suave a secciones en
 * la home; enlaces directos a charts/radar.
 */

import { i18n } from "../../i18n/index.js";
import { onLangChanged } from "../../core/events.js";

export class PlusWeatherFooter extends HTMLElement {
  connectedCallback() {
    const inSubfolder = window.location.pathname.includes("/pages/");
    const root = inSubfolder ? "../" : "";
    const pages = inSubfolder ? "" : "pages/";

    const path = window.location.pathname;
    const isHome = !path.includes("charts") && !path.includes("radar");
    const isCharts = path.includes("charts");
    const isRadar = path.includes("radar");

    this.innerHTML = `
        <footer class="appFooter">
            <a href="${root}index.html" class="footerItem ${isHome && !window.location.hash ? "active" : ""}" data-section="mainWeatherCard">
                <i class="fa-solid fa-house"></i>
                <span data-i18n="footerCity">Ciudad</span>
            </a>
            <a href="${root}index.html#hourlyCard" class="footerItem" data-section="hourlyCard">
                <i class="fa-solid fa-clock"></i>
                <span data-i18n="footerHours">Horas</span>
            </a>
            <a href="${root}index.html#forecastCard" class="footerItem" data-section="forecastCard">
                <i class="fa-solid fa-cloud"></i>
                <span data-i18n="footerDays">Días</span>
            </a>
            <a href="${pages}charts.html" class="footerItem ${isCharts ? "active" : ""}">
                <i class="fa-solid fa-chart-line"></i>
                <span data-i18n="navCharts">Gráficas</span>
            </a>
            <a href="${pages}radar.html" class="footerItem ${isRadar ? "active" : ""}">
                <i class="fa-solid fa-satellite-dish"></i>
                <span data-i18n="navRadar">Radar</span>
            </a>
            <a href="${root}index.html#atmosphereCard" class="footerItem" data-section="atmosphereCard">
                <i class="fa-solid fa-wind"></i>
                <span data-i18n="footerAtmo">Atmósfera</span>
            </a>
            <a href="${root}index.html#marineCard" class="footerItem" data-section="marineCard">
                <i class="fa-solid fa-water"></i>
                <span data-i18n="footerMarine">Marítimo</span>
            </a>
        </footer>`;

    const applyI18n = () => {
      this.querySelectorAll("[data-i18n]").forEach((el) => {
        el.textContent = i18n.t(el.getAttribute("data-i18n"));
      });
    };
    applyI18n();
    onLangChanged(applyI18n);

    if (isHome) {
      this.querySelectorAll(".footerItem[data-section]").forEach((item) => {
        item.addEventListener("click", (e) => {
          const id = item.getAttribute("data-section");
          const target = document.getElementById(id) || document.querySelector("." + id);
          if (!target) return;
          e.preventDefault();
          this.querySelectorAll(".footerItem").forEach((i) => i.classList.remove("active"));
          item.classList.add("active");
          const headerH = document.querySelector(".appHeader")?.offsetHeight || 0;
          window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - headerH - 16, behavior: "smooth" });
        });
      });
    }
  }
}

export function registerFooter() {
  if (!customElements.get("footer-plus-weather")) {
    customElements.define("footer-plus-weather", PlusWeatherFooter);
  }
}
