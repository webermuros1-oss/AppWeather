[PlusWeather 🌤️]


Aplicación meteorológica progresiva (PWA) con pronóstico completo, datos marítimos, calidad del aire y favoritos. Funciona 100% offline una vez instalada.

✨ Características
Característica	✅ Estado
Datos meteorológicos en tiempo real	Open-Meteo API
Pronóstico 7 días	☀️🌧️❄️
Condiciones atmosféricas completas	Humedad, presión, UV, visibilidad
Datos de viento detallados	Velocidad, ráfagas, dirección
Datos astronómicos	Amanecer, atardecer, horas de sol
Datos marítimos	Altura de olas, corrientes
Calidad del aire	PM2.5, PM10, NO₂, O₃
Sistema de favoritos (máx. 3 ciudades)	💾 Persistente
Navegación por swipe y flechas	📱👆
Fondos dinámicos según clima	🌤️🌧️⛄
PWA instalable	Icono personalizado
Offline-first	Service Worker
Responsive	Móvil + Desktop


📱 Demo en vivo
🔗 https://webermuros1-oss.github.io/AppWeather/

Para instalar:

Abre en Chrome/Safari móvil

Menú → "Añadir a pantalla de inicio"

¡Listo! Funciona sin internet



🏗️ Estructura del proyecto

AppWeather/
├── index.html          # Página principal
├── json/
│   └── manifest.json   # Configuración PWA
├── css/
│   ├── index.css       # Estilos principales
│   ├── header.css      # Header
│   └── footer.css      # Footer
├── js/
│   ├── index.js        # Lógica principal + APIs
│   ├── header.js       # Web Component Header
│   ├── footer.js       # Web Component Footer
│   └── serviceWorker.js # Cache offline
└── media/images/
    ├── logoRemaster192.png  # Icono PWA 192px
    ├── logoRemaster512.png  # Icono PWA 512px
    ├── fondos climáticos... # Imágenes dinámicas


🚀 Instalación local
bash
# 1. Clona el repositorio
git clone https://github.com/webermuros1-oss/AppWeather.git
cd AppWeather

# 2. Servidor local (importante para PWA)
# Opción A: Live Server (VSCode)

# 3. Abre http://localhost:8000
🔧 APIs utilizadas

https://open-meteo.com/

🎨 Personalización

Cambiar ciudad por defecto
js
// js/index.js línea ~140
const favoritesManager = new FavoritesManager(3, "Madrid"); // ← Cambia aquí
Añadir más ciudades favoritas
js
// js/index.js línea ~90
constructor(maxFavorites = 5, defaultCity = "Valencia") // ← Cambia el 3 por 5
Iconos personalizados
json
// json/manifest.json
"src": "/AppWeather/media/images/logoRemaster.png",

🛠️ Tecnologías
xml
HTML5 | CSS3 | Vanilla JavaScript | PWA | Service Workers | Web Components | LocalStorage | Fetch API | Open-Meteo
🔄 Service Worker (Offline)
Cachea: HTML, CSS, JS, iconos

Excluye: APIs meteorológicas (siempre frescas)

Estrategia: Cache-first (assets) + Network-first (APIs)

📱 Funcionalidades móviles
✅ Swipe izquierda/derecha → Cambiar ciudades

✅ Input predictivo → Buscar cualquier ciudad

✅ Persistencia → Favoritos guardados

✅ Modo oscuro → Automático

✅ Splash screen → Personalizado

⚠️ Posibles problemas y soluciones
Problema	Solución
Icono gris "G"	Verificar rutas en manifest.json
No carga datos	Unregister Service Worker en DevTools
No funciona offline	Esperar instalación SW completa
GitHub Pages lento	Esperar 2-5 min tras push
🤝 Contribuir
Fork el proyecto

Crea tu feature branch (git checkout -b feature/nueva-ciudad)

Commit tus cambios (git commit -m 'Añade X')

Push al branch (git push origin feature/nueva-ciudad)

Abre un Pull Request

📄 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.


Made with ❤️ por webermuros1-oss
¡Instala PlusWeather en tu móvil hoy! 🌟

