# Weather Dashboard

A responsive web application that displays real-time weather information and forecasts for locations around the world.



## Features

- **Current Weather Display**: Temperature, humidity, wind speed, and weather conditions
- **5-Day Forecast**: Plan ahead with a detailed 5-day weather forecast
- **Search Functionality**: Look up weather by city name
- **Geolocation**: Automatically detect your current location's weather
- **Search History**: Quick access to previously searched cities
- **Temperature Units**: Toggle between Celsius and Fahrenheit
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dynamic Styling**: Background changes based on current weather conditions
- **Additional Weather Details**: Sunrise/sunset times, pressure, visibility, and wind direction

## How to Use

1. **Search for a city**: Enter a city name in the search bar and press "Search" or Enter
2. **Use your location**: Click the location icon to get weather for your current location
3. **View forecast**: Scroll horizontally to see the complete 5-day forecast
4. **Change temperature units**: Click the "Switch to °F/°C" button to toggle between Celsius and Fahrenheit
5. **Access search history**: Click on any city in your search history for quick access

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- OpenWeatherMap API
- Local Storage for search history
- Geolocation API

## Setup

1. Clone or download this repository
2. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
3. Replace the API_KEY constant in script.js with your API key:
   ```javascript
   const API_KEY = 'YOUR_API_KEY_HERE';
   ```
4. Open index.html in your web browser

## API Key

This project uses the OpenWeatherMap API. To get weather data:

1. Sign up for a free account at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up)
2. Generate an API key from your account dashboard
3. Replace the API_KEY value in script.js
4. Note that new API keys may take up to 2 hours to activate

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Improvements

- Weather maps integration
- Hourly forecast
- Weather alerts and notifications
- Air quality index
- Historical weather data
- Dark mode option

## License

This project is available under the MIT License.
