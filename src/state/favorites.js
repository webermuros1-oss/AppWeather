/**
 * Gestión de ciudades favoritas (persistencia en localStorage).
 *
 * Mejoras sobre la versión original:
 *  - Claves de almacenamiento namespaced (evitan colisiones).
 *  - Validación de la forma de los datos al cargar (defensa ante storage corrupto).
 *  - `storage` inyectable → testeable sin depender del global.
 */

import { MAX_FAVORITES, STORAGE_KEYS } from "../core/config.js";

/** @param {any} c @returns {boolean} */
function isValidCity(c) {
  return (
    c &&
    typeof c.name === "string" &&
    Number.isFinite(c.latitude) &&
    Number.isFinite(c.longitude)
  );
}

export class FavoritesManager {
  constructor(max = MAX_FAVORITES, storage = globalThis.localStorage) {
    this.max = max;
    this.storage = storage;
    this.favorites = this._load();

    const last = this._get(STORAGE_KEYS.lastCity);
    if (last && this.favorites.length) {
      const i = this.favorites.findIndex((c) => c.name === last);
      this.currentIndex = i !== -1 ? i : 0;
    } else {
      this.currentIndex = 0;
    }
  }

  _get(key) {
    try {
      return this.storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  _set(key, value) {
    try {
      this.storage?.setItem(key, value);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  _load() {
    const raw = this._get(STORAGE_KEYS.favorites);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isValidCity) : [];
    } catch {
      return [];
    }
  }

  _save() {
    this._set(STORAGE_KEYS.favorites, JSON.stringify(this.favorites));
  }

  saveLastCity(name) {
    this._set(STORAGE_KEYS.lastCity, name);
  }

  /** Añade (o reordena) una ciudad; devuelve true si se guardó. */
  addCity(d) {
    const city = { name: d?.name, country: d?.country, latitude: d?.latitude, longitude: d?.longitude };
    if (!isValidCity(city)) return false;

    const i = this.favorites.findIndex((c) => c.name === city.name);
    if (i !== -1) this.favorites.splice(i, 1);
    this.favorites.push(city);
    if (this.favorites.length > this.max) this.favorites.shift();

    this.currentIndex = this.favorites.length - 1;
    this.saveLastCity(city.name);
    this._save();
    return true;
  }

  getCurrentCity() {
    return this.favorites[this.currentIndex] ?? null;
  }

  goToPrevious() {
    if (!this.favorites.length) return null;
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.favorites.length - 1;
    return this.getCurrentCity();
  }

  goToNext() {
    if (!this.favorites.length) return null;
    this.currentIndex = this.currentIndex < this.favorites.length - 1 ? this.currentIndex + 1 : 0;
    return this.getCurrentCity();
  }

  goToIndex(i) {
    if (i >= 0 && i < this.favorites.length) {
      this.currentIndex = i;
      return this.getCurrentCity();
    }
    return null;
  }

  getAllCities() {
    return this.favorites;
  }

  getCount() {
    return this.favorites.length;
  }
}
