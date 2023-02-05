const API_KEY = '01990277676ad45f8bc3f867a4878557';
// Geolocation from navigator
// https://stackoverflow.com/questions/33946925/how-do-i-get-geolocation-in-openweather-api
// https://www.spatialtimes.com/2019/01/Create-a-JavaScript-Weather-App-with-Location-Data-Part-1/
let openweathermap = 'http://api.openweathermap.org/data/2.5/weather';
let openweatherforecast = 'http://api.openweathermap.org/data/2.5/forecast';
if (window.navigator && window.navigator.geolocation) {
  window.navigator.geolocation.getCurrentPosition(function (position) {
    $.getJSON(openweathermap, {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      units: 'metric',
      appid: API_KEY,
    }).done(function (result) {
      cityName = result.name;
      getCurrentWeather(cityName);
      getForecast(cityName, addCity);
    });
  });
}

let cityName, countryCode, geo, lat, lon;
let addCity = true;

function getGeoCode(cityName) {
  return new Promise((resolve) => {
    let geoCoder = 'http://api.openweathermap.org/geo/1.0/direct';
    $.getJSON(geoCoder, {
      q: cityName,
      country: countryCode,
      limit: 1,
      appid: API_KEY,
    }).done(function (result) {
      geo = {
        latitude: result[0].lat,
        longitude: result[0].lon,
      };
      resolve(geo);
    });
  });
}
let citiesHistory = JSON.parse(localStorage.getItem('citiesHistory')) || [];

function getCurrentWeather(cityName, addCity) {
  getGeoCode(cityName)
    .then((geo) => {
      lat = geo.latitude;
      lon = geo.longitude;
      let queryURL = `${openweathermap}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
      return $.ajax({
        url: queryURL,
        method: 'GET',
      });
    })
    .then(function (result) {
      console.log(result);
      if (result.cod === 200) {
        if (addCity & !citiesHistory.includes(cityName)) {
          citiesHistory.push(cityName);
          localStorage.setItem('citiesHistory', JSON.stringify(citiesHistory));
          $('#history').empty();
          renderHistory();
        }
        let name = result.name;
        let today = moment().format('LL');
        let feelsLike = Math.floor(result.main.feels_like);
        let icon = result.weather[0].icon;
        let temp = Math.floor(result.main.temp);
        let humidity = result.main.humidity;
        let wind = result.wind.speed;

        let todayWeatherDisplay = $(
          `<div class="position-relative">
            <div class="weather-header">
              <h2 class="text-capitalise">${name}</h2>
              <h3>${today}</h3>
            </div>
            <div class="weather-icon position-absolute top-0 end-0">
              <img src="https://openweathermap.org/img/wn/${icon}.png"/>
            </div>
            <div class="weather-details-wrapper">
              <p>Feels like ${feelsLike}&#8451</p>
              <ul class="list-inline">
                <li class="list-inline-item">${temp}&#8451</li>
                <li class="list-inline-item">${humidity}%</li>
                <li class="list-inline-item">${wind}m/s</li>
              </ul>
            </div>
          </div>`
        );
        $('#today').empty().append(todayWeatherDisplay);
      }
    });
}
function getForecast(cityName) {
  getGeoCode(cityName)
    .then((geo) => {
      lat = geo.latitude;
      lon = geo.longitude;
      let queryURL = `${openweatherforecast}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

      return $.ajax({
        url: queryURL,
        method: 'GET',
      });
    })
    .then(function (result) {
      console.log(result);
      if (result.cod == 200) {
        let forecastData = result.list;
        const dailyData = forecastData.filter((forecastData) => {
          return forecastData.dt_txt.includes('18:00:00');
        });
        let weekdates = dailyData.map((forecastData) =>
          moment(forecastData.dt_txt).format('dddd')
        );
        let dates = dailyData.map((forecastData) =>
          moment(forecastData.dt_txt).format('LL')
        );
        let forecastCards = [];
        for (let i = 0; i < dates.length; i++) {
          let icon = forecastData[i].weather[0].icon;
          let temp = Math.floor(forecastData[i].main.temp);
          let humidity = forecastData[i].main.humidity;
          let weekdate = weekdates[i];
          let date = dates[i];
          let forecastCard = $(
            `<div class="card">
              <div class="card-header">
                <h5>${weekdate}</h5>
                <p>${date}</p>
              </div>
              <div class="card-body">
                <div class="weather-data-wrapper">
                <ul class="list-inline">
                  <li class="list-inline-item">${temp}&#8451</li>
                  <li class="list-inline-item">${humidity}%</li>
                </ul>
                  <img src="https://openweathermap.org/img/wn/${icon}.png"/>
                <div>
              </div>
            </div>`
          );
          forecastCards.push(forecastCard);
          console.log(date, icon, temp, humidity);
        }
        $('#forecast').empty().append(forecastCards);
      } else if (result.cod === 404) {
        // show error message here for city not found
        console.error(`Error: City not found`);
      } else {
        // console.error(`Error: ${result.cod}`);
      }
    });
}

function renderHistory() {
  for (i = 0; i < citiesHistory.length; i++) {
    const cityButton = $(
      `<button class="city-button btn">${citiesHistory[i]}</button>`
    );
    $('#history').append(cityButton);
  }
}
renderHistory();

$('#search-button').on('click', function (e) {
  e.preventDefault();
  const newCity = $('#search-input').val().toString().toLocaleLowerCase();

  if (!Array.isArray(citiesHistory)) {
    citiesHistory = [];
  }
  if (!citiesHistory.includes(newCity)) {
    cityName = newCity;
  }
  if (citiesHistory.includes(newCity)) {
    cityName = $('#search-input').val().toString().toLocaleLowerCase();
    addCity = false;
  }
  getCurrentWeather(cityName, addCity);
  getForecast(cityName);
  $('#search-input').val('');
});

$('#history').on('click', '.city-button', function () {
  cityName = $(this).text();
  getCurrentWeather(cityName, addCity);
  getForecast(cityName);
});

// header is fixed, add padding to main
let padding = () => {
  $('main').css({
    padding: `${$('header').outerHeight()}px`,
  });
};
padding();
window.onresize = () => padding();
