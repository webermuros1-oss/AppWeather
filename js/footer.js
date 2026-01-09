class MyFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <footer class="appFooter">
        <div class="footerItem" data-page="inicio">
          <i class="fa-solid fa-house"></i>
          <span>Inicio</span>
        </div>

        <div class="footerItem active" data-page="hoy">
          <i class="fa-solid fa-calendar-day"></i>
          <span>Hoy</span>
        </div>

        <div class="footerItem" data-page="hora">
          <i class="fa-solid fa-clock"></i>
          <span>Cada hora</span>
        </div>

        <div class="footerItem" data-page="diario">
          <i class="fa-solid fa-calendar"></i>
          <span>Diario</span>
        </div>

        <div class="footerItem" data-page="radar">
          <i class="fa-solid fa-location-crosshairs"></i>
          <span>Radar y mapas</span>
        </div>
      </footer>
        `;
        
        // Funcionalidad de navegación
        const footerItems = this.querySelectorAll('.footerItem');
        
        footerItems.forEach(item => {
            item.addEventListener('click', function() {
                footerItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                const page = this.getAttribute('data-page');
                console.log('Navegando a:', page);
            });
        });
    }
}

customElements.define("footer-plus-weather", MyFooter);