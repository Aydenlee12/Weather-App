// 🌤️ WEATHER APP SCRIPT

// --- API KEYS ---
// These are the keys you get when you sign up for the OpenWeather and Unsplash APIs
// They let the app access data from these services.
const weatherKey = 'bcb68f16ab429f2a3615a3116b9dea56'; // OpenWeather API key
const unsplashKey = '6SCllJ4TSon_PFm-DPX7R6lwd8_S-NLb_sIgw3ysSxY';   // Unsplash API key

// --- MAIN FUNCTION ---
// This is the main function that runs when the user searches for a city
function getWeather() {
  // Get the text entered in the input box with id "city"
  const city = document.getElementById('city').value.trim();

  // Check if the input box is empty
  if (!city) {
    alert('Please enter a city'); // show a popup message if empty
    return; // stop the function from running further
  }

  // URLs to get current weather and forecast from OpenWeather API
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherKey}`;

  // --- Fetch current weather ---
  fetch(currentWeatherUrl) // request data from OpenWeather
    .then(response => response.json()) // convert the response into a readable format (JSON)
    .then(data => {
      displayWeather(data); // call function to show current weather on the page
      showImage(); // make sure the weather icon is visible
      setCityBackground(city, data); // set background image for the city after weather loads
    })
    .catch(error => {
      // This runs if something goes wrong with the API request
      console.error('Error fetching current weather data:', error);
      alert('Error fetching current weather data. Please try again.');
    });

  // --- Fetch hourly forecast ---
  fetch(forecastUrl) // request forecast data
    .then(response => response.json())
    .then(data => {
      displayHourlyForecast(data.list); // call function to display forecast on page
    })
    .catch(error => {
      console.error('Error fetching forecast data:', error);
    });
}

// --- DISPLAY CURRENT WEATHER ---
// Function to show current weather info
function displayWeather(data) {
  // Get the HTML elements where we will show temperature, weather info, and icon
  const tempDivInfo = document.getElementById('temp-div');
  const weatherInfoDiv = document.getElementById('weather-info');
  const weatherIcon = document.getElementById('weather-icon');

  // Clear any previous data
  tempDivInfo.innerHTML = '';
  weatherInfoDiv.innerHTML = '';

  // Check if the API returned "city not found"
  if (data.cod == '404') {
    weatherInfoDiv.innerHTML = `<p>${data.message}</p>`; // show error message
  } else {
    // Extract information from API response
    const cityName = data.name; // city name
    const temperature = Math.round(data.main.temp - 273.15); // convert from Kelvin to Celsius
    const description = data.weather[0].description; // e.g., "clear sky"
    const iconCode = data.weather[0].icon; // code for weather icon
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@4x.png`; // full icon URL

    // Display temperature
    tempDivInfo.innerHTML = `<p>${temperature}°C</p>`;
    // Display city name and description
    weatherInfoDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`;

    // Display weather icon
    weatherIcon.src = iconUrl; // set image source
    weatherIcon.alt = description; // set alt text for accessibility
  }
}

// --- DISPLAY HOURLY FORECAST ---
// Function to show the forecast for the next hours
function displayHourlyForecast(hourlyData) {
  const hourlyForecastDiv = document.getElementById('hourly-forecast'); // element for forecast
  hourlyForecastDiv.innerHTML = ''; // clear previous forecast

  // Show only the next 8 forecast items (roughly 24 hours)
  const next24Hours = hourlyData.slice(0, 8);

  // Loop through each forecast item
  next24Hours.forEach(item => {
    const dateTime = new Date(item.dt * 1000); // convert timestamp to date
    const hour = dateTime.getHours(); // get hour from date
    const temperature = Math.round(item.main.temp - 273.15); // convert temp to Celsius
    const iconCode = item.weather[0].icon; // icon code
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`; // icon URL

    // Create HTML for this hour's forecast
    const hourlyItemHtml = `
      <div class="hourly-item">
        <span>${hour}:00</span>
        <img src="${iconUrl}" alt="Hourly Weather Icon">
        <span>${temperature}°C</span>
      </div>
    `;

    // Add this hour's forecast to the page
    hourlyForecastDiv.innerHTML += hourlyItemHtml;
  });
}

// --- SHOW WEATHER ICON ---
// Make sure the main weather icon is visible
function showImage() {
  const weatherIcon = document.getElementById('weather-icon');
  weatherIcon.style.display = 'block'; // make it visible
}

// --- SET BACKGROUND IMAGE (Unsplash Integration) ---
// Function to set a city image as background
function setCityBackground(city, weatherData) {
  const weatherType = weatherData.weather[0].main; // type of weather: Clear, Clouds, Rain

  // Use city name + "city skyline" to get good Unsplash images
  const query = encodeURIComponent(`${city} city skyline`);

  // URL for Unsplash API to search for photos
  const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${unsplashKey}&orientation=landscape&order_by=popular&content_filter=high&per_page=5`;

  // Fetch image data
  fetch(url)
    .then(response => response.json())
    .then(data => {
      let cityImageUrl;

      // Check if Unsplash returned any images
      if (data.results.length > 0) {
        cityImageUrl = data.results[0].urls.regular; // pick the first image
      } else {
        // fallback image if no results
        cityImageUrl = "https://images.unsplash.com/photo-1508057198894-247b23fe5ade";
      }

      // Apply background image with a light overlay for readability
      document.body.style.transition = "background-image 1.5s ease-in-out"; // smooth transition
      document.body.style.backgroundImage = `
        linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0.2)),
        url('${cityImageUrl}')
      `;
      document.body.style.backgroundSize = "cover"; // fill screen
      document.body.style.backgroundPosition = "center"; // center image
      document.body.style.backgroundRepeat = "no-repeat"; // prevent tiling
      document.body.style.filter = "none"; // no blur effect
    })
    .catch(error => console.error("Error fetching city image:", error)); // handle errors
}
