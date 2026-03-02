class MyHeader extends HTMLElement {
    connectedCallback() {
        const inSubfolder = window.location.pathname.includes("/pages/");
        const base  = inSubfolder ? "../" : "";
        const root  = inSubfolder ? "../" : "";
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
            <span>PlusWeather v2.0</span><span>Powered by Open-Meteo</span>
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

        const hamburger = this.querySelector("#hamburgerBtn");
        const sidebar   = this.querySelector("#appSidebar");
        const overlay   = this.querySelector("#sidebarOverlay");
        const closeBtn  = this.querySelector("#sidebarClose");

        const openSidebar  = () => { sidebar.classList.add("open"); overlay.classList.add("show"); hamburger.classList.add("open"); document.body.style.overflow = "hidden"; };
        const closeSidebar = () => { sidebar.classList.remove("open"); overlay.classList.remove("show"); hamburger.classList.remove("open"); document.body.style.overflow = ""; };

        hamburger.addEventListener("click", openSidebar);
        closeBtn.addEventListener("click", closeSidebar);
        overlay.addEventListener("click", closeSidebar);
        document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSidebar(); closeSettings(); } });

        this.querySelectorAll(".sidebar-scroll").forEach(link => {
            link.addEventListener("click", e => {
                const target = document.querySelector(`.${link.dataset.section}`);
                if (target) {
                    e.preventDefault(); closeSidebar();
                    setTimeout(() => {
                        const h = document.querySelector(".appHeader")?.offsetHeight || 0;
                        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - h - 20, behavior: "smooth" });
                    }, 300);
                }
            });
        });

        const settingsBtn     = this.querySelector("#settingsBtn");
        const settingsPanel   = this.querySelector("#settingsPanel");
        const settingsOverlay = this.querySelector("#settingsOverlay");
        const settingsClose   = this.querySelector("#settingsClose");

        const openSettings  = () => { settingsPanel.classList.add("open"); settingsOverlay.classList.add("show"); document.body.style.overflow = "hidden"; };
        const closeSettings = () => { settingsPanel.classList.remove("open"); settingsOverlay.classList.remove("show"); document.body.style.overflow = ""; };

        settingsBtn.addEventListener("click", openSettings);
        settingsClose.addEventListener("click", closeSettings);
        settingsOverlay.addEventListener("click", closeSettings);

        const langGrid = this.querySelector("#langGrid");

        const renderLangGrid = () => {
            if (!window.I18N) return;
            langGrid.innerHTML = I18N.availableLangs().map(l => `
                <button class="lang-btn ${I18N.lang === l.code ? "active" : ""}" data-code="${l.code}">
                    <span class="lang-flag">${l.flag}</span>
                    <span class="lang-name">${l.label}</span>
                </button>
            `).join("");
            langGrid.querySelectorAll(".lang-btn").forEach(btn => {
                btn.addEventListener("click", () => { I18N.lang = btn.dataset.code; renderLangGrid(); applyI18n(); });
            });
        };

        const applyI18n = () => {
            if (!window.I18N) return;
            this.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = I18N.t(el.getAttribute("data-i18n")); });
            const cityInput = this.querySelector("#getCity");
            if (cityInput) cityInput.placeholder = I18N.t("searchPlaceholder");
        };

        if (window.I18N) { renderLangGrid(); applyI18n(); }
        else window.addEventListener("load", () => { renderLangGrid(); applyI18n(); });

        document.addEventListener("langChanged", () => { applyI18n(); renderLangGrid(); });

        const input    = this.querySelector("#getCity");
        const dropdown = this.querySelector("#searchDropdown");
        let debounceTimer = null, currentResults = [], activeIndex = -1;

        input.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            const q = input.value.trim();
            if (q.length < 2) { hideDropdown(); return; }
            debounceTimer = setTimeout(() => fetchSuggestions(q), 280);
        });
        input.addEventListener("keydown", e => {
            if (!dropdown.classList.contains("open")) return;
            if (e.key === "ArrowDown")  { e.preventDefault(); setActive(activeIndex + 1); }
            else if (e.key === "ArrowUp")  { e.preventDefault(); setActive(activeIndex - 1); }
            else if (e.key === "Enter") { if (activeIndex >= 0 && currentResults[activeIndex]) { e.preventDefault(); selectResult(currentResults[activeIndex]); } }
            else if (e.key === "Escape") hideDropdown();
        });
        document.addEventListener("click", e => { if (!this.querySelector("#searchWrapper").contains(e.target)) hideDropdown(); });

        async function fetchSuggestions(query) {
            try {
                const lang = window.I18N ? I18N.lang : "es";
                const res  = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=${lang}&format=json`);
                const data = await res.json();
                currentResults = data.results ?? [];
                renderDropdown(currentResults);
            } catch { hideDropdown(); }
        }
        function renderDropdown(results) {
            activeIndex = -1;
            if (!results.length) { hideDropdown(); return; }
            dropdown.innerHTML = results.map((r, i) => {
                const admin = [r.admin1, r.country].filter(Boolean).join(", ");
                const flag  = r.country_code ? getFlagEmoji(r.country_code) : "🌍";
                return `<li class="dropdownItem" data-index="${i}">
                    <span class="dropdownFlag">${flag}</span>
                    <span class="dropdownText"><strong>${r.name}</strong><small>${admin}</small></span>
                    <span class="dropdownCoords">${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)}</span>
                </li>`;
            }).join("");
            dropdown.querySelectorAll(".dropdownItem").forEach(item => {
                item.addEventListener("mousedown", e => { e.preventDefault(); selectResult(currentResults[parseInt(item.dataset.index)]); });
            });
            dropdown.classList.add("open");
        }
        function setActive(idx) {
            const items = dropdown.querySelectorAll(".dropdownItem");
            if (!items.length) return;
            activeIndex = Math.max(0, Math.min(idx, items.length - 1));
            items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
            items[activeIndex].scrollIntoView({ block: "nearest" });
        }
        function selectResult(result) {
            input.value = result.name; hideDropdown();
            document.dispatchEvent(new CustomEvent("citySelected", {
                detail: { name: result.name, country: result.country_code ?? result.country, latitude: result.latitude, longitude: result.longitude, street: "" }
            }));
        }
        function hideDropdown() { dropdown.classList.remove("open"); dropdown.innerHTML = ""; activeIndex = -1; }
        function getFlagEmoji(c) { return c.toUpperCase().split("").map(ch => String.fromCodePoint(0x1F1E0 - 65 + ch.charCodeAt(0))).join(""); }

        const gpsBtn = this.querySelector("#gpsBtn");
        gpsBtn.addEventListener("click", () => {
            if (!navigator.geolocation) { alert("Tu navegador no soporta geolocalización"); return; }
            gpsBtn.classList.add("loading");
            navigator.geolocation.getCurrentPosition(
                async pos => {
                    gpsBtn.classList.remove("loading");
                    const { latitude, longitude } = pos.coords;
                    const lang = window.I18N ? I18N.lang : "es";
                    try {
                        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18&accept-language=${lang}`, { headers: { "Accept-Language": lang } });
                        const data = await res.json();
                        const a    = data.address ?? {};
                        const name = a.hamlet||a.locality||a.neighbourhood||a.suburb||a.village||a.town||a.city||a.municipality||a.county||data.display_name.split(",")[0];
                        const country = a.country_code?.toUpperCase() ?? a.country ?? "";
                        const street  = a.road||a.pedestrian||a.path||a.footway||a.track||"";
                        input.value = street ? `${street}, ${name}` : name;
                        document.dispatchEvent(new CustomEvent("citySelected", { detail: { name, country, latitude, longitude, street } }));
                    } catch {
                        try {
                            const fb  = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${lang}`);
                            const fbd = await fb.json();
                            const name = fbd.locality || fbd.city || "Mi ubicación";
                            input.value = name;
                            document.dispatchEvent(new CustomEvent("citySelected", { detail: { name, street: "", country: fbd.countryCode ?? "", latitude, longitude } }));
                        } catch { alert("No se pudo obtener el nombre de tu ubicación"); }
                    }
                },
                err => {
                    gpsBtn.classList.remove("loading");
                    const msgs = { 1:"Permiso denegado.", 2:"No se pudo obtener posición.", 3:"Tiempo agotado." };
                    alert(msgs[err.code] || "Error de geolocalización");
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        });
    }

    isCurrentPage(page) {
        return window.location.pathname.includes(page + ".html") ||
            (page === "index" && (window.location.pathname.endsWith("/") || window.location.pathname.endsWith("index.html")));
    }
}
customElements.define("header-plus-weather", MyHeader);