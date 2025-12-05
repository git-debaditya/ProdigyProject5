const form = document.getElementById('location-form');

//location
const locationInput = document.getElementById('location-input');
// clear Input button ('X')
const clearInputBtn = document.getElementById('clear-input');

//current weather
const weatherInfo = document.getElementById('weather');

//weekly forecast
const forecastInfo = document.getElementById('forecast');

//hourly forecast
const hourlyForecastInfo = document.getElementById('hourly-forecast');

//dark-mode button
const toggleModeBtn = document.getElementById('toggle-mode');

//Global Map variable
let map = L.map('map').setView([22.5726, 88.3639], 8); // Default to Kolkata

// Map tiles (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Marker (initial, replaced on searches)
let marker = null;

// Set initial state to light mode
let isDarkMode = false;
toggleModeBtn.querySelector('.fa-moon').style.display = 'none'; // Hide moon icon initially

toggleModeBtn.addEventListener('click', ()=>
{
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    toggleModeBtn.querySelector('.fa-sun').style.display = isDarkMode ? 'none' : 'inline-block';
    toggleModeBtn.querySelector('.fa-moon').style.display = isDarkMode ? 'inline-block' : 'none';
    toggleModeBtn.style.backgroundColor = isDarkMode ? '#546e7a' : '#e39505'; // Change button background color
});

// Set initial state of the button and icons
toggleModeBtn.classList.add('sun');
toggleModeBtn.querySelector('.fa-sun').style.display = 'inline-block';
toggleModeBtn.querySelector('.fa-moon').style.display = 'none';


// Function to fetch weather data
async function fetchWeather(location) {
  const apiKey = 'MY52KW88F8TCFLJ8TPXXBVFPR';  //visual-crossing API
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=${apiKey}&include=current`;
  
  try
  {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
  catch (error)
  {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

// Function to display current weather information
function displayWeather(data)
{
  if (!data)
  {
    weatherInfo.innerHTML = 'Failed to fetch weather data.';
    return;
  }

  const currentWeather = data.currentConditions;
  const currentTemperature = currentWeather.temp;
  const weatherDescription = currentWeather.conditions;
  const humidity = currentWeather.humidity;
  const windSpeed = currentWeather.windspeed;
  const iconCode = currentWeather.icon;
  const cityName = data.resolvedAddress;
  const feelsLike = currentWeather.feelslike;
  const sunRise = currentWeather.sunrise;
  const sunSet = currentWeather.sunset;
  const precipitation = currentWeather.precip;
  
  updateMap(data.latitude, data.longitude, currentTemperature, weatherDescription);
  
  weatherInfo.innerHTML = `
    <div class="weatherInfo">

      <div class = "locationDetails">
        <h2>${cityName}</h2>
        <p>Sunrise <i class="info-weather-icon fas fa-sunrise"></i>: ${sunRise}</p>
        <p>Sunset <i class="info-weather-icon fas fa-sunset}"></i>: ${sunSet}</p>
        <p>Precipitation <i class = "info-weather-icon fas fa-cloud-showers-heavy"></i>: ${precipitation}%</p>
        <p>Humidity <i class = "info-weather-icon fas fa-tint"></i>: ${humidity}%</p>
        <p>Windspeed <i class = "info-weather-icon fas fa-wind"></i>: ${windSpeed} km/h</p>
      </div>

      <div class = "weatherCondition">
        <div class = "temperature">
        <p>${currentTemperature}°C</p>
        </div>

        <div class = "tempFeelsLike">
        <p><em>${(feelsLike)}°C <br> Feels Like</em></p>
        </div>
      </div>
    </div>
  `;

  weatherInfo.innerHTML += `
  <i class="weather-icon fas fa-${getWeatherIcon(iconCode)}" style = "display:block;"></i>
  <p>${weatherDescription}</p>
  `;
}

// Function to display weekly forecast
function displayForecast(data)
{
  if (!data)
  {
    forecastInfo.innerHTML = 'Failed to fetch weather data.';
    return;
  }
    forecastInfo.innerHTML = '';
    let dayOfWeek;

    //slice helps me get the forecast from the next day till the next 7days thus, (1, 8)
    data.days.slice(1,8).forEach(day =>
      {

        const date = new Date(day.datetime);
        const options = {day:'numeric', month: 'short', year:'2-digit'};
        const formattedDate = date.toLocaleDateString('en-GB', options);  // Format the date
        const iconCode = day.icon;  
        dayOfWeek = date.toLocaleDateString('en-GB', { weekday: 'short' });  // Get the icon code
        forecastInfo.innerHTML += `
          <div class = 'forecast-item'>
            <p>${formattedDate}, ${dayOfWeek}</p>
            <p>Min: ${day.tempmin}°C</p>
            <p>Max: ${day.tempmax}°C</p>
            <p>${day.conditions}</p>
            <i class="weather-icon fas fa-${getWeatherIcon(iconCode)}"></i>
          </div>
        `;
      });
}

//Function to center, zoom, and pin temp info in map
function updateMap(lat, lon, temp, condition) {
  map.setView([lat, lon], 10); // Zoom level 10

  // Remove existing marker if any
  if (marker) {
    map.removeLayer(marker);
  }
  marker = L.marker([lat, lon]).addTo(map)

  marker.bindPopup(`<b>${temp}°C</b><br>${condition}`).openPopup();
}

// Event listener for form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the default form submission

  const location = locationInput.value;
  const weatherData = await fetchWeather(location);
  displayWeather(weatherData);
  displayForecast(weatherData);
});

// Initial weather fetch for default location (e.g., Kolkata)
fetchWeather('Kolkata')
  .then(data => 
    {
      displayWeather(data);  //display current weather
      displayForecast(data);  //display 7-day forecast
    })
  .catch(error => console.error('Failed to fetch initial weather data:', error));

// Function to map icon codes to weather icons
function getWeatherIcon(iconCode) {
  switch (iconCode) {
    case 'clear-day':
      return 'sun';
    case 'clear-night':
      return 'moon';
    case 'partly-cloudy-day':
      return 'cloud-sun';
    case 'partly-cloudy-night':
      return 'cloud-moon';
    case 'cloudy':
      return 'cloud';
    case 'rain':
      return 'cloud-rain';
    case 'sleet':
      return 'cloud-sleet';
    case 'snow':
      return 'cloud-snow';
    case 'wind':
      return 'wind';
    case 'fog':
      return 'fog';
    case 'sunrise':
      return 'sunrise';
    case 'sunset':
      return 'sunset';
    case 'humidity':
      return 'tint';
    case 'wind_speed':
      return 'wind';
    case 'precipitation':
      return 'cloud-showers-heavy';
    case 'aqi':
      return 'smog';
    default:
      return 'question';
  }
}

clearInputBtn.addEventListener('click', async () =>
{
  // Clear the input field
  locationInput.value = '';

  // Wait for a short time to allow the input field to clear
  setTimeout(async ()=>
  {
    // Fetch and display the weather data for the default location
    const defaultLocation = 'Kolkata';
    const weatherData = await fetchWeather(defaultLocation);
    displayWeather(weatherData);
    displayForecast(weatherData);
  }, 10); // Wait for 10 milliseconds
  
});

//event listener for the ‘keydown’ event and check if the ‘Enter’ key was pressed
locationInput.addEventListener('keydown', async(event)=>
{
  if(event.key === 'Enter')
  {
    event.preventDefault();
    const location = locationInput.value;
    const weatherData = await fetchWeather(location);
    displayWeather(weatherData);
    displayForecast(weatherData);
  }
});
