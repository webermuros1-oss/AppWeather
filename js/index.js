let titleLogo = document.querySelector(".title");
let bodyElem = document.querySelector("body");

window.addEventListener("load", () => {
	changeBackgroundImage();
});

let cityInput = document.querySelector("#get-city");
cityInput.addEventListener("keypress", (event) => {
	if (event.key == "Enter") {
		fetchDataFromApi();
	}
});

// Cargar New York por defecto
cityInput.value = "new york";
fetchDataFromApi();
cityInput.value = "";

// Función para cambiar la imagen de fondo
function changeBackgroundImage() {
	let randNum = Math.ceil(Math.random() * 5);
	bodyElem.style.backgroundImage = `url('/media/images/bg${randNum}.jpg')`;
	if (randNum == 3 || randNum == 4 || randNum == 5) {
		titleLogo.style.color = "white";
	} else {
		titleLogo.style.color = ""; // Restaurar color original
	}
}

// Función para obtener coordenadas de una ciudad usando geocoding
async function fetchDataFromApi() {
	let insertedCity = cityInput.value;
	
	if (!insertedCity) {
		alert("Please enter a city name");
		return;
	}

	try {
		// Paso 1: Obtener coordenadas de la ciudad usando Open-Meteo Geocoding API
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

		// Paso 2: Obtener datos del clima usando las coordenadas
		const weatherResponse = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
		);
		const weatherData = await weatherResponse.json();

		// Combinar datos de ciudad y clima
		const combinedData = {
			name: name,
			country: country,
			temperature: weatherData.current.temperature_2m,
			humidity: weatherData.current.relative_humidity_2m,
			weatherCode: weatherData.current.weather_code
		};

		addDataToDom(combinedData);
		
		// Cambiar imagen de fondo después de obtener los datos
		changeBackgroundImage();
	} catch (error) {
		console.error("Error fetching data:", error);
		alert("Error fetching weather data. Please try again.");
	}
}

let cityName = document.querySelector(".city-name");
let cityTemp = document.querySelector(".weather-deg");
let cityCond = document.querySelector(".weather-condition");
let cityHumidity = document.querySelector(".humidity");
let todayDate = document.querySelector(".date");

function addDataToDom(data) {
	cityName.innerHTML = `${data.name}, ${data.country}`;
	cityTemp.innerHTML = `${Math.round(data.temperature)}°C`;
	cityCond.innerHTML = getWeatherDescription(data.weatherCode);
	cityHumidity.innerHTML = `Humidity: ${data.humidity}%`;
	todayDate.innerHTML = getDate();
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