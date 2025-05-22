
const API_KEY = 'your_api_key';


let tempUnit = 'metric';
let tempSymbol = '°C';


let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];


const MOCK_WEATHER_DATA = {
    name: "Sample City",
    sys: { 
        country: "US",
        sunrise: Math.floor(Date.now()/1000 - 3600),
        sunset: Math.floor(Date.now()/1000 + 3600*6)
    },
    main: {
        temp: 22,
        feels_like: 23,
        humidity: 65,
        pressure: 1013
    },
    weather: [
        { description: "partly cloudy", icon: "02d", main: "Clouds" }
    ],
    wind: { speed: 5.2, deg: 180 },
    visibility: 10000
};

const MOCK_FORECAST_DATA = {
    list: Array(40).fill().map((_, index) => ({
        dt: Math.floor(Date.now()/1000 + index * 3600 * 3),
        main: { 
            temp: 20 + Math.floor(Math.random() * 10), 
            humidity: 60 + Math.floor(Math.random() * 20),
            pressure: 1010 + Math.floor(Math.random() * 10)
        },
        weather: [{ 
            description: ["clear sky", "few clouds", "scattered clouds", "light rain"][Math.floor(Math.random() * 4)], 
            icon: ["01d", "02d", "03d", "10d"][Math.floor(Math.random() * 4)],
            main: ["Clear", "Clouds", "Rain"][Math.floor(Math.random() * 3)]
        }],
        wind: {
            speed: 2 + Math.random() * 8,
            deg: Math.floor(Math.random() * 360)
        }
    })),
    city: {
        name: "Sample City",
        country: "US",
        sunrise: Math.floor(Date.now()/1000 - 3600),
        sunset: Math.floor(Date.now()/1000 + 3600*6)
    }
};


const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const locationBtn = document.getElementById('location-btn');
const errorContainer = document.getElementById('error-container');
const weatherContainer = document.getElementById('weather-container');


const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const forecastContainer = document.getElementById('forecast-container');


const searchHistoryContainer = document.createElement('div');
searchHistoryContainer.id = 'search-history';
searchHistoryContainer.className = 'search-history';
document.querySelector('.search-container').after(searchHistoryContainer);

const unitToggleBtn = document.createElement('button');
unitToggleBtn.id = 'unit-toggle';
unitToggleBtn.className = 'unit-toggle';
unitToggleBtn.textContent = 'Switch to °F';
document.querySelector('.search-container').appendChild(unitToggleBtn);


searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    
    if (city) {
        getWeatherData(city);
        cityInput.value = '';
    } else {
        showError('Please enter a city name');
    }
});

locationBtn.addEventListener('click', function() {
    if (navigator.geolocation) {
        locationBtn.disabled = true;
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoordinates(latitude, longitude);
            locationBtn.disabled = false;
        }, error => {
            showError('Unable to retrieve your location');
            locationBtn.disabled = false;
        });
    } else {
        showError('Geolocation is not supported by your browser');
    }
});


unitToggleBtn.addEventListener('click', function() {
    if (tempUnit === 'metric') {
        tempUnit = 'imperial';
        tempSymbol = '°F';
        this.textContent = 'Switch to °C';
    } else {
        tempUnit = 'metric';
        tempSymbol = '°C';
        this.textContent = 'Switch to °F';
    }
    
    const currentCity = cityName.textContent.split(',')[0];
    if (currentCity && currentCity !== "Sample City") {
        getWeatherData(currentCity);
    } else {
        displayMockDataWithCurrentUnit();
    }
});

function displayMockDataWithCurrentUnit() {
    const mockDataCopy = JSON.parse(JSON.stringify(MOCK_WEATHER_DATA));
    const mockForecastCopy = JSON.parse(JSON.stringify(MOCK_FORECAST_DATA));
    
    if (tempUnit === 'imperial') {
        mockDataCopy.main.temp = (mockDataCopy.main.temp * 9/5) + 32;
        mockDataCopy.main.feels_like = (mockDataCopy.main.feels_like * 9/5) + 32;
        
        mockForecastCopy.list.forEach(forecast => {
            forecast.main.temp = (forecast.main.temp * 9/5) + 32;
        });
    }
    
    displayWeatherData(mockDataCopy, mockForecastCopy);
    showApiKeyError();
}

function updateSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.unshift(city);
        
        if (searchHistory.length > 5) {
            searchHistory.pop();
        }
        
        localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
        displaySearchHistory();
    }
}

function displaySearchHistory() {
    searchHistoryContainer.innerHTML = '';
    
    if (searchHistory.length > 0) {
        const historyTitle = document.createElement('h3');
        historyTitle.textContent = 'Search History';
        searchHistoryContainer.appendChild(historyTitle);
        
        const historyList = document.createElement('div');
        historyList.className = 'history-list';
        
        searchHistory.forEach(city => {
            const historyItem = document.createElement('button');
            historyItem.className = 'history-item';
            historyItem.textContent = city;
            historyItem.addEventListener('click', () => {
                getWeatherData(city);
            });
            historyList.appendChild(historyItem);
        });
        
        searchHistoryContainer.appendChild(historyList);
        searchHistoryContainer.style.display = 'block';
    } else {
        searchHistoryContainer.style.display = 'none';
    }
}

async function getWeatherData(city) {
    try {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${tempUnit}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${tempUnit}`;
        
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        const forecastResponse = await fetch(forecastUrl);
        
        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            if (currentWeatherResponse.status === 401 || forecastResponse.status === 401) {
                showApiKeyError();
                displayMockDataWithCurrentUnit();
                return;
            }
            throw new Error('City not found or API error');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();
        
        updateSearchHistory(city);
        displayWeatherData(currentWeatherData, forecastData);
        hideError();
    } catch (error) {
        showError(error.message);
    }
}

async function getWeatherByCoordinates(lat, lon) {
    try {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${tempUnit}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${tempUnit}`;
        
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        const forecastResponse = await fetch(forecastUrl);
        
        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            if (currentWeatherResponse.status === 401 || forecastResponse.status === 401) {
                showApiKeyError();
                displayMockDataWithCurrentUnit();
                return;
            }
            throw new Error('Unable to fetch weather data');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();
        
        updateSearchHistory(currentWeatherData.name);
        displayWeatherData(currentWeatherData, forecastData);
        hideError();
    } catch (error) {
        showError(error.message);
    }
}

function displayWeatherData(currentData, forecastData) {
    cityName.textContent = `${currentData.name}, ${currentData.sys.country}`;
    const iconCode = currentData.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    temperature.textContent = `${Math.round(currentData.main.temp)}${tempSymbol}`;
    weatherDescription.textContent = currentData.weather[0].description;
    feelsLike.textContent = `${Math.round(currentData.main.feels_like)}${tempSymbol}`;
    humidity.textContent = `${currentData.main.humidity}%`;
    
    if (tempUnit === 'metric') {
        wind.textContent = `${Math.round(currentData.wind.speed * 3.6)} km/h`;
    } else {
        wind.textContent = `${Math.round(currentData.wind.speed)} mph`;
    }
    
    const currentWeatherDiv = document.querySelector('.current-weather');
    
    let extraDetails = document.getElementById('extra-details');
    if (!extraDetails) {
        extraDetails = document.createElement('div');
        extraDetails.id = 'extra-details';
        extraDetails.className = 'extra-details';
        currentWeatherDiv.appendChild(extraDetails);
    }
    
    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    extraDetails.innerHTML = `
        <div class="detail-row">
            <div class="detail">
                <span>Sunrise</span>
                <p>${formatTime(currentData.sys.sunrise)}</p>
            </div>
            <div class="detail">
                <span>Sunset</span>
                <p>${formatTime(currentData.sys.sunset)}</p>
            </div>
            <div class="detail">
                <span>Pressure</span>
                <p>${currentData.main.pressure} hPa</p>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail">
                <span>Visibility</span>
                <p>${(currentData.visibility / 1000).toFixed(1)} km</p>
            </div>
            <div class="detail">
                <span>Wind Direction</span>
                <p>${getWindDirection(currentData.wind.deg)}</p>
            </div>
        </div>
    `;
    
    setWeatherBackground(currentData.weather[0].main);
    displayForecast(forecastData);
    weatherContainer.style.display = 'block';
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
}

function setWeatherBackground(weatherType) {
    const container = document.querySelector('.container');
    
    container.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'foggy', 'thunderstorm');
    
    switch(weatherType) {
        case 'Clear':
            container.classList.add('sunny');
            break;
        case 'Clouds':
            container.classList.add('cloudy');
            break;
        case 'Rain':
        case 'Drizzle':
            container.classList.add('rainy');
            break;
        case 'Snow':
            container.classList.add('snowy');
            break;
        case 'Mist':
        case 'Fog':
        case 'Haze':
            container.classList.add('foggy');
            break;
        case 'Thunderstorm':
            container.classList.add('thunderstorm');
            break;
    }
}

function displayForecast(forecastData) {
    forecastContainer.innerHTML = '';
    let dailyForecasts = [];
    
    if (forecastData.list && forecastData.list.length > 0) {
        const forecastsByDay = {};
        
        forecastData.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const day = date.toLocaleDateString();
            
            if (!forecastsByDay[day]) {
                forecastsByDay[day] = [];
            }
            
            forecastsByDay[day].push(forecast);
        });
        
        dailyForecasts = Object.values(forecastsByDay).map(dayForecasts => {
            return dayForecasts.reduce((closest, current) => {
                const currentTime = new Date(current.dt * 1000);
                currentTime.setHours(12, 0, 0, 0);
                const currentDistance = Math.abs(currentTime.getTime() - new Date(current.dt * 1000).getTime());
                
                const closestTime = new Date(closest.dt * 1000);
                closestTime.setHours(12, 0, 0, 0);
                const closestDistance = Math.abs(closestTime.getTime() - new Date(closest.dt * 1000).getTime());
                
                return currentDistance < closestDistance ? current : closest;
            });
        }).slice(0, 5);
    }
    
    while (dailyForecasts.length < 5) {
        const lastDay = dailyForecasts.length > 0 ? 
            dailyForecasts[dailyForecasts.length - 1].dt : Math.floor(Date.now() / 1000);
        
        dailyForecasts.push({
            dt: lastDay + 86400,
            main: {
                temp: 20 + Math.floor(Math.random() * 10),
                humidity: 60 + Math.floor(Math.random() * 20)
            },
            weather: [{
                description: "forecast data",
                icon: "03d"
            }]
        });
    }
    
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const iconCode = forecast.weather[0].icon;
        
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <h4>${day}</h4>
            <p class="forecast-date">${formattedDate}</p>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Weather icon">
            <p class="forecast-temp">${Math.round(forecast.main.temp)}${tempSymbol}</p>
            <p>${forecast.weather[0].description}</p>
            <p>${forecast.main.humidity}% humidity</p>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

function showError(message) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    weatherContainer.style.display = 'none';
}

function showApiKeyError() {
    errorContainer.innerHTML = `
        <strong>API Key Error</strong>
        <p>Using sample data for demonstration purposes.</p>
        <p>For live data, please get a new API key from <a href="https://home.openweathermap.org/users/sign_up" target="_blank">OpenWeatherMap</a>.</p>
    `;
    errorContainer.style.display = 'block';
}

function hideError() {
    errorContainer.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    displaySearchHistory();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoordinates(latitude, longitude);
        }, () => {
            if (searchHistory.length > 0) {
                getWeatherData(searchHistory[0]);
            } else {
                displayMockDataWithCurrentUnit();
                showApiKeyError();
            }
        });
    } else {
        if (searchHistory.length > 0) {
            getWeatherData(searchHistory[0]);
        } else {
            displayMockDataWithCurrentUnit();
            showApiKeyError();
        }
    }
});
