# Arquitectura de PlusWeather

Documento de diseño de la refactorización v3.0: de un conjunto de scripts
globales a una **aplicación modular por capas**, con tests y seguridad, sin
perder la simplicidad de despliegue en GitHub Pages.

---

## 1. Principios

1. **Capas con dependencias en un solo sentido** (UI → servicios/dominio →
   core). El dominio es puro y no conoce el DOM ni la red.
2. **ES Modules nativos**: la app corre en el navegador *sin build*. Vite y
   Vitest son solo herramientas de desarrollo.
3. **Cero secretos en el cliente**: todas las APIs son gratuitas y sin clave.
4. **Seguridad por defecto**: sanitización de todo HTML dinámico, CSP, SRI.
5. **Testeable**: la lógica vive en módulos puros con tests unitarios.

---

## 2. Capas

```
┌───────────────────────────────────────────────────────────────┐
│  Entry points        src/main.js · src/pages/*-page.js          │
├───────────────────────────────────────────────────────────────┤
│  App (controladores) src/app/dashboard.js                       │
├───────────────────────────────────────────────────────────────┤
│  UI (render + DOM)   src/ui/* · src/ui/components/*             │
├───────────────────────────────────────────────────────────────┤
│  Servicios (red)     src/services/*  (clima, mar, aire, geo)   │
├───────────────────────────────────────────────────────────────┤
│  Dominio (puro)      src/domain/*  (tides, wind, uv, aqi, ...) │
├───────────────────────────────────────────────────────────────┤
│  Core                src/core/*  (config, http, dom, events)   │
│  i18n                src/i18n/*                                 │
│  Estado              src/state/*  (favoritos)                  │
└───────────────────────────────────────────────────────────────┘
```

| Capa | Responsabilidad | Depende de |
|---|---|---|
| **core** | Config, cliente HTTP (timeout/errores), DOM seguro, bus de eventos | — |
| **domain** | Lógica pura y determinista (mareas, Beaufort, UV, AQI, fondos, WMO) | — |
| **i18n** | Catálogo de traducciones (5 idiomas) y controlador | core |
| **services** | Clientes de API que normalizan la respuesta | core |
| **state** | Favoritos persistidos y validados | core |
| **ui** | Render de tarjetas, modales, iconos, gráficas, Web Components | core, domain, i18n, services |
| **app** | Orquestación de la página principal | todas |
| **entry** | Arranque de cada página (monta componentes, SW, controlador) | app, ui |

> El dominio y el core **no importan** capas superiores: por eso se pueden
> testear sin DOM ni red.

---

## 3. Flujo de datos (home)

```
GPS / buscador ──emit("citySelected")──► dashboard
      dashboard ──► services (fetchWeather, fetchMarine) ─► Open-Meteo
      dashboard ──► domain (computeLunarTides)
      dashboard ──► ui/cards (render*) ──► DOM
```

El desacople entre el buscador (Web Component) y el controlador se hace con un
**bus de eventos** (`CustomEvent` sobre `document`): el header emite
`citySelected` y `langChanged` sin conocer a sus consumidores.

---

## 4. Seguridad

| Medida | Dónde | Qué mitiga |
|---|---|---|
| **Sanitización** `escapeHtml` / `safeHtml` | `src/core/dom.js`, usada en todo render con datos externos | XSS vía nombres de ciudad/calle de las APIs |
| **Sin JSON en atributos** del DOM | `src/ui/cards.js` (referencias por índice) | Inyección y acoplamiento frágil |
| **Content-Security-Policy** | `<meta>` en los 3 HTML | Scripts/orígenes no autorizados; `connect-src` limitado a las APIs usadas |
| **Subresource Integrity (SRI)** | Chart.js, Leaflet, Font Awesome en los HTML | CDN comprometido / manipulación en tránsito |
| **Fallback de iconos sin `onerror` inline** | `src/ui/icons.js` (listener en captura) | Compatible con CSP estricta |
| **Validación de `localStorage`** | `src/state/favorites.js` | Estado corrupto/manipulado |
| **`URLSearchParams` en todas las queries** | `src/core/http.js` (`buildUrl`) | Inyección en la URL |
| **Timeout + AbortController** | `src/core/http.js` | Peticiones colgadas / DoS pasivo |

**Sin secretos**: no hay claves de API en el repositorio (todas las fuentes son
keyless). Verificado en la refactorización.

> **Nota sobre `npm audit`**: las vulnerabilidades reportadas están en
> *devDependencies* (dev-server de Vite / runner de Vitest). **No se despliegan**
> al usuario: la app en producción son archivos estáticos sin dependencias npm
> en tiempo de ejecución. Actualizar requiere subir de major (Vite/Vitest);
> pendiente como tarea aparte para no romper el entorno.

---

## 5. Testing

- **Runner**: Vitest + entorno jsdom.
- **Cobertura de lógica**: dominio (mareas, viento, UV, AQI, fondos, WMO), core
  (sanitización, cliente HTTP), estado (favoritos), i18n y servicios
  (normalización y manejo de errores con `fetch` mockeado).
- **52 tests** en `tests/`.

```bash
npm test            # una pasada
npm run test:watch  # modo watch
npm run test:coverage
```

---

## 6. Despliegue (GitHub Pages)

La app se sirve **tal cual desde la raíz del repositorio** (ES Modules nativos),
igual que antes. **No hace falta build ni CI**: basta con fusionar a `main` y
GitHub Pages sirve `index.html` + `src/`.

- `npm run dev` → servidor de desarrollo (Vite) con recarga.
- `npm run build` → bundle opcional en `dist/` (validación; **no** es el
  artefacto de despliegue, por eso `dist/` está en `.gitignore`).

El **Service Worker** vive en la raíz (`/service-worker.js`) para tener scope
sobre toda la app (antes estaba en `/js/` y no cubría la home).

---

## 7. Flujo de ramas

```
refactor/architecture  ──►  develop  ──►  main
```

Trabajo en rama de feature; fusión a `develop` para integrar y a `main` para
publicar. Sin pull requests (equipo de 2 personas); merges locales.
