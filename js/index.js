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

// Cargar A coruña por defecto después de un pequeño delay
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
			// Cielo despejado - playa soleada
			bgImage = 'sunny1','sunny2','beach';
			useLightText = false;
		} else if (weatherCode === 2 || weatherCode === 3) {
			// Nublado - cielo con nubes
			bgImage = 'cloudy1','cloudy2';
			useLightText = true;
		} else if (weatherCode >= 51 && weatherCode <= 67 || weatherCode >= 80 && weatherCode <= 82) {
			// Lluvia - ciudad lluviosa
			bgImage = 'rainy1','rainy2','rainy3';
			useLightText = true;
		} else if (weatherCode >= 71 && weatherCode <= 77 || weatherCode >= 85 && weatherCode <= 86) {
			// Nieve - paisaje nevado
			bgImage = 'snowy1','snowy2';
			useLightText = false;
		} else if (weatherCode >= 95 && weatherCode <= 99) {
			// Tormenta - cielo tormentoso
			bgImage = 'stormy1','stormy2';
			useLightText = true;
		} else if (weatherCode === 45 || weatherCode === 48) {
			// Niebla
			bgImage = 'foggy1','foggy2';
			useLightText = true;
		} else {
			// Por defecto - aleatorio de tus imágenes originales
			let randomNumber = Math.ceil(Math.random() * 5);
			bgImage = `bg${randomNumber}`;
			useLightText = (randomNumber >= 3);
		}
	} else {
		// Sin código de clima - usar aleatorio de tus imágenes originales
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
		alert("Por favor ingresa el nombre de una ciudad");
		return;
	}

	try {
		const geoResponse = await fetch(
			`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(insertedCity)}&count=1&language=es&format=json`
		);
		const geoData = await geoResponse.json();

		if (!geoData.results || geoData.results.length === 0) {
			alert("Ciudad no encontrada. Por favor intenta con otra ciudad.");
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

		console.log("Weather code:", combinedData.weatherCode);

		addDataToDom(combinedData);
		changeBackgroundImage(combinedData.weatherCode);
	} catch (error) {
		console.error("Error fetching data:", error);
		alert("Error al obtener datos del clima. Por favor intenta de nuevo.");
	}
}

let cityName = document.querySelector(".cityName");
let cityTemp = document.querySelector(".weatherDeg");
let cityCondition = document.querySelector(".weatherCondition");
let cityHumidity = document.querySelector(".humidity");
let todayDate = document.querySelector(".date");

function addDataToDom(data) {
	let weatherIconElem = document.querySelector(".weatherIconDisplay");
	
	cityName.innerHTML = `${data.name}, ${data.country}`;
	cityTemp.innerHTML = `${Math.round(data.temperature)}°C`;
	cityCondition.innerHTML = getWeatherDescription(data.weatherCode);
	cityHumidity.innerHTML = `Humedad: ${data.humidity}%`;
	todayDate.innerHTML = getDate();
	
	if (weatherIconElem) {
		weatherIconElem.innerHTML = getWeatherIcon(data.weatherCode);
		console.log("Icon set:", getWeatherIcon(data.weatherCode));
	} else {
		console.error("weatherIconDisplay element not found");
	}
}

// Función para obtener el icono según el código del clima
function getWeatherIcon(code) {
	const weatherIcons = {
		0: "☀️",
		1: "🌤️",
		2: "⛅",
		3: "☁️",
		45: "🌫️",
		48: "🌫️",
		51: "🌦️",
		53: "🌦️",
		55: "🌧️",
		61: "🌧️",
		63: "🌧️",
		65: "⛈️",
		71: "🌨️",
		73: "❄️",
		75: "❄️",
		77: "❄️",
		80: "🌦️",
		81: "🌧️",
		82: "⛈️",
		85: "🌨️",
		86: "❄️",
		95: "⛈️",
		96: "⛈️",
		99: "⛈️"
	};

	return weatherIcons[code] || "🌡️";
}

// Función para convertir el código de clima en descripción
function getWeatherDescription(code) {
	const weatherCodes = {
		0: "Cielo despejado",
		1: "Mayormente despejado",
		2: "Parcialmente nublado",
		3: "Nublado",
		45: "Neblinoso",
		48: "Niebla con escarcha",
		51: "Llovizna ligera",
		53: "Llovizna moderada",
		55: "Llovizna densa",
		61: "Lluvia ligera",
		63: "Lluvia moderada",
		65: "Lluvia intensa",
		71: "Nevada ligera",
		73: "Nevada moderada",
		75: "Nevada intensa",
		77: "Granizo",
		80: "Chubascos ligeros",
		81: "Chubascos moderados",
		82: "Chubascos violentos",
		85: "Chubascos de nieve ligeros",
		86: "Chubascos de nieve intensos",
		95: "Tormenta eléctrica",
		96: "Tormenta con granizo ligero",
		99: "Tormenta con granizo intenso"
	};

	return weatherCodes[code] || "Desconocido";
}

let months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function getDate() {
	let newTime = new Date();
	let month = months[newTime.getMonth()];
	return `${newTime.getDate()} ${month} ${newTime.getFullYear()}`;
}