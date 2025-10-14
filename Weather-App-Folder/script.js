// 🌤️ WEATHER APP SCRIPT

// --- API KEYS ---
const weatherKey = 'bcb68f16ab429f2a3615a3116b9dea56'; // OpenWeather API key
const unsplashKey = '6SCllJ4TSon_PFm-DPX7R6lwd8_S-NLb_sIgw3ysSxY';   // Unsplash API key

// --- MAIN FUNCTION ---
function getWeather() {
  const city = document.getElementById('city').value.trim();

  if (!city) {
    alert('Please enter a city');
    return;
  }

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherKey}`;

  // Fetch current weather
  fetch(currentWeatherUrl)
    .then(response => response.json())
    .then(data => {
      displayWeather(data);
      showImage();
      setCityBackground(city, data); // update background after weather loads
    })
    .catch(error => {
      console.error('Error fetching current weather data:', error);
      alert('Error fetching current weather data. Please try again.');
    });

  // Fetch hourly forecast
  fetch(forecastUrl)
    .then(response => response.json())
    .then(data => {
      displayHourlyForecast(data.list);
    })
    .catch(error => {
      console.error('Error fetching forecast data:', error);
    });
}

// --- DISPLAY CURRENT WEATHER ---
function displayWeather(data) {
  const tempDivInfo = document.getElementById('temp-div');
  const weatherInfoDiv = document.getElementById('weather-info');
  const weatherIcon = document.getElementById('weather-icon');

  tempDivInfo.innerHTML = '';
  weatherInfoDiv.innerHTML = '';

  if (data.cod == '404') {
    weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
  } else {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp - 273.15);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@4x.png`;

    tempDivInfo.innerHTML = `<p>${temperature}°C</p>`;
    weatherInfoDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`;

    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;
  }
}

// --- DISPLAY HOURLY FORECAST ---
function displayHourlyForecast(hourlyData) {
  const hourlyForecastDiv = document.getElementById('hourly-forecast');
  hourlyForecastDiv.innerHTML = '';
  const next24Hours = hourlyData.slice(0, 8);

  next24Hours.forEach(item => {
    const dateTime = new Date(item.dt * 1000);
    const hour = dateTime.getHours();
    const temperature = Math.round(item.main.temp - 273.15);
    const iconCode = item.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

    const hourlyItemHtml = `
      <div class="hourly-item">
        <span>${hour}:00</span>
        <img src="${iconUrl}" alt="Hourly Weather Icon">
        <span>${temperature}°C</span>
      </div>
    `;

    hourlyForecastDiv.innerHTML += hourlyItemHtml;
  });
}

// --- SHOW WEATHER ICON ---
function showImage() {
  const weatherIcon = document.getElementById('weather-icon');
  weatherIcon.style.display = 'block';
}

// --- SET BACKGROUND IMAGE (Unsplash Integration) ---
function setCityBackground(city, weatherData) {
  const weatherType = weatherData.weather[0].main; // Clear, Clouds, Rain

  // Use city name + "city skyline" for better recognizable images
  const query = encodeURIComponent(`${city} city skyline`);

  const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${unsplashKey}&orientation=landscape&order_by=popular&content_filter=high&per_page=5`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      let cityImageUrl;

      if (data.results.length > 0) {
        // Pick the first result (most popular)
        cityImageUrl = data.results[0].urls.regular;
      } else {
        // Generic fallback
        cityImageUrl = "https://images.unsplash.com/photo-1508057198894-247b23fe5ade";
      }

      // Apply background with a light white overlay for contrast
      document.body.style.transition = "background-image 1.5s ease-in-out";
      document.body.style.backgroundImage = `
        linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0.2)),
        url('${cityImageUrl}')
      `;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.filter = "none"; // no blur
    })
    .catch(error => console.error("Error fetching city image:", error));
}