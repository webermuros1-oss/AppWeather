import { defineConfig } from "vite";
import { resolve } from "node:path";

// La app se sirve como estático (ES Modules nativos) en GitHub Pages sin build.
// Vite se usa solo para: servidor de desarrollo (`npm run dev`), un bundle
// opcional de validación (`npm run build`) y como runner de los tests (Vitest).
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    target: "es2020",
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        charts: resolve(import.meta.dirname, "pages/charts.html"),
        radar: resolve(import.meta.dirname, "pages/radar.html"),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.js"],
    setupFiles: ["tests/setup.js"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      exclude: ["src/**/*-page.js", "src/main.js", "src/ui/**"],
    },
  },
});
