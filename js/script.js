const apiKey = '4108d33b8e664f1fa1f84008242509';
const weatherInfo = document.getElementById('weather-info');

// Fetch weather and forecast data by city or coordinates
function fetchWeather(location, isCoords = false) {
    weatherInfo.innerHTML = `<p>Loading...</p>`;

    let query = isCoords ? `lat=${location.lat}&lon=${location.lon}` : `q=${location}`;

    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&${query}&days=7&alerts=yes`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            displayWeatherAlerts(data);
        })
        .catch(error => {
            weatherInfo.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
        });
}

// Display weather information
function displayWeather(data) {
    let currentWeather = `
        <h2>${data.location.name}, ${data.location.country}</h2>
        <p>${data.current.condition.text}</p>
        <p>Temperature: ${data.current.temp_c}°C</p>
        <p>Humidity: ${data.current.humidity}%</p>
    `;

    let forecastHTML = '<h3>7-Day Forecast</h3><div class="forecast-container">';
    data.forecast.forecastday.forEach(day => {
        forecastHTML += `
            <div class="forecast-day">
                <h4>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</h4>
                <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
                <p>${day.day.condition.text}</p>
                <p>Max Temp: ${day.day.maxtemp_c}°C</p>
                <p>Min Temp: ${day.day.mintemp_c}°C</p>
                <p>Humidity: ${day.day.avghumidity}%</p>
            </div>
        `;
    });
    forecastHTML += '</div>';

    weatherInfo.innerHTML = currentWeather + forecastHTML;
}

// Display weather alerts, if any
function displayWeatherAlerts(data) {
    const alerts = data.alerts?.alert || []; // Check if there are any alerts
    const alertSection = document.createElement('div');
    alertSection.id = 'weather-alerts';
    
    if (alerts.length > 0) {
        let alertsHTML = '<h3>Weather Alerts</h3>';
        alerts.forEach(alert => {
            alertsHTML += `
                <div class="alert alert-danger">
                    <strong>${alert.headline}</strong><br>
                    <p>${alert.desc}</p>
                    <p>Severity: ${alert.severity}</p>
                    <p>Effective: ${alert.effective}</p>
                    <p>Expires: ${alert.expires}</p>
                </div>
            `;
        });
        alertSection.innerHTML = alertsHTML;
    } else {
        '<h1>Weather-Alerts</h1>'
        alertSection.innerHTML = `<p>No severe weather alerts at this time.</p>`;
    }

    weatherInfo.appendChild(alertSection);
}

// Fetch current location using Geolocation API
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeather({ lat, lon }, true); // Fetch weather using coordinates
            },
            (error) => {
                weatherInfo.innerHTML = `<p>Error: Unable to retrieve your location. Please enter a city name.</p>`;
            }
        );
    } else {
        weatherInfo.innerHTML = `<p>Geolocation is not supported by your browser.</p>`;
    }
}

// Get weather for user's location on page load
window.onload = function () {
    getLocation();
};

// Fetch weather for entered city when form is submitted
document.getElementById('weather-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const location = document.getElementById('location').value;

    if (location) {
        fetchWeather(location); // Fetch weather by city name
    } else {
        weatherInfo.innerHTML = `<p>Please enter a location.</p>`;
    }
});
// Theme toggle button
const themeToggleBtn = document.getElementById('theme-toggle');

// Check if user has a preferred theme (dark or light) stored in localStorage
let currentTheme = localStorage.getItem('theme');

// Apply the saved theme on page load
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggleBtn.textContent = 'Switch to Light Mode';
} else {
    themeToggleBtn.textContent = 'Switch to Dark Mode';
}

// Toggle between dark and light theme on button click
themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');

    // Update button text and save user preference in localStorage
    if (document.body.classList.contains('dark-theme')) {
        themeToggleBtn.textContent = 'Switch to Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggleBtn.textContent = 'Switch to Dark Mode';
        localStorage.setItem('theme', 'light');
    }
});
function applyTimeBasedTheme() {
    const hour = new Date().getHours();

    // Check if it's night (6 PM to 6 AM) and apply dark theme
    if (hour >= 18 || hour < 6) {
        document.body.classList.add('dark-theme');
        themeToggleBtn.textContent = 'Switch to Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        themeToggleBtn.textContent = 'Switch to Dark Mode';
        localStorage.setItem('theme', 'light');
    }
}

// Call this function on page load
window.onload = function() {
    getLocation(); // Existing function to get weather
    applyTimeBasedTheme(); // Apply theme based on time of day
};
