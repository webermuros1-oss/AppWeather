if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./js/serviceWorker.js")
            .then(reg => console.log("Service Worker registrado:", reg.scope))
            .catch(err => console.error("Error registrando Service Worker:", err));
    });
}

const elements = {
    cityInput: document.querySelector("#getCity"),
    cityName: document.querySelector(".cityName"),
    cityTemp: document.querySelector(".weatherDeg"),
    cityCondition: document.querySelector(".weatherCondition"),
    todayDate: document.querySelector(".date"),
    weatherIcon: document.querySelector(".weatherIconDisplay"),
    header: document.querySelector("header"),
    mainCard: document.querySelector(".mainWeatherCard"),

    atmosphere: document.querySelector(".atmosphereInfo"),
    wind: document.querySelector(".windInfo"),
    marine: document.querySelector(".marineInfo"),
    forecast: document.querySelector(".forecastInfo"),
    astro: document.querySelector(".astroInfo"),
    hourly: document.querySelector(".hourlyInfo"),

    prevArrow: document.querySelector(".prevArrow"),
    nextArrow: document.querySelector(".nextArrow"),
    favDots: document.getElementById("favDots")
};

const API_URLS = {
    geocoding: "https://geocoding-api.open-meteo.com/v1/search",
    weather: "https://api.open-meteo.com/v1/forecast",
    marine: "https://marine-api.open-meteo.com/v1/marine"
};

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const WEATHER_ICONS = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌦️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
    71: "❄️", 73: "❄️", 75: "❄️", 77: "🌨️",
    80: "🌦️", 81: "🌧️", 82: "⛈️",
    85: "🌨️", 86: "🌨️",
    95: "⛈️", 96: "⛈️", 99: "⛈️"
};

const WEATHER_DESCRIPTIONS = {
    0: "Despejado", 1: "Mayormente despejado",
    2: "Parcialmente nublado", 3: "Nublado",
    45: "Niebla", 48: "Niebla con escarcha",
    51: "Llovizna ligera", 53: "Llovizna moderada", 55: "Llovizna intensa",
    61: "Lluvia ligera", 63: "Lluvia moderada", 65: "Lluvia intensa",
    71: "Nieve ligera", 73: "Nieve moderada", 75: "Nieve intensa", 77: "Granizo",
    80: "Chubascos ligeros", 81: "Chubascos moderados", 82: "Chubascos intensos",
    85: "Nevadas ligeras", 86: "Nevadas intensas",
    95: "Tormenta", 96: "Tormenta con granizo", 99: "Tormenta severa"
};

const BACKGROUND_IMAGES = {
    sunny: ["sunny1", "sunny2", "beach"],
    cloudy: ["cloudy1", "cloudy2"],
    rainy: ["rainy1", "rainy2", "rainy3"],
    snowy: ["snowy1", "snowy2"],
    stormy: ["stormy1", "stormy2"],
    foggy: ["foggy1", "foggy2"],
    default: ["bg1", "bg2", "bg3", "bg4", "bg5"]
};


class FavoritesManager {
    constructor(maxFavorites = 4) {
        this.maxFavorites = maxFavorites;
        this.favorites = this.loadFavorites();
        
        const lastCity = localStorage.getItem("lastCity");
        if (lastCity && this.favorites.length > 0) {
            const index = this.favorites.findIndex(city => city.name === lastCity);
            this.currentIndex = index !== -1 ? index : 0;
        } else {
            this.currentIndex = 0;
        }
    }

    loadFavorites() {
        const saved = localStorage.getItem("favCities");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Asegurarse de que sean objetos con coordenadas
                return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
            } catch (e) {
                console.error("Error al cargar favoritos:", e);
                return [];
            }
        }
        return [];
    }

    saveFavorites() {
        localStorage.setItem("favCities", JSON.stringify(this.favorites));
    }

    saveLastCity(cityName) {
        localStorage.setItem("lastCity", cityName);
    }

    // Ahora recibe un objeto completo con nombre, país y coordenadas
    addCity(cityData) {
        if (!cityData || !cityData.name || !cityData.latitude || !cityData.longitude) {
            console.error("Datos de ciudad incompletos:", cityData);
            return false;
        }

        // Buscar si ya existe
        const existingIndex = this.favorites.findIndex(city => city.name === cityData.name);
        if (existingIndex !== -1) {
            // Actualizar datos y mover al final
            this.favorites.splice(existingIndex, 1);
        }

        // Agregar ciudad al final (más reciente)
        this.favorites.push({
            name: cityData.name,
            country: cityData.country,
            latitude: cityData.latitude,
            longitude: cityData.longitude
        });
        
        // Mantener solo las últimas 4
        if (this.favorites.length > this.maxFavorites) {
            this.favorites.shift();
        }

        this.currentIndex = this.favorites.length - 1;
        this.saveLastCity(cityData.name);
        this.saveFavorites();
        return true;
    }

    getCurrentCity() {
        if (this.favorites.length === 0) return null;
        return this.favorites[this.currentIndex];
    }

    goToPrevious() {
        if (this.favorites.length === 0) return null;
        this.currentIndex = this.currentIndex > 0
            ? this.currentIndex - 1
            : this.favorites.length - 1;
        return this.getCurrentCity();
    }

    goToNext() {
        if (this.favorites.length === 0) return null;
        this.currentIndex = this.currentIndex < this.favorites.length - 1
            ? this.currentIndex + 1
            : 0;
        return this.getCurrentCity();
    }

    goToIndex(index) {
        if (index >= 0 && index < this.favorites.length) {
            this.currentIndex = index;
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

const favoritesManager = new FavoritesManager();

function initializeEventListeners() {
    window.addEventListener("load", async () => {
        changeBackgroundImage();
        
        // Siempre intentar GPS primero
        try {
            console.log("Obteniendo ubicación GPS...");
            const gpsCity = await getCurrentLocation();
            console.log("GPS exitoso:", gpsCity.name);
            
            // Cargar datos del tiempo con GPS
            await fetchDataFromCoordinates(gpsCity.latitude, gpsCity.longitude, gpsCity.name, gpsCity.country);
            
            // Guardar en favoritos con datos completos
            favoritesManager.addCity({
                name: gpsCity.name,
                country: gpsCity.country,
                latitude: gpsCity.latitude,
                longitude: gpsCity.longitude
            });
            
        } catch (error) {
            console.log("GPS no disponible:", error);
            
            // Si GPS falla, intentar cargar la última ciudad guardada
            if (favoritesManager.getCount() > 0) {
                console.log("Cargando última ciudad guardada");
                await loadCityByIndex(favoritesManager.currentIndex);
            } else {
                console.log("No hay ubicación disponible. Busca una ciudad.");
                alert("No se pudo obtener tu ubicación. Por favor, busca una ciudad manualmente.");
            }
        }
    });

    let lastScrollTop = 0;
    window.addEventListener("scroll", () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            elements.header.style.transform = "translateY(-100%)";
        } else {
            elements.header.style.transform = "translateY(0)";
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    elements.cityInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            fetchDataFromApi(true);
        }
    });

    elements.prevArrow.addEventListener("click", async () => {
        const cityData = favoritesManager.goToPrevious();
        if (cityData) {
            await loadCityByName(cityData);
        }
    });

    elements.nextArrow.addEventListener("click", async () => {
        const cityData = favoritesManager.goToNext();
        if (cityData) {
            await loadCityByName(cityData);
        }
    });

    let touchStartX = 0;
    let touchEndX = 0;

    elements.mainCard.addEventListener("touchstart", e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    elements.mainCard.addEventListener("touchend", e => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = 50;

        if (touchStartX - touchEndX > swipeDistance) {
            elements.nextArrow.click();
        } else if (touchEndX - touchStartX > swipeDistance) {
            elements.prevArrow.click();
        }
    });
}


async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocalización no soportada");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    console.log("📍 Coordenadas GPS obtenidas:", { latitude, longitude });
                    
                    // API CORRECTA para geocoding inverso
                    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`;
                    console.log("🔍 Consultando geocoding:", url);
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    console.log("🌍 Respuesta geocoding:", data);
                    
                    if (data.city || data.locality) {
                        const cityData = {
                            name: data.city || data.locality,
                            country: data.countryCode || data.countryName,
                            latitude: latitude,
                            longitude: longitude
                        };
                        console.log("✅ Ciudad detectada:", cityData);
                        resolve(cityData);
                    } else {
                        reject("No se pudo obtener la ciudad");
                    }
                } catch (error) {
                    console.error("❌ Error en geocoding:", error);
                    reject(error);
                }
            },
            (error) => {
                console.error("❌ Error GPS:", error.code, error.message);
                reject("GPS denegado o no disponible");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000  // Permite usar posición reciente (30 segundos)
            }
        );
    });
}

// Nueva función para cargar datos directamente desde coordenadas
async function fetchDataFromCoordinates(latitude, longitude, name, country) {
    try {
        const [weatherData, marineData] = await Promise.all([
            fetchWeatherData(latitude, longitude),
            fetchMarineData(latitude, longitude)
        ]);

        const combinedData = {
            name,
            country,
            ...weatherData,
            ...marineData
        };

        updateUI(combinedData);

    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

async function fetchDataFromApi(saveToFavorites = false) {
    const cityName = elements.cityInput.value.trim();

    if (!cityName) {
        alert("Introduce una ciudad");
        return;
    }

    try {
        const geoData = await fetchGeoData(cityName);
        if (!geoData) return;

        const { latitude, longitude, name, country } = geoData;

        if (saveToFavorites) {
            favoritesManager.addCity({
                name,
                country,
                latitude,
                longitude
            });
        } else {
            favoritesManager.saveLastCity(name);
        }

        const [weatherData, marineData] = await Promise.all([
            fetchWeatherData(latitude, longitude),
            fetchMarineData(latitude, longitude)
        ]);

        const combinedData = {
            name,
            country,
            ...weatherData,
            ...marineData
        };

        updateUI(combinedData);
        elements.cityInput.value = "";

    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error obteniendo datos meteorológicos");
    }
}

async function fetchGeoData(cityName) {
    const url = `${API_URLS.geocoding}?name=${encodeURIComponent(cityName)}&count=1&language=es&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results?.length) {
        alert("Ciudad no encontrada");
        return null;
    }

    return data.results[0];
}

async function fetchWeatherData(latitude, longitude) {
    const params = new URLSearchParams({
        latitude,
        longitude,
        current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,apparent_temperature,precipitation,rain,showers,snowfall,pressure_msl,surface_pressure,cloud_cover,visibility,uv_index,is_day,cape,dew_point_2m",
        hourly: "temperature_2m,precipitation_probability,weather_code,relative_humidity_2m,precipitation",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max",
        timezone: "auto",
        forecast_days: 7
    });

    const response = await fetch(`${API_URLS.weather}?${params}`);
    const data = await response.json();

    return {
        temperature: data.current.temperature_2m,
        apparentTemperature: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        dewPoint: data.current.dew_point_2m,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        windGusts: data.current.wind_gusts_10m,
        weatherCode: data.current.weather_code,
        precipitation: data.current.precipitation,
        rain: data.current.rain,
        showers: data.current.showers,
        snowfall: data.current.snowfall,
        pressure: data.current.pressure_msl,
        surfacePressure: data.current.surface_pressure,
        cloudCover: data.current.cloud_cover,
        visibility: data.current.visibility,
        uvIndex: data.current.uv_index,
        cape: data.current.cape,
        dailyForecast: data.daily,
        hourlyForecast: data.hourly
    };
}

async function fetchMarineData(latitude, longitude) {
    try {
        const params = new URLSearchParams({
            latitude,
            longitude,
            current: "wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity,ocean_current_direction",
            timezone: "auto"
        });

        const response = await fetch(`${API_URLS.marine}?${params}`);

        if (!response.ok) {
            return { hasMarineData: false };
        }

        const data = await response.json();
        return {
            hasMarineData: true,
            marine: data.current
        };
    } catch {
        return { hasMarineData: false };
    }
}

async function loadCityByIndex(index) {
    const cityData = favoritesManager.goToIndex(index);
    if (cityData) {
        await loadCityByCoordinates(cityData);
    }
}

async function loadCityByName(cityData) {
    await loadCityByCoordinates(cityData);
}

async function loadCityByCoordinates(cityData) {
    if (!cityData || !cityData.latitude || !cityData.longitude) {
        console.error("Datos de ciudad incompletos:", cityData);
        return;
    }
    
    try {
        console.log("🔄 Cargando ciudad desde coordenadas:", cityData.name);
        await fetchDataFromCoordinates(
            cityData.latitude,
            cityData.longitude,
            cityData.name,
            cityData.country
        );
        favoritesManager.saveLastCity(cityData.name);
        console.log("✅ Ciudad cargada exitosamente:", cityData.name);
    } catch (error) {
        console.error("❌ Error cargando ciudad:", cityData.name, error);
        alert(`No se pudo cargar ${cityData.name}. Por favor, intenta con otra ciudad.`);
    }
}

function updateUI(data) {
    updateMainCard(data);
    updateAtmosphere(data);
    updateWind(data);
    updateForecast(data);
    updateAstro(data);
    updateMarine(data);
    updateHourly(data);
    updateDots();
    changeBackgroundImage(data.weatherCode);
    scrollToTop();
}

function updateHourly(data) {
    if (!data.hourlyForecast) {
        elements.hourly.innerHTML = `<p class="notAvailable">Pronóstico horario no disponible</p>`;
        return;
    }

    const now = new Date();
    const currentHourIndex = data.hourlyForecast.time.findIndex(time => new Date(time) > now);
    const next12Hours = currentHourIndex !== -1 ? 
        data.hourlyForecast.time.slice(currentHourIndex, currentHourIndex + 12) : 
        data.hourlyForecast.time.slice(0, 12);

    const hourlyHTML = next12Hours.map((time, i) => {
        const hourIndex = currentHourIndex + i;
        const hourTime = new Date(time).toLocaleTimeString("es-ES", { 
            hour: "2-digit", 
            minute: "2-digit",
            hour12: false 
        });
        const temp = Math.round(data.hourlyForecast.temperature_2m[hourIndex]);
        const weatherCode = data.hourlyForecast.weather_code[hourIndex];
        const rainProb = data.hourlyForecast.precipitation_probability[hourIndex] || 0;
        const precip = data.hourlyForecast.precipitation[hourIndex] || 0;

        return `
            <div class="hourItem">
                <span class="hour">${hourTime}</span>
                <span class="hourIcon">${getWeatherIcon(weatherCode)}</span>
                <span class="hourTemp">${temp}°</span>
                ${precip > 0 ? `<span class="hourRain">💧 ${precip}mm</span>` : `<span class="hourRain">💧 ${rainProb}%</span>`}
            </div>
        `;
    }).join("");

    elements.hourly.innerHTML = hourlyHTML;
}

function updateMainCard(data) {
    elements.weatherIcon.innerHTML = getWeatherIcon(data.weatherCode);
    elements.cityName.innerHTML = `${data.name}, ${data.country}`;
    elements.cityTemp.innerHTML = `${Math.round(data.temperature)}°C`;
    elements.cityCondition.innerHTML = getWeatherDescription(data.weatherCode);
    elements.todayDate.innerHTML = getCurrentDate();
}

function updateAtmosphere(data) {
    const items = [
        `💧 <strong>${data.humidity}%</strong> Humedad`,
        `🌡️ <strong>${Math.round(data.apparentTemperature)}°C</strong> Sensación térmica`,
        `💧 <strong>${data.dewPoint?.toFixed(1) || 0}°C</strong> Punto de rocío`,
        `🌧️ <strong>${data.precipitation || 0} mm</strong> Precipitación`,
        data.rain > 0 ? `🌧️ <strong>${data.rain} mm</strong> Lluvia` : null,
        data.showers > 0 ? `🌦️ <strong>${data.showers} mm</strong> Chubascos` : null,
        data.snowfall > 0 ? `❄️ <strong>${data.snowfall} cm</strong> Nieve` : null,
        `📊 <strong>${Math.round(data.pressure)} hPa</strong> Presión atmosférica`,
        `📉 <strong>${Math.round(data.surfacePressure)} hPa</strong> Presión superficial`,
        `☁️ <strong>${data.cloudCover}%</strong> Nubosidad`,
        `👁️ <strong>${(data.visibility / 1000).toFixed(1)} km</strong> Visibilidad`,
        `☀️ <strong>${data.uvIndex || 0}</strong> Índice UV`,
        data.cape ? `⚡ <strong>${Math.round(data.cape)} J/kg</strong> CAPE` : null
    ].filter(Boolean);

    elements.atmosphere.innerHTML = items.map(item => `<p>${item}</p>`).join("");
}

function updateWind(data) {
    elements.wind.innerHTML = `
    <p>💨 <strong>${Math.round(data.windSpeed)} km/h</strong> Velocidad ${getWindDirection(data.windDirection)}</p>
    <p>💨 <strong>${Math.round(data.windGusts)} km/h</strong> Rachas de viento</p>
    <p>🧭 <strong>${Math.round(data.windDirection)}°</strong> Dirección</p>
`;
}

function updateForecast(data) {
    const forecastHTML = data.dailyForecast.time.slice(0, 7).map((date, i) => {
        const dayDate = new Date(date);
        const maxTemp = data.dailyForecast.temperature_2m_max[i];
        const minTemp = data.dailyForecast.temperature_2m_min[i];
        const rainProb = data.dailyForecast.precipitation_probability_max?.[i] || 0;
        const weatherCode = data.dailyForecast.weather_code[i];

        return `
        <div class="forecastDay">
        <span class="forecastDayName">${i === 0 ? "Hoy" : DAYS[dayDate.getDay()]}</span>
        <span class="forecastIcon">${getWeatherIcon(weatherCode)}</span>
        <div class="forecastTemps">
            <span class="forecastMax">${Math.round(maxTemp)}°</span>
            <span class="forecastMin">${Math.round(minTemp)}°</span>
        </div>
        <span class="forecastRain">💧 ${rainProb}%</span>
        </div>
        `;
    }).join("");

    elements.forecast.innerHTML = forecastHTML;
}

function updateAstro(data) {
    const sunrise = new Date(data.dailyForecast.sunrise[0]).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const sunset = new Date(data.dailyForecast.sunset[0]).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const daylightHours = (data.dailyForecast.daylight_duration[0] / 3600).toFixed(1);
    const sunshineHours = (data.dailyForecast.sunshine_duration[0] / 3600).toFixed(1);
    const maxUV = data.dailyForecast.uv_index_max[0] || 0;

    elements.astro.innerHTML = `
    <p>🌅 <strong>${sunrise}</strong> Amanecer</p>
    <p>🌇 <strong>${sunset}</strong> Atardecer</p>
    <p>☀️ <strong>${daylightHours} h</strong> Luz del día</p>
    <p>🌞 <strong>${sunshineHours} h</strong> Horas de sol</p>
    <p>☀️ <strong>${maxUV}</strong> UV máximo</p>
`;
}

function updateMarine(data) {
    if (!data.hasMarineData || !data.marine) {
        elements.marine.innerHTML = `<p class="notAvailable">Datos marítimos no disponibles</p>`;
        return;
    }

    const m = data.marine;
    elements.marine.innerHTML = `
    <p>🌊 <strong>${m.wave_height?.toFixed(2) || 0} m</strong> Altura de olas</p>
    <p>🧭 <strong>${Math.round(m.wave_direction || 0)}°</strong> Dirección olas</p>
    <p>⏱️ <strong>${m.wave_period?.toFixed(1) || 0} s</strong> Período de olas</p>
    <p>💨 <strong>${m.wind_wave_height?.toFixed(2) || 0} m</strong> Olas de viento</p>
    <p>🌀 <strong>${m.swell_wave_height?.toFixed(2) || 0} m</strong> Oleaje</p>
    <p>🌊 <strong>${m.ocean_current_velocity?.toFixed(2) || 0} m/s</strong> Corriente oceánica</p>
    <p>🧭 <strong>${Math.round(m.ocean_current_direction || 0)}°</strong> Dirección corriente</p>
`;
}

function updateDots() {
    const cities = favoritesManager.getAllCities();
    const currentIndex = favoritesManager.currentIndex;

    elements.favDots.innerHTML = cities
        .map((_, i) => `<div class="dot ${i === currentIndex ? "active" : ""}"></div>`)
        .join("");
}

function changeBackgroundImage(weatherCode = null) {
    if (!elements.mainCard) return;

    let imageCategory = "default";

    if (weatherCode !== null) {
        if (weatherCode === 0 || weatherCode === 1) imageCategory = "sunny";
        else if (weatherCode === 2 || weatherCode === 3) imageCategory = "cloudy";
        else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) imageCategory = "rainy";
        else if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) imageCategory = "snowy";
        else if (weatherCode >= 95 && weatherCode <= 99) imageCategory = "stormy";
        else if (weatherCode === 45 || weatherCode === 48) imageCategory = "foggy";
    }

    const images = BACKGROUND_IMAGES[imageCategory];
    const selectedImage = images[Math.floor(Math.random() * images.length)];
    elements.mainCard.style.backgroundImage = `url('media/images/${selectedImage}.jpg')`;
}

function getWindDirection(degrees) {
    const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
    return degrees != null ? `(${directions[Math.round(degrees / 45) % 8]})` : "";
}

function getWeatherIcon(code) {
    return WEATHER_ICONS[code] || "🌡️";
}

function getWeatherDescription(code) {
    return WEATHER_DESCRIPTIONS[code] || "Desconocido";
}

function getCurrentDate() {
    const d = new Date();
    return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

initializeEventListeners();