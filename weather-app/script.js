const apiKey = '7128b60745a7dc3d585def9822b203c9';
let isCelsius = true;

const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const currentLocationButton = document.getElementById('current-location');
const unitToggle = document.getElementById('unit-toggle');
const suggestions = document.getElementById('suggestions');

const cityName = document.getElementById('city-name');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');

searchButton.addEventListener('click', () => fetchWeather(cityInput.value));
unitToggle.addEventListener('click', toggleUnit);
currentLocationButton.addEventListener('click', getWeatherByLocation);

// adding event listener for city input (to handle auto-suggest)
cityInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length > 2) {
        await getCitySuggestions(query);
    } else {
        suggestions.innerHTML = ''; // Clear suggestions when input is too short
    }
});

// fetching weather for the current location
function getWeatherByLocation() {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await fetchWeatherByCoords(lat, lon);
    });
}

// fetching weather by city name
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${isCelsius ? 'metric' : 'imperial'}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${isCelsius ? 'metric' : 'imperial'}&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        updateCurrentWeather(data);

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        updateForecast(forecastData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// fetching weather by coordinates = latitude and longitude
async function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${isCelsius ? 'metric' : 'imperial'}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${isCelsius ? 'metric' : 'imperial'}&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        updateCurrentWeather(data);

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        updateForecast(forecastData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// fetching city suggestions
async function getCitySuggestions(query) {
    const url = `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=5&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displaySuggestions(data.list);
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
    }
}

// suggestions
function displaySuggestions(cities) {
    suggestions.innerHTML = ''; // Clear previous suggestions
    cities.forEach(city => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.innerText = city.name;
        suggestionItem.addEventListener('click', () => {
            cityInput.value = city.name;
            fetchWeather(city.name);
            suggestions.innerHTML = ''; // Clear suggestions after selection
        });
        suggestions.appendChild(suggestionItem);
    });
}

// current weather 
function updateCurrentWeather(data) {
    cityName.innerText = data.name;
    description.innerText = data.weather[0].description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    temperature.innerText = `Temperature: ${data.main.temp}°${isCelsius ? 'C' : 'F'}`;
    humidity.innerText = `Humidity: ${data.main.humidity}%`;
    windSpeed.innerText = `Wind Speed: ${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}`;
}

// the 5-day forecast
function updateForecast(data) {
    forecastContainer.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        const icon = forecast.weather[0].icon;
        const temp = forecast.main.temp;

        forecastContainer.innerHTML += `
            <div class="forecast-day">
                <p>${date}</p>
                <img src="http://openweathermap.org/img/w/${icon}.png" alt="Weather icon">
                <p>${temp}°${isCelsius ? 'C' : 'F'}</p>
            </div>
        `;
    }
}

// toggle between celsius and fahrenheit
function toggleUnit() {
    isCelsius = !isCelsius;
    unitToggle.innerText = `Switch to °${isCelsius ? 'F' : 'C'}`;
    fetchWeather(cityInput.value);
}
