# 🌤️ PlusWeather — PWA Meteorológica Inteligente  

> Aplicación meteorológica progresiva (PWA) con pronóstico completo, datos marítimos, calidad del aire y sistema de favoritos.  
> Funciona **100% offline** una vez instalada y ofrece una experiencia rápida, moderna y personalizable.

---

## ✨ Características principales

| Característica | Descripción / Fuente |
|----------------|----------------------|
| 🌦️ Datos meteorológicos en tiempo real | Open-Meteo API |
| 🗓️ Pronóstico 7 días | ☀️🌧️❄️ Extendido |
| 🌡️ Condiciones atmosféricas | Humedad, presión, UV, visibilidad |
| 🌬️ Datos de viento | Velocidad, ráfagas, dirección |
| 🌅 Datos astronómicos | Amanecer, atardecer, horas de sol |
| 🌊 Datos marítimos | Altura de olas, corrientes |
| 🫧 Calidad del aire | PM2.5, PM10, NO₂, O₃ |
| ❤️ Sistema de favoritos (3 ciudades) | Persistente con LocalStorage |
| 👆 Navegación intuitiva | Swipe + flechas |
| 🖼️ Fondos dinámicos | Cambian según condiciones |
| 📲 Instalación PWA | Icono y splash personalizados |
| ⚡ Offline-first | Cache adaptable con Service Worker |
| 💻 Responsive | Compatible en móvil y desktop |

---

## 🤖 Inteligencia Artificial en el desarrollo

**PlusWeather** fue desarrollado con asistencia de **ChatGPT / Claude**, integrando IA en distintos puntos del proceso de construcción.  
La IA sirvió como herramienta de apoyo humano, no como sistema autónomo.  

### 🔧 Roles de la IA

- **Refactorización inteligente** — optimización del `Service Worker` para un cacheo más eficiente.  
- **Depuración asistida** — corrección de errores en la persistencia y restauración de datos desde `LocalStorage`.  
- **Documentación estructurada** — generación de una base multilingüe de documentación técnica.  
- **Revisión UX/UI** — sugerencias para colores, contraste y comportamiento de fondos dinámicos.

### 🚀 Futuras integraciones con IA
- Predicción meteorológica híbrida con análisis histórico.  
- Asistente por voz para consultas locales.  
- Notificaciones contextuales (por tipo de actividad: surf, senderismo, etc).  

---

## 🖼️ Captura de pantalla

![Vista final de PlusWeather](media/images/CapturaFinal.jpg)

---

## 📱 Demo en vivo

👉 [[**https://webermuros1-oss.github.io/AppWeather/**](https://webermuros1-oss.github.io/AppWeather/)](https://webermuros1-oss/AppWeather/)

### Instalar como PWA

1. Abre el enlace en **Chrome o Safari móvil**  
2. Toca el menú → **“Añadir a pantalla de inicio”**  
3. ¡Listo! La aplicación funcionará **sin conexión** 🌍  

---

## 🏗️ Estructura del proyecto

```bash
AppWeather/
├── index.html                # Página principal
├── json/
│   └── manifest.json         # Configuración PWA
├── css/
│   ├── index.css             # Estilos principales
│   ├── header.css            # Header
│   └── footer.css            # Footer
├── js/
│   ├── index.js              # Lógica principal + APIs
│   ├── header.js             # Componente Header
│   ├── footer.js             # Componente Footer
│   └── serviceWorker.js      # Lógica offline
└── media/images/
    ├── logoRemaster192.png   # Icono PWA (192px)
    ├── logoRemaster512.png   # Icono PWA (512px)
    └── fondos_climaticos/    # Fondos dinámicos según clima


🚀 Instalación local
bash
# 1. Clona el repositorio
git clone https://github.com/webermuros1-oss/AppWeather.git
cd AppWeather

# 2. Ejecuta un servidor local (requerido para PWA)
# Opción fácil: usar "Live Server" en VSCode

# 3. Abre en navegador
http://localhost:8000

🔧 APIs utilizadas

https://open-meteo.com/

🎨 Personalización
🏙️ Cambiar ciudad por defecto
Modifica la ciudad principal que aparece al iniciar la app:

js
// js/index.js  — línea ~140
const favoritesManager = new FavoritesManager(3, "Madrid"); // ← Cambia aquí
🗺️ Añadir más ciudades favoritas
Aumenta el número máximo de ciudades que pueden guardarse como favoritas:

js
// js/index.js  — línea ~90
constructor(maxFavorites = 5, defaultCity = "Valencia"); // ← Cambia el 3 por 5
🖼️ Iconos personalizados
Sustituye el icono por defecto de la aplicación por uno propio:

json
// json/manifest.json
"src": "/AppWeather/media/images/logoRemaster.png"
💡 Consejo: usa imágenes en formato PNG de 192x192 y 512x512 px para lograr compatibilidad total con el instalador PWA.

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

### ⚠️ Posibles problemas y soluciones

| 🧩 Problema                                         | 💡 Solución |
|-----------------------------|--------------------------------------------------------------------------------|
| **Icono gris "G"**          | Verifica las rutas definidas en el archivo `manifest.json`. |
| **No carga datos**          | Abre **DevTools → Application → Service Workers** y selecciona **Unregister**, luego recarga la página. |
| **No funciona offline**     | Espera unos segundos tras la primera instalación para que el *Service Worker* complete su registro. |
| **GitHub Pages lento**      | Espera de **2 a 5 minutos** después del último *push* hasta que se refresque el servicio. |


bash
git clone https://github.com/webermuros1-oss/AppWeather.git
Crea una nueva rama para tu funcionalidad o mejora:

bash
git checkout -b feature/nueva-ciudad
Realiza tus cambios y haz un commit descriptivo:

bash
git commit -m "Añade nueva funcionalidad: ciudad adicional"
Sube tu rama al repositorio remoto:

bash
git push origin feature/nueva-ciudad
Abre un Pull Request desde GitHub para revisión y merge.



📄 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.


Made with ❤️ por webermuros1-oss
¡Instala PlusWeather en tu móvil hoy! 🌟

