class MyFooter extends HTMLElement {
    connectedCallback() {
        // Detecta si estamos en pages/ o en la raíz
        const inSubfolder = window.location.pathname.includes('/pages/');
        const root  = inSubfolder ? '../'    : '';        // hacia index.html
        const pages = inSubfolder ? ''       : 'pages/';  // hacia pages/charts.html

        // Detecta página activa
        const path = window.location.pathname;
        const isHome   = !path.includes('charts') && !path.includes('radar');
        const isCharts = path.includes('charts');
        const isRadar  = path.includes('radar');

        this.innerHTML = `
        <footer class="appFooter">

            <!-- Inicio → siempre va a index.html -->
            <a href="${root}index.html" class="footerItem ${isHome ? 'active' : ''}">
                <i class="fa-solid fa-house"></i>
                <span>Ciudad</span>
            </a>

            <!-- Horas → index.html + scroll (solo funciona si ya estás en index) -->
            <a href="${root}index.html#hourlyCard" class="footerItem" data-section="hourlyCard">
                <i class="fa-solid fa-clock"></i>
                <span>Horas</span>
            </a>

            <!-- Días → index.html + scroll -->
            <a href="${root}index.html#forecastCard" class="footerItem" data-section="forecastCard">
                <i class="fa-solid fa-cloud"></i>
                <span>Días</span>
            </a>

            <!-- Gráficas -->
            <a href="${pages}charts.html" class="footerItem ${isCharts ? 'active' : ''}">
                <i class="fa-solid fa-chart-line"></i>
                <span>Gráficas</span>
            </a>

            <!-- Radar -->
            <a href="${pages}radar.html" class="footerItem ${isRadar ? 'active' : ''}">
                <i class="fa-solid fa-satellite-dish"></i>
                <span>Radar</span>
            </a>

            <!-- Atmósfera → index.html + scroll -->
            <a href="${root}index.html#atmosphereCard" class="footerItem" data-section="atmosphereCard">
                <i class="fa-solid fa-wind"></i>
                <span>Atmósfera</span>
            </a>

            <!-- Marítimo → index.html + scroll -->
            <a href="${root}index.html#marineCard" class="footerItem" data-section="marineCard">
                <i class="fa-solid fa-water"></i>
                <span>Marítimo</span>
            </a>

        </footer>
        `;

        // Smooth scroll SOLO si el target existe en la página actual (index.html)
        this.querySelectorAll('.footerItem[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                const sectionClass = item.getAttribute('data-section');
                const target = document.querySelector(`.${sectionClass}`);

                if (target) {
                    // Estamos en index.html: hacemos scroll suave
                    e.preventDefault();

                    // Quitar active de todos y ponerlo en el clickeado
                    this.querySelectorAll('.footerItem').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');

                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
                // Si no existe el target, navega normalmente al href (index.html#section)
            });
        });
    }
}

customElements.define("footer-plus-weather", MyFooter);