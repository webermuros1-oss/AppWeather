let titleLogo = document.querySelector(".title");
let bodyElem = document.querySelector("body");

window.addEventListener("load", () => {
	changeBackgroundImage();
});

let cityInput = document.querySelector("#getCity");
cityInput.addEventListener("keypress", (event) => {
	if (event.key == "Enter") {
		fetchDataFromApi();
	}
});

// Cargar A Coruña por defecto después de un pequeño delay
setTimeout(() => {
	cityInput.value = "A coruña";
	fetchDataFromApi();
	cityInput.value = "";
}, 100);

// Función para cambiar la imagen de fondo según el clima
function changeBackgroundImage(weatherCode = null) {
	let bgImage;
	let useLightText = false;
	
	if (weatherCode !== null) {
		// Seleccionar fondo basado en el código del clima
		if (weatherCode === 0 || weatherCode === 1) {
			// Cielo despejado - playa soleada, campo soleado
			const sunnyImages = ['sunny1', 'sunny2', 'beach'];
			bgImage = sunnyImages[Math.floor(Math.random() * sunnyImages.length)];
			useLightText = false;
		} else if (weatherCode === 2 || weatherCode === 3) {
			// Nublado - cielo con nubes
			const cloudyImages = ['cloudy1', 'cloudy2'];
			bgImage = cloudyImages[Math.floor(Math.random() * cloudyImages.length)];
			useLightText = true;
		} else if (weatherCode >= 61 && weatherCode <= 82) {
			// Lluvia - ciudad lluviosa, gotas en ventana
			const rainyImages = ['rainy1', 'rainy2', 'rainy3'];
			bgImage = rainyImages[Math.floor(Math.random() * rainyImages.length)];
			useLightText = true;
		} else if (weatherCode >= 71 && weatherCode <= 86) {
			// Nieve - paisaje nevado
			const snowyImages = ['snowy1', 'snowy2'];
			bgImage = snowyImages[Math.floor(Math.random() * snowyImages.length)];
			useLightText = false;
		} else if (weatherCode >= 95 && weatherCode <= 99) {
			// Tormenta - cielo tormentoso
			const stormyImages = ['stormy1', 'stormy2'];
			bgImage = stormyImages[Math.floor(Math.random() * stormyImages.length)];
			useLightText = true;
		} else if (weatherCode === 45 || weatherCode === 48) {
			// Niebla
			const foggyImages = ['foggy1', 'foggy2'];
			bgImage = foggyImages[Math.floor(Math.random() * foggyImages.length)];
			useLightText = true;
		} else {
			// Por defecto - aleatorio
			let randomNumber = Math.ceil(Math.random() * 5);
			bgImage = `bg${randomNumber}`;
			useLightText = (randomNumber >= 3);
		}
	} else {
		// Sin código de clima - usar aleatorio
		let randomNumber = Math.ceil(Math.random() * 5);
		bgImage = `bg${randomNumber}`;
		useLightText = (randomNumber >= 3);
	}
	
	bodyElem.style.backgroundImage = `url('/media/images/${bgImage}.jpg')`;
	titleLogo.style.color = useLightText ? "white" : "";
}

// Función para obtener coordenadas de una ciudad usando geocoding
async function fetchDataFromApi() {
	let insertedCity = cityInput.value;
	
	if (!insertedCity) {
		alert("Please enter a city name");
		return;
	}

	try {
		const geoResponse = await fetch(
			`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(insertedCity)}&count=1&language=en&format=json`
		);
		const geoData = await geoResponse.json();

		if (!geoData.results || geoData.results.length === 0) {
			alert("City not found. Please try another city.");
			return;
		}

		const cityData = geoData.results[0];
		const { latitude, longitude, name, country } = cityData;

		const weatherResponse = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
		);
		const weatherData = await weatherResponse.json();

		const combinedData = {
			name: name,
			country: country,
			temperature: weatherData.current.temperature_2m,
			humidity: weatherData.current.relative_humidity_2m,
			weatherCode: weatherData.current.weather_code
		};

		console.log("Weather code:", combinedData.weatherCode); // Para debug

		addDataToDom(combinedData);
		changeBackgroundImage(combinedData.weatherCode);
	} catch (error) {
		console.error("Error fetching data:", error);
		alert("Error fetching weather data. Please try again.");
	}
}

let cityName = document.querySelector(".cityName");
let cityTemp = document.querySelector(".weatherDeg");
let cityCondition = document.querySelector(".weatherCondition");
let cityHumidity = document.querySelector(".humidity");
let todayDate = document.querySelector(".date");

function addDataToDom(data) {
	// Obtener el elemento del icono
	let weatherIconElem = document.querySelector(".weatherIconDisplay");
	
	cityName.innerHTML = `${data.name}, ${data.country}`;
	cityTemp.innerHTML = `${Math.round(data.temperature)}°C`;
	cityCondition.innerHTML = getWeatherDescription(data.weatherCode);
	cityHumidity.innerHTML = `Humidity: ${data.humidity}%`;
	todayDate.innerHTML = getDate();
	
	// Asegurarse de que el elemento existe antes de añadir el icono
	if (weatherIconElem) {
		weatherIconElem.innerHTML = getWeatherIcon(data.weatherCode);
		console.log("Icon set:", getWeatherIcon(data.weatherCode)); // Para debug
	} else {
		console.error("weatherIconDisplay element not found");
	}
}

// Función para obtener el icono según el código del clima
function getWeatherIcon(code) {
	const weatherIcons = {
		0: "☀️",           // Clear sky
		1: "🌤️",          // Mainly clear
		2: "⛅",          // Partly cloudy
		3: "☁️",          // Overcast
		45: "🌫️",         // Foggy
		48: "🌫️",         // Depositing rime fog
		51: "🌦️",         // Light drizzle
		53: "🌦️",         // Moderate drizzle
		55: "🌧️",         // Dense drizzle
		61: "🌧️",         // Slight rain
		63: "🌧️",         // Moderate rain
		65: "⛈️",         // Heavy rain
		71: "🌨️",         // Slight snow
		73: "❄️",          // Moderate snow
		75: "❄️",          // Heavy snow
		77: "❄️",          // Snow grains
		80: "🌦️",         // Slight rain showers
		81: "🌧️",         // Moderate rain showers
		82: "⛈️",         // Violent rain showers
		85: "🌨️",         // Slight snow showers
		86: "❄️",          // Heavy snow showers
		95: "⛈️",         // Thunderstorm
		96: "⛈️",         // Thunderstorm with slight hail
		99: "⛈️"          // Thunderstorm with heavy hail
	};

	return weatherIcons[code] || "🌡️";
}

// Función para convertir el código de clima en descripción
function getWeatherDescription(code) {
	const weatherCodes = {
		0: "Clear sky",
		1: "Mainly clear",
		2: "Partly cloudy",
		3: "Overcast",
		45: "Foggy",
		48: "Depositing rime fog",
		51: "Light drizzle",
		53: "Moderate drizzle",
		55: "Dense drizzle",
		61: "Slight rain",
		63: "Moderate rain",
		65: "Heavy rain",
		71: "Slight snow",
		73: "Moderate snow",
		75: "Heavy snow",
		77: "Snow grains",
		80: "Slight rain showers",
		81: "Moderate rain showers",
		82: "Violent rain showers",
		85: "Slight snow showers",
		86: "Heavy snow showers",
		95: "Thunderstorm",
		96: "Thunderstorm with slight hail",
		99: "Thunderstorm with heavy hail"
	};

	return weatherCodes[code] || "Unknown";
}

let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDate() {
	let newTime = new Date();
	let month = months[newTime.getMonth()];
	return `${newTime.getDate()} ${month} ${newTime.getFullYear()}`;
}