# 🌤️ PlusWeather – Aplicación Meteorológica PWA

**PlusWeather** es una aplicación web progresiva (PWA) que muestra información meteorológica en tiempo real usando la API de Open-Meteo.  
Permite consultar el clima por ciudad, ver previsiones a 7 días, datos atmosféricos, viento, calidad del aire y datos marítimos.  
Funciona tanto en PC como en móvil y puede instalarse como app.

---

## 🚀 Características

- 🌍 Búsqueda por ciudad  
- 📅 Pronóstico de 7 días  
- ☁️ Condiciones atmosféricas  
- 💨 Viento y rachas  
- 🌅 Datos astronómicos (amanecer, atardecer, UV…)  
- 🌊 Datos marítimos (si están disponibles)  
- 🌫️ Calidad del aire  
- ⭐ Ciudades favoritas con navegación por gestos  
- 📱 Instalación como app (PWA)  
- 📴 Soporte básico offline con Service Worker  

---

## 🗂️ Estructura del proyecto

APPWEATHER/
│
├── css/
│ ├── index.css
│ ├── header.css
│ └── footer.css
│
├── js/
│ ├── index.js
│ ├── header.js
│ ├── footer.js
│ └── serviceWorker.js
│
├── json/
│ └── manifest.json
│
├── media/
│ └── images/
│ ├── logoRemaster.png
│ ├── sunny1.jpg
│ ├── rainy1.jpg
│ └── ...
│
├── pages/
│
├── index.html
└── README.md



---

## 💻 Instalación y uso en PC

### Opción 1: Abrir directamente (modo simple)

1. Descarga o clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/plusweather.git
Entra en la carpeta del proyecto:

bash

cd plusweather
Abre index.html con tu navegador
(doble clic o arrastrándolo a Chrome / Edge / Firefox)

⚠️ Nota:
El Service Worker y el modo PWA no funcionan bien si abres el archivo directamente (file://).
Para probar la PWA correctamente, usa la opción 2.

Opción 2: Usar un servidor local (recomendado)
Método A – Con Node.js
Instala Node.js:
https://nodejs.org

En la carpeta del proyecto:

bash

npx serve .
Abre en el navegador la URL que aparece, por ejemplo:


http://localhost:3000
Método B – Con Python
Si tienes Python instalado:



Abre la web en Chrome móvil.

Pulsa el menú ⋮
→ Añadir a pantalla de inicio

Se instalará como una app independiente.

iPhone (Safari)
Abre la web en Safari.

Pulsa el botón Compartir.

Selecciona Añadir a pantalla de inicio.

⚠️ Nota:
iOS tiene soporte PWA limitado y no usa Service Workers igual que Android.

⚙️ Configuración PWA
El archivo manifest.json define el nombre, icono y comportamiento de la app:

json
Copiar código
{
  "name": "Meteo App",
  "short_name": "Meteo",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    {
      "src": "media/images/logoRemaster.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "media/images/logoRemaster.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
🔌 APIs utilizadas
Geocoding: https://geocoding-api.open-meteo.com

Weather: https://api.open-meteo.com

Marine: https://marine-api.open-meteo.com

Air Quality: https://air-quality-api.open-meteo.com

🛠️ Requisitos
Navegador moderno (Chrome, Edge, Firefox, Safari)

Conexión a Internet para obtener datos meteorológicos

Opcional: Node.js o Python para servidor local

📌 Notas importantes
El icono PWA puede tardar en actualizarse por caché del navegador.

Si no aparece tu icono personalizado:

Borra la app instalada

Limpia caché del navegador

Vuelve a instalarla desde Chrome

📜 Licencia
Este proyecto es de uso libre para fines educativos y personales.
Puedes modificarlo y adaptarlo a tus necesidades.

👨‍💻 Autor
Desarrollado por: [Tu Nombre]
Proyecto: PlusWeather
Año: 2026