class MyFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <footer class="appFooter">
        <div class="footerItem active" data-section="mainWeatherCard">
          <i class="fa-solid fa-house"></i>
          <span>Ciudad</span>
        </div>

        <div class="footerItem" data-section="forecastCard">
          <i class="fa-solid fa-cloud"></i>
          <span>Pronóstico</span>
        </div>

        <div class="footerItem" data-section="atmosphereCard">
          <i class="fa-solid fa-wind"></i>
          <span>Atmósfera</span>
        </div>

        <div class="footerItem" data-section="windCard">
          <i class="fa-solid fa-wind"></i>
          <span>Viento</span>
        </div>
        <div class="footerItem" data-section="astroCard">
          <i class="fa-solid fa-calendar-days"></i>
          <span>Astronomía</span>
        </div>
        <div class="footerItem" data-section="marineCard">
          <i class="fa-solid fa-water"></i>
          <span>Marítimo</span>
        </div>
        <div class="footerItem" data-section="airCard">
          <i class="fa-solid fa-air"></i>
          <span>Calidad aire</span>
        </div>
      </footer>
        `;
        
        const footerItems = this.querySelectorAll('.footerItem');
        
        footerItems.forEach(item => {
            item.addEventListener('click', () => {
                
                footerItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                
                const sectionClass = item.getAttribute('data-section');
                const targetElement = document.querySelector(`.${sectionClass}`);
                
                if (targetElement) {
                    
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

customElements.define("footer-plus-weather", MyFooter);