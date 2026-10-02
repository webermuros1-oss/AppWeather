/**
 * Web Component del header: logo, buscador con autocompletado, botón GPS,
 * sidebar de navegación y panel de ajustes (idioma).
 *
 * Importa i18n y los servicios como módulos → sin `window.I18N` ni carreras de
 * carga. Los textos de las sugerencias se escapan (datos de API externa).
 */

import { escapeHtml } from "../../core/dom.js";
import { i18n } from "../../i18n/index.js";
import { emitCitySelected, onLangChanged } from "../../core/events.js";
import { searchCities } from "../../services/geocoding-service.js";
import { getPosition, reverseGeocode } from "../../services/geolocation-service.js";

function flagEmoji(countryCode) {
  if (!countryCode) return "🌍";
  return countryCode
    .toUpperCase()
    .split("")
    .map((ch) => String.fromCodePoint(0x1f1e0 - 65 + ch.charCodeAt(0)))
    .join("");
}

export class PlusWeatherHeader extends HTMLElement {
  connectedCallback() {
    const inSubfolder = window.location.pathname.includes("/pages/");
    const base = inSubfolder ? "../" : "";
    const root = inSubfolder ? "../" : "";
    const pages = inSubfolder ? "" : "pages/";

    this.innerHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <nav class="sidebar" id="appSidebar">
        <div class="sidebar-header">
            <img class="sidebar-logo" src="${base}media/images/logoRemaster.png" alt="PlusWeather">
            <span class="sidebar-title">PlusWeather</span>
            <button class="sidebar-close" id="sidebarClose"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="sidebar-section-label" data-i18n="secNavigation">Navegación</div>
        <ul class="sidebar-nav">
            <li><a href="${root}index.html" class="sidebar-link ${this.isCurrentPage("index") ? "active" : ""}">
                <i class="fa-solid fa-house"></i><span data-i18n="navHome">Inicio</span>
            </a></li>
            <li><a href="${pages}charts.html" class="sidebar-link ${this.isCurrentPage("charts") ? "active" : ""}">
                <i class="fa-solid fa-chart-line"></i><span data-i18n="navCharts">Gráficas</span>
                <span class="sidebar-badge">NEW</span>
            </a></li>
            <li><a href="${pages}radar.html" class="sidebar-link ${this.isCurrentPage("radar") ? "active" : ""}">
                <i class="fa-solid fa-satellite-dish"></i><span data-i18n="navRadar">Radar</span>
            </a></li>
        </ul>
        <div class="sidebar-section-label" data-i18n="secSections">Secciones</div>
        <ul class="sidebar-nav">
            <li><a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="mainWeatherCard">
                <i class="fa-solid fa-cloud-sun"></i><span data-i18n="secCurrentCity">Ciudad actual</span>
            </a></li>
            <li><a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="hourlyCard">
                <i class="fa-solid fa-clock"></i><span data-i18n="secHourly">Pronóstico por horas</span>
            </a></li>
            <li><a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="forecastCard">
                <i class="fa-solid fa-calendar-days"></i><span data-i18n="secForecast">Pronóstico 7 días</span>
            </a></li>
            <li><a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="windCard">
                <i class="fa-solid fa-wind"></i><span data-i18n="secWind">Viento</span>
            </a></li>
            <li><a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="marineCard">
                <i class="fa-solid fa-water"></i><span data-i18n="secMarine">Datos marítimos</span>
            </a></li>
        </ul>
        <div class="sidebar-footer">
            <span>PlusWeather v3.0</span><span>Powered by Open-Meteo</span>
        </div>
    </nav>

    <div class="settings-overlay" id="settingsOverlay"></div>
    <div class="settings-panel" id="settingsPanel">
        <div class="settings-header">
            <span><i class="fa-solid fa-gear"></i> <span data-i18n="settingsTitle">Ajustes</span></span>
            <button class="settings-close-btn" id="settingsClose"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="settings-section">
            <label class="settings-label"><i class="fa-solid fa-language"></i> <span data-i18n="settingsLanguage">Idioma</span></label>
            <div class="lang-grid" id="langGrid"></div>
        </div>
    </div>

    <header class="appHeader">
        <button class="hamburger-btn" id="hamburgerBtn" aria-label="Abrir menú">
            <span></span><span></span><span></span>
        </button>
        <h1 class="title">
            <img class="weatherIcon" src="${base}media/images/logoRemaster.png" alt="PlusWeather">
        </h1>
        <div class="searchWrapper" id="searchWrapper">
            <div class="searchInputRow">
                <i class="fa-solid fa-magnifying-glass searchIcon"></i>
                <input id="getCity" type="text" placeholder="Busca ciudad..." autocomplete="off" />
            </div>
            <ul class="searchDropdown" id="searchDropdown"></ul>
        </div>
        <button class="gpsBtnHeader" id="gpsBtn" title="Mi ubicación">
            <i class="fa-solid fa-location-crosshairs"></i>
        </button>
        <button class="settingsBtnHeader" id="settingsBtn" title="Ajustes">
            <i class="fa-solid fa-gear"></i>
        </button>
    </header>
    `;

    this._wireSidebar();
    this._wireSettings();
    this._wireSearch();
    this._wireGps();

    const applyI18n = () => this._applyI18n();
    applyI18n();
    onLangChanged(() => {
      applyI18n();
      this._renderLangGrid();
    });
  }

  isCurrentPage(page) {
    const p = window.location.pathname;
    return (
      p.includes(page + ".html") ||
      (page === "index" && (p.endsWith("/") || p.endsWith("index.html")))
    );
  }

  _applyI18n() {
    this.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = i18n.t(el.getAttribute("data-i18n"));
    });
    const cityInput = this.querySelector("#getCity");
    if (cityInput) cityInput.placeholder = i18n.t("searchPlaceholder");
  }

  _renderLangGrid() {
    const langGrid = this.querySelector("#langGrid");
    if (!langGrid) return;
    langGrid.innerHTML = i18n
      .availableLangs()
      .map(
        (l) => `
            <button class="lang-btn ${i18n.lang === l.code ? "active" : ""}" data-code="${escapeHtml(l.code)}">
                <span class="lang-flag">${l.flag}</span>
                <span class="lang-name">${escapeHtml(l.label)}</span>
            </button>`,
      )
      .join("");
    langGrid.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        i18n.lang = btn.dataset.code; // dispara langChanged → re-render
      });
    });
  }

  _wireSidebar() {
    const hamburger = this.querySelector("#hamburgerBtn");
    const sidebar = this.querySelector("#appSidebar");
    const overlay = this.querySelector("#sidebarOverlay");
    const closeBtn = this.querySelector("#sidebarClose");

    const open = () => {
      sidebar.classList.add("open");
      overlay.classList.add("show");
      hamburger.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
      hamburger.classList.remove("open");
      document.body.style.overflow = "";
    };

    hamburger.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        close();
        this._closeSettings();
      }
    });

    this.querySelectorAll(".sidebar-scroll").forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.querySelector(`.${link.dataset.section}`);
        if (!target) return;
        e.preventDefault();
        close();
        setTimeout(() => {
          const h = document.querySelector(".appHeader")?.offsetHeight || 0;
          window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - h - 20, behavior: "smooth" });
        }, 300);
      });
    });
  }

  _wireSettings() {
    const settingsBtn = this.querySelector("#settingsBtn");
    const panel = this.querySelector("#settingsPanel");
    const overlay = this.querySelector("#settingsOverlay");
    const closeBtn = this.querySelector("#settingsClose");

    this._closeSettings = () => {
      panel.classList.remove("open");
      overlay.classList.remove("show");
      document.body.style.overflow = "";
    };
    const open = () => {
      panel.classList.add("open");
      overlay.classList.add("show");
      document.body.style.overflow = "hidden";
    };

    settingsBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", this._closeSettings);
    overlay.addEventListener("click", this._closeSettings);
    this._renderLangGrid();
  }

  _wireSearch() {
    const input = this.querySelector("#getCity");
    const dropdown = this.querySelector("#searchDropdown");
    const wrapper = this.querySelector("#searchWrapper");
    let debounceTimer = null;
    let currentResults = [];
    let activeIndex = -1;

    const hide = () => {
      dropdown.classList.remove("open");
      dropdown.innerHTML = "";
      activeIndex = -1;
    };

    const render = (results) => {
      activeIndex = -1;
      if (!results.length) return hide();
      dropdown.innerHTML = results
        .map((r, i) => {
          const admin = [r.admin1, r.country].filter(Boolean).join(", ");
          return `<li class="dropdownItem" data-index="${i}">
                    <span class="dropdownFlag">${flagEmoji(r.country_code)}</span>
                    <span class="dropdownText"><strong>${escapeHtml(r.name)}</strong><small>${escapeHtml(admin)}</small></span>
                    <span class="dropdownCoords">${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)}</span>
                </li>`;
        })
        .join("");
      dropdown.querySelectorAll(".dropdownItem").forEach((item) => {
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          select(currentResults[Number(item.dataset.index)]);
        });
      });
      dropdown.classList.add("open");
    };

    const setActive = (idx) => {
      const items = dropdown.querySelectorAll(".dropdownItem");
      if (!items.length) return;
      activeIndex = Math.max(0, Math.min(idx, items.length - 1));
      items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
      items[activeIndex].scrollIntoView({ block: "nearest" });
    };

    const select = (result) => {
      if (!result) return;
      input.value = result.name;
      hide();
      emitCitySelected({
        name: result.name,
        country: result.country_code ?? result.country,
        latitude: result.latitude,
        longitude: result.longitude,
        street: "",
      });
    };

    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (q.length < 2) return hide();
      debounceTimer = setTimeout(async () => {
        try {
          currentResults = await searchCities(q, i18n.lang, 6);
          render(currentResults);
        } catch {
          hide();
        }
      }, 280);
    });

    input.addEventListener("keydown", (e) => {
      if (!dropdown.classList.contains("open")) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(activeIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(activeIndex - 1);
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && currentResults[activeIndex]) {
          e.preventDefault();
          select(currentResults[activeIndex]);
        }
      } else if (e.key === "Escape") {
        hide();
      }
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) hide();
    });
  }

  _wireGps() {
    const gpsBtn = this.querySelector("#gpsBtn");
    const input = this.querySelector("#getCity");
    gpsBtn.addEventListener("click", async () => {
      gpsBtn.classList.add("loading");
      try {
        const { latitude, longitude } = await getPosition();
        const place = await reverseGeocode(latitude, longitude, i18n.lang);
        input.value = place.street ? `${place.street}, ${place.name}` : place.name;
        emitCitySelected({
          name: place.name,
          country: place.country,
          latitude: place.latitude,
          longitude: place.longitude,
          street: place.street,
        });
      } catch (err) {
        const msgs = { 1: "Permiso denegado.", 2: "No se pudo obtener posición.", 3: "Tiempo agotado." };
        alert(msgs[err?.code] || "Error de geolocalización");
      } finally {
        gpsBtn.classList.remove("loading");
      }
    });
  }
}

export function registerHeader() {
  if (!customElements.get("header-plus-weather")) {
    customElements.define("header-plus-weather", PlusWeatherHeader);
  }
}
