class MyHeader extends HTMLElement {
    connectedCallback() {
        const inSubfolder = window.location.pathname.includes('/pages/');
        const base = inSubfolder ? '../' : '';
        const root = inSubfolder ? '../' : '';
        const pages = inSubfolder ? '' : 'pages/';

        this.innerHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <nav class="sidebar" id="appSidebar">
        <div class="sidebar-header">
            <img class="sidebar-logo" src="${base}media/images/logoRemaster.png" alt="PlusWeather">
            <span class="sidebar-title">PlusWeather</span>
            <button class="sidebar-close" id="sidebarClose">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="sidebar-section-label">Navegación</div>
        <ul class="sidebar-nav">
            <li>
                <a href="${root}index.html" class="sidebar-link ${this.isCurrentPage('index') ? 'active' : ''}">
                    <i class="fa-solid fa-house"></i><span>Inicio</span>
                </a>
            </li>
            <li>
                <a href="${pages}charts.html" class="sidebar-link ${this.isCurrentPage('charts') ? 'active' : ''}">
                    <i class="fa-solid fa-chart-line"></i><span>Gráficas</span>
                    <span class="sidebar-badge">NEW</span>
                </a>
            </li>
            <li>
                <a href="${pages}radar.html" class="sidebar-link ${this.isCurrentPage('radar') ? 'active' : ''}">
                    <i class="fa-solid fa-satellite-dish"></i><span>Radar</span>
                </a>
            </li>
        </ul>

        <div class="sidebar-section-label">Secciones</div>
        <ul class="sidebar-nav">
            <li>
                <a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="mainWeatherCard">
                    <i class="fa-solid fa-cloud-sun"></i><span>Ciudad actual</span>
                </a>
            </li>
            <li>
                <a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="hourlyCard">
                    <i class="fa-solid fa-clock"></i><span>Pronóstico por horas</span>
                </a>
            </li>
            <li>
                <a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="forecastCard">
                    <i class="fa-solid fa-calendar-days"></i><span>Pronóstico 7 días</span>
                </a>
            </li>
            <li>
                <a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="windCard">
                    <i class="fa-solid fa-wind"></i><span>Viento</span>
                </a>
            </li>
            <li>
                <a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="marineCard">
                    <i class="fa-solid fa-water"></i><span>Datos marítimos</span>
                </a>
            </li>
        </ul>

        <div class="sidebar-footer">
            <span>PlusWeather v2.0</span>
            <span>Powered by Open-Meteo</span>
        </div>
    </nav>

    <header class="appHeader">
        <button class="hamburger-btn" id="hamburgerBtn" aria-label="Abrir menú">
            <span></span><span></span><span></span>
        </button>

        <h1 class="title">
            <img class="weatherIcon" src="${base}media/images/logoRemaster.png" alt="PlusWeather">
        </h1>

        <!-- Search with autocomplete -->
        <div class="searchWrapper" id="searchWrapper">
            <div class="searchInputRow">
                <i class="fa-solid fa-magnifying-glass searchIcon"></i>
                <input id="getCity" type="text" placeholder="Busca ciudad..." autocomplete="off" />
                <button class="gpsBtn" id="gpsBtn" title="Usar mi ubicación">
                    <i class="fa-solid fa-location-crosshairs"></i>
                </button>
            </div>
            <ul class="searchDropdown" id="searchDropdown"></ul>
        </div>
    </header>
    `;


        const hamburger = this.querySelector("#hamburgerBtn");
        const sidebar = this.querySelector("#appSidebar");
        const overlay = this.querySelector("#sidebarOverlay");
        const closeBtn = this.querySelector("#sidebarClose");

        const openSidebar = () => { sidebar.classList.add("open"); overlay.classList.add("show"); hamburger.classList.add("open"); document.body.style.overflow = "hidden"; };
        const closeSidebar = () => { sidebar.classList.remove("open"); overlay.classList.remove("show"); hamburger.classList.remove("open"); document.body.style.overflow = ""; };

        hamburger.addEventListener("click", openSidebar);
        closeBtn.addEventListener("click", closeSidebar);
        overlay.addEventListener("click", closeSidebar);
        document.addEventListener("keydown", e => { if (e.key === "Escape") closeSidebar(); });

        this.querySelectorAll(".sidebar-scroll").forEach(link => {
            link.addEventListener("click", e => {
                const target = document.querySelector(`.${link.dataset.section}`);
                if (target) {
                    e.preventDefault();
                    closeSidebar();
                    setTimeout(() => {
                        const h = document.querySelector(".appHeader")?.offsetHeight || 0;
                        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - h - 20, behavior: "smooth" });
                    }, 300);
                }
            });
        });


        const input = this.querySelector("#getCity");
        const dropdown = this.querySelector("#searchDropdown");
        let debounceTimer = null;
        let currentResults = [];
        let activeIndex = -1;

        input.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            const q = input.value.trim();
            if (q.length < 2) { hideDropdown(); return; }
            debounceTimer = setTimeout(() => fetchSuggestions(q), 280);
        });

        input.addEventListener("keydown", e => {
            if (!dropdown.classList.contains("open")) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActive(activeIndex + 1); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive(activeIndex - 1); }
            else if (e.key === "Enter") {
                if (activeIndex >= 0 && currentResults[activeIndex]) {
                    e.preventDefault();
                    selectResult(currentResults[activeIndex]);
                }

            }
            else if (e.key === "Escape") { hideDropdown(); }
        });


        document.addEventListener("click", e => {
            if (!this.querySelector("#searchWrapper").contains(e.target)) hideDropdown();
        });

        async function fetchSuggestions(query) {
            try {
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=es&format=json`;
                const res = await fetch(url);
                const data = await res.json();
                currentResults = data.results ?? [];
                renderDropdown(currentResults);
            } catch {
                hideDropdown();
            }
        }

        function renderDropdown(results) {
            activeIndex = -1;
            if (!results.length) { hideDropdown(); return; }

            dropdown.innerHTML = results.map((r, i) => {
                const admin = [r.admin1, r.country].filter(Boolean).join(", ");
                const flag = r.country_code ? getFlagEmoji(r.country_code) : "🌍";
                return `
                <li class="dropdownItem" data-index="${i}">
                    <span class="dropdownFlag">${flag}</span>
                    <span class="dropdownText">
                        <strong>${r.name}</strong>
                        <small>${admin}</small>
                    </span>
                    <span class="dropdownCoords">${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)}</span>
                </li>`;
            }).join("");

            dropdown.querySelectorAll(".dropdownItem").forEach(item => {
                item.addEventListener("mousedown", e => {
                    e.preventDefault(); 
                    const idx = parseInt(item.dataset.index);
                    selectResult(currentResults[idx]);
                });
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
            input.value = result.name;
            hideDropdown();
            
            document.dispatchEvent(new CustomEvent("citySelected", {
                detail: {
                    name: result.name,
                    country: result.country_code ?? result.country,
                    latitude: result.latitude,
                    longitude: result.longitude
                }
            }));
        }

        function hideDropdown() {
            dropdown.classList.remove("open");
            dropdown.innerHTML = "";
            activeIndex = -1;
        }

        function getFlagEmoji(countryCode) {
            return countryCode
                .toUpperCase()
                .split("")
                .map(c => String.fromCodePoint(0x1F1E0 - 65 + c.charCodeAt(0)))
                .join("");
        }

        
        const gpsBtn = this.querySelector("#gpsBtn");

        gpsBtn.addEventListener("click", () => {
            if (!navigator.geolocation) { alert("Tu navegador no soporta geolocalización"); return; }

            
            gpsBtn.classList.add("loading");

            navigator.geolocation.getCurrentPosition(
                async pos => {
                    gpsBtn.classList.remove("loading");
                    const { latitude, longitude, accuracy } = pos.coords;

                    try {
                        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=16&accept-language=es`;
                        const res = await fetch(url, { headers: { "Accept-Language": "es" } });
                        const data = await res.json();

                        
                        const a = data.address ?? {};
                        const name =
                            a.neighbourhood ||  
                            a.suburb ||  
                            a.village ||  
                            a.town ||  
                            a.city ||  
                            a.county ||  
                            data.display_name.split(",")[0];

                        const country = a.country_code?.toUpperCase() ?? a.country ?? "";

                        
                        const street = a.road || a.pedestrian || a.path || "";
                        input.value = street ? `${street}, ${name}` : name;

                        document.dispatchEvent(new CustomEvent("citySelected", {
                            detail: { name, country, latitude, longitude, accuracy }
                        }));
                    } catch {
                        
                        try {
                            const fb = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`);
                            const fbd = await fb.json();
                            const name = fbd.city || fbd.locality || "Mi ubicación";
                            input.value = name;
                            document.dispatchEvent(new CustomEvent("citySelected", {
                                detail: { name, country: fbd.countryCode ?? "", latitude, longitude }
                            }));
                        } catch {
                            alert("No se pudo obtener el nombre de tu ubicación");
                        }
                    }
                },
                err => {
                    gpsBtn.classList.remove("loading");
                    const msgs = {
                        1: "Permiso de ubicación denegado. Actívalo en la configuración del navegador.",
                        2: "No se pudo obtener tu posición. Comprueba tu conexión GPS.",
                        3: "Tiempo de espera agotado. Inténtalo de nuevo."
                    };
                    alert(msgs[err.code] || "Error de geolocalización");
                },
                {
                    enableHighAccuracy: true, 
                    timeout: 15000,
                    maximumAge: 0              
                }
            );
        });
    }

    isCurrentPage(page) {
        return window.location.pathname.includes(page + ".html") ||
            (page === "index" && (
                window.location.pathname.endsWith("/") ||
                window.location.pathname.endsWith("index.html")
            ));
    }
}

customElements.define("header-plus-weather", MyHeader);