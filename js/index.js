/* =====================
   ELEMENTOS BASE
===================== */
const cityInput = document.querySelector("#getCity");
const cityName = document.querySelector(".cityName");
const cityTemp = document.querySelector(".weatherDeg");
const cityCondition = document.querySelector(".weatherCondition");
const todayDate = document.querySelector(".date");

const atmosphereContainer = document.querySelector(".atmosphereInfo");
const windContainer = document.querySelector(".windInfo");
const marineContainer = document.querySelector(".marineInfo");
const forecastContainer = document.querySelector(".forecastInfo");
const astroContainer = document.querySelector(".astroInfo");
const airContainer = document.querySelector(".airInfo");

/* =====================
   EVENTOS
===================== */
window.addEventListener("load", () => {
	changeBackgroundImage();
	// Cargar ciudad por defecto
	setTimeout(() => {
		cityInput.value = "A Coruña";
		fetchDataFromApi();
		cityInput.value = "";
	}, 100);
});

// Ocultar header al hacer scroll
let lastScrollTop = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	
	if (scrollTop > lastScrollTop && scrollTop > 100) {
		header.style.transform = "translateY(-100%)";
	} else {
		header.style.transform = "translateY(0)";
	}
	
	lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

cityInput.addEventListener("keypress", (event) => {
	if (event.key === "Enter") {
		fetchDataFromApi();
	}
});

/* =====================
   BACKGROUND DINÁMICO
===================== */
function changeBackgroundImage(weatherCode = null) {
	let bgImages;
	const mainCard = document.querySelector('.mainWeatherCard');
	
	if (!mainCard) return;

	if (weatherCode !== null) {
		if (weatherCode === 0 || weatherCode === 1) {
			bgImages = ["sunny1", "sunny2", "beach"];
		} else if (weatherCode === 2 || weatherCode === 3) {
			bgImages = ["cloudy1", "cloudy2"];
		} else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
			bgImages = ["rainy1", "rainy2", "rainy3"];
		} else if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
			bgImages = ["snowy1", "snowy2"];
		} else if (weatherCode >= 95 && weatherCode <= 99) {
			bgImages = ["stormy1", "stormy2"];
		} else if (weatherCode === 45 || weatherCode === 48) {
			bgImages = ["foggy1", "foggy2"];
		} else {
			bgImages = [`bg${Math.ceil(Math.random() * 5)}`];
		}
	} else {
		bgImages = [`bg${Math.ceil(Math.random() * 5)}`];
	}

	const selectedImage = bgImages[Math.floor(Math.random() * bgImages.length)];
	mainCard.style.backgroundImage = `url('media/images/${selectedImage}.jpg')`;
}

/* =====================
   FETCH PRINCIPAL
===================== */
async function fetchDataFromApi() {
	const insertedCity = cityInput.value.trim();
	if (!insertedCity) return alert("Introduce una ciudad");

	try {
		const geoResponse = await fetch(
			`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(insertedCity)}&count=1&language=es&format=json`
		);
		const geoData = await geoResponse.json();

		if (!geoData.results?.length) {
			return alert("Ciudad no encontrada");
		}

		const { latitude, longitude, name, country } = geoData.results[0];

		const [weatherData, marineData, airQualityData] = await Promise.all([
			fetchWeatherData(latitude, longitude),
			fetchMarineData(latitude, longitude),
			fetchAirQuality(latitude, longitude)
		]);

		const combinedData = {
			name,
			country,
			...weatherData,
			...marineData,
			...airQualityData
		};

		addDataToDom(combinedData);
		changeBackgroundImage(combinedData.weatherCode);
		cityInput.value = "";
		
		// Scroll al inicio de la página
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
		
	} catch (error) {
		console.error(error);
		alert("Error obteniendo datos");
	}
}

/* =====================
   DATOS METEOROLÓGICOS
===================== */
async function fetchWeatherData(latitude, longitude) {
	const response = await fetch(
		`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,apparent_temperature,precipitation,rain,showers,snowfall,pressure_msl,surface_pressure,cloud_cover,visibility,uv_index,is_day,cape,dew_point_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max&timezone=auto&forecast_days=3`
	);
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
		dailyForecast: data.daily
	};
}

/* =====================
   DATOS MARÍTIMOS
===================== */
async function fetchMarineData(latitude, longitude) {
	try {
		const response = await fetch(
			`https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity,ocean_current_direction&timezone=auto`
		);

		if (!response.ok) return { hasMarineData: false };

		const data = await response.json();

		return {
			hasMarineData: true,
			marine: data.current
		};
	} catch {
		return { hasMarineData: false };
	}
}

/* =====================
   CALIDAD DEL AIRE
===================== */
async function fetchAirQuality(latitude, longitude) {
	try {
		const response = await fetch(
			`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust&timezone=auto`
		);

		if (!response.ok) return { hasAirQuality: false };

		const data = await response.json();

		return {
			hasAirQuality: true,
			airQuality: data.current
		};
	} catch {
		return { hasAirQuality: false };
	}
}

/* =====================
   PINTAR DATOS EN DOM
===================== */
function addDataToDom(data) {
	document.querySelector(".weatherIconDisplay").innerHTML = getWeatherIcon(data.weatherCode);

	cityName.innerHTML = `${data.name}, ${data.country}`;
	cityTemp.innerHTML = `${Math.round(data.temperature)}°C`;
	cityCondition.innerHTML = getWeatherDescription(data.weatherCode);
	todayDate.innerHTML = getDate();

	// CONDICIONES ATMOSFÉRICAS
	atmosphereContainer.innerHTML = `
		<p>💧 <strong>${data.humidity}%</strong> Humedad</p>
		<p>🌡️ <strong>${Math.round(data.apparentTemperature)}°C</strong> Sensación térmica</p>
		<p>💧 <strong>${data.dewPoint?.toFixed(1) || 0}°C</strong> Punto de rocío</p>
		<p>🌧️ <strong>${data.precipitation || 0} mm</strong> Precipitación</p>
		${data.rain > 0 ? `<p>🌧️ <strong>${data.rain} mm</strong> Lluvia</p>` : ''}
		${data.showers > 0 ? `<p>🌦️ <strong>${data.showers} mm</strong> Chubascos</p>` : ''}
		${data.snowfall > 0 ? `<p>❄️ <strong>${data.snowfall} cm</strong> Nieve</p>` : ''}
		<p>📊 <strong>${Math.round(data.pressure)} hPa</strong> Presión atmosférica</p>
		<p>📉 <strong>${Math.round(data.surfacePressure)} hPa</strong> Presión superficial</p>
		<p>☁️ <strong>${data.cloudCover}%</strong> Nubosidad</p>
		<p>👁️ <strong>${(data.visibility / 1000).toFixed(1)} km</strong> Visibilidad</p>
		<p>☀️ <strong>${data.uvIndex || 0}</strong> Índice UV</p>
		${data.cape ? `<p>⚡ <strong>${Math.round(data.cape)} J/kg</strong> CAPE</p>` : ''}
	`;

	// INFORMACIÓN DEL VIENTO
	windContainer.innerHTML = `
		<p>💨 <strong>${Math.round(data.windSpeed)} km/h</strong> Velocidad ${getWindDirection(data.windDirection)}</p>
		<p>💨 <strong>${Math.round(data.windGusts)} km/h</strong> Rachas de viento</p>
		<p>🧭 <strong>${Math.round(data.windDirection)}°</strong> Dirección</p>
	`;

	// DATOS MARÍTIMOS
	if (data.hasMarineData && data.marine) {
		marineContainer.innerHTML = `
			<p>🌊 <strong>${data.marine.wave_height?.toFixed(2) || 0} m</strong> Altura de olas</p>
			<p>🧭 <strong>${Math.round(data.marine.wave_direction || 0)}°</strong> Dirección olas</p>
			<p>⏱️ <strong>${data.marine.wave_period?.toFixed(1) || 0} s</strong> Período de olas</p>
			<p>💨 <strong>${data.marine.wind_wave_height?.toFixed(2) || 0} m</strong> Olas de viento</p>
			<p>🌀 <strong>${data.marine.swell_wave_height?.toFixed(2) || 0} m</strong> Oleaje</p>
			<p>🌊 <strong>${data.marine.ocean_current_velocity?.toFixed(2) || 0} m/s</strong> Corriente oceánica</p>
			<p>🧭 <strong>${Math.round(data.marine.ocean_current_direction || 0)}°</strong> Dirección corriente</p>
		`;
	} else {
		marineContainer.innerHTML = `<p class="notAvailable">Datos marítimos no disponibles</p>`;
	}

	// PRONÓSTICO 3 DÍAS
	forecastContainer.innerHTML = "";
	for (let i = 0; i < 3; i++) {
		const date = new Date(data.dailyForecast.time[i]);
		forecastContainer.innerHTML += `
			<div class="forecastDay">
				<span class="forecastDayName">${i === 0 ? 'Hoy' : days[date.getDay()]}</span>
				<span class="forecastIcon">${getWeatherIcon(data.dailyForecast.weather_code[i])}</span>
				<div class="forecastTemps">
					<span class="forecastMax">${Math.round(data.dailyForecast.temperature_2m_max[i])}°</span>
					<span class="forecastMin">${Math.round(data.dailyForecast.temperature_2m_min[i])}°</span>
				</div>
				<span class="forecastRain">💧 ${data.dailyForecast.precipitation_probability_max[i] || 0}%</span>
			</div>
		`;
	}

	// DATOS ASTRONÓMICOS
	const sunrise = new Date(data.dailyForecast.sunrise[0]).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
	const sunset = new Date(data.dailyForecast.sunset[0]).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
	const daylightHours = (data.dailyForecast.daylight_duration[0] / 3600).toFixed(1);
	const sunshineHours = (data.dailyForecast.sunshine_duration[0] / 3600).toFixed(1);

	astroContainer.innerHTML = `
		<p>🌅 <strong>${sunrise}</strong> Amanecer</p>
		<p>🌇 <strong>${sunset}</strong> Atardecer</p>
		<p>☀️ <strong>${daylightHours} h</strong> Luz del día</p>
		<p>🌞 <strong>${sunshineHours} h</strong> Horas de sol</p>
		<p>☀️ <strong>${data.dailyForecast.uv_index_max[0] || 0}</strong> UV máximo</p>
	`;

	// CALIDAD DEL AIRE
	if (data.hasAirQuality && data.airQuality) {
		const aq = data.airQuality;
		airContainer.innerHTML = `
			<p>🌫️ <strong>${aq.pm10?.toFixed(1) || 0} µg/m³</strong> PM10</p>
			<p>🌫️ <strong>${aq.pm2_5?.toFixed(1) || 0} µg/m³</strong> PM2.5</p>
			<p>💨 <strong>${aq.carbon_monoxide?.toFixed(0) || 0} µg/m³</strong> CO</p>
			<p>🏭 <strong>${aq.nitrogen_dioxide?.toFixed(1) || 0} µg/m³</strong> NO₂</p>
			<p>🏭 <strong>${aq.sulphur_dioxide?.toFixed(1) || 0} µg/m³</strong> SO₂</p>
			<p>🌍 <strong>${aq.ozone?.toFixed(1) || 0} µg/m³</strong> O₃</p>
			${aq.dust ? `<p>🏜️ <strong>${aq.dust.toFixed(1)} µg/m³</strong> Polvo</p>` : ''}
		`;
	} else {
		airContainer.innerHTML = `<p class="notAvailable">Datos de calidad del aire no disponibles</p>`;
	}
}

/* =====================
   UTILIDADES
===================== */
function getWindDirection(deg) {
	const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
	return deg != null ? `(${dirs[Math.round(deg / 45) % 8]})` : "";
}

function getWeatherIcon(code) {
	const icons = {
		0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
		45: "🌫️", 48: "🌫️",
		51: "🌦️", 53: "🌦️", 55: "🌧️",
		61: "🌧️", 63: "🌧️", 65: "🌧️",
		71: "❄️", 73: "❄️", 75: "❄️", 77: "🌨️",
		80: "🌦️", 81: "🌧️", 82: "⛈️",
		85: "🌨️", 86: "🌨️",
		95: "⛈️", 96: "⛈️", 99: "⛈️"
	};
	return icons[code] || "🌡️";
}

function getWeatherDescription(code) {
	const desc = {
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
	return desc[code] || "Desconocido";
}

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function getDate() {
	const d = new Date();
	return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

<!-- Base dinámico: detecta si estamos en GitHub Pages -->
    
        (function(){
            const pathParts = window.location.pathname.split('/');
            const isGitHub  = window.location.hostname.includes('github.io');
            const base      = isGitHub ? '/' + pathParts[1] + '/' : '/';
            document.write('<base href="' + base + '">');
        })();
    