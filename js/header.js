class MyHeader extends HTMLElement {
    connectedCallback() {
        // Detecta si estamos en una subcarpeta (pages/) o en la raíz
        const inSubfolder = window.location.pathname.includes('/pages/');
        const base  = inSubfolder ? '../' : '';       // para assets (img, css)
        const root  = inSubfolder ? '../' : '';       // para links a index.html
        const pages = inSubfolder ? ''    : 'pages/'; // para links a pages/charts.html

        this.innerHTML = `
    <!-- Sidebar overlay -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Sidebar -->
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
                    <i class="fa-solid fa-house"></i>
                    <span>Inicio</span>
                </a>
            </li>
            <li>
                <a href="${pages}charts.html" class="sidebar-link ${this.isCurrentPage('charts') ? 'active' : ''}">
                    <i class="fa-solid fa-chart-line"></i>
                    <span>Gráficas</span>
                    <span class="sidebar-badge">NEW</span>
                </a>
            </li>
            <li>
                <a href="${pages}radar.html" class="sidebar-link ${this.isCurrentPage('radar') ? 'active' : ''}">
                    <i class="fa-solid fa-satellite-dish"></i>
                    <span>Radar</span>
                </a>
            </li>
        </ul>

        <div class="sidebar-section-label">Secciones</div>
        <ul class="sidebar-nav">
            <li>
                <a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="mainWeatherCard">
                    <i class="fa-solid fa-cloud-sun"></i>
                    <span>Ciudad actual</span>
                </a>
            </li>
            <li>
                <a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="hourlyCard">
                    <i class="fa-solid fa-clock"></i>
                    <span>Pronóstico por horas</span>
                </a>
            </li>
            <li>
                <a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="forecastCard">
                    <i class="fa-solid fa-calendar-days"></i>
                    <span>Pronóstico 7 días</span>
                </a>
            </li>
            <li>
                <a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="windCard">
                    <i class="fa-solid fa-wind"></i>
                    <span>Viento</span>
                </a>
            </li>
            <li>
                <a href="${root}index.html" class="sidebar-link sidebar-scroll" data-section="marineCard">
                    <i class="fa-solid fa-water"></i>
                    <span>Datos marítimos</span>
                </a>
            </li>
        </ul>

        <div class="sidebar-footer">
            <span>PlusWeather v2.0</span>
            <span>Powered by Open-Meteo</span>
        </div>
    </nav>

    <!-- Header -->
    <header class="appHeader">
        <button class="hamburger-btn" id="hamburgerBtn" aria-label="Abrir menú">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <h1 class="title">
            <img class="weatherIcon" src="${base}media/images/logoRemaster.png" alt="weather logo">
        </h1>

        <input id="getCity" type="text" placeholder="Busca ciudad aquí" />
    </header>
    `;

        // Sidebar toggle logic
        const hamburger = this.querySelector("#hamburgerBtn");
        const sidebar   = this.querySelector("#appSidebar");
        const overlay   = this.querySelector("#sidebarOverlay");
        const closeBtn  = this.querySelector("#sidebarClose");

        const openSidebar = () => {
            sidebar.classList.add("open");
            overlay.classList.add("show");
            hamburger.classList.add("open");
            document.body.style.overflow = "hidden";
        };

        const closeSidebar = () => {
            sidebar.classList.remove("open");
            overlay.classList.remove("show");
            hamburger.classList.remove("open");
            document.body.style.overflow = "";
        };

        hamburger.addEventListener("click", openSidebar);
        closeBtn.addEventListener("click", closeSidebar);
        overlay.addEventListener("click", closeSidebar);

        // Smooth scroll: solo si el target existe en la página actual (index.html)
        this.querySelectorAll(".sidebar-scroll").forEach(link => {
            link.addEventListener("click", (e) => {
                const section = link.dataset.section;
                const target  = document.querySelector(`.${section}`);
                if (target) {
                    e.preventDefault();
                    closeSidebar();
                    setTimeout(() => {
                        const headerH = document.querySelector(".appHeader")?.offsetHeight || 0;
                        const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 20;
                        window.scrollTo({ top, behavior: "smooth" });
                    }, 300);
                }
                // Si no existe el target (otras páginas), navega al href normalmente
            });
        });

        // Close sidebar on Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeSidebar();
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