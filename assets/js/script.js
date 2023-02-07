const API_KEY = '01990277676ad45f8bc3f867a4878557';
let cityName, countryCode, geo, lat, lon;
let addCity = true;
let citiesHistory = JSON.parse(localStorage.getItem('citiesHistory')) || [];

// display default city forecast
function defaultCity() {
  cityName = 'london';
  // parallel function calls
  Promise.all([getCurrentWeather(cityName, addCity), getForecast(cityName)]);
}
// Geolocation from navigator
let openweathermap = 'https://api.openweathermap.org/data/2.5/weather';
let openweatherforecast = 'https://api.openweathermap.org/data/2.5/forecast';
if (window.navigator && window.navigator.geolocation) {
  window.navigator.geolocation.getCurrentPosition(
    function (position) {
      $.getJSON(openweathermap, {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        units: 'metric',
        appid: API_KEY,
      }).done(function (result) {
        cityName = result.name.toLocaleLowerCase();
        getCurrentWeather(cityName);
        getForecast(cityName, addCity);
      });
    },
    function (error) {
      if (error.code === error.PERMISSION_DENIED) {
        defaultCity();
      }
    }
  );
} else {
  defaultCity();
}

function getCurrentWeather(cityName, addCity) {
  // retrieve geo data from geoCoder function
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
    .catch(displayStaticError)
    // proceed if nothing caught
    .then(function (result) {
      // clear search input
      $('#search-input').val('');
      // double checking that result exist, in case it wasn't caught enough
      if (result) {
        if (result.cod === 200) {
          // only add new cities to the history
          if (addCity & !citiesHistory.includes(cityName)) {
            citiesHistory.push(cityName);
            localStorage.setItem(
              'citiesHistory',
              JSON.stringify(citiesHistory)
            );
            $('#history').empty();
            renderHistory();
          }
          let name = result.name;
          let country = result.sys.country;
          let today = moment().format('LL');
          let feelsLike = Math.floor(result.main.feels_like);
          let icon = result.weather[0].icon;
          let temp = Math.floor(result.main.temp);
          let humidity = result.main.humidity;
          let wind = Math.floor(result.wind.speed);

          let todayWeatherDisplay = $(
            `<div>
                <div class="weather-header position-relative">
                  <h2 class="display-1 text-capitalise position-relative">${name}</h2><sup class="badge position-absolute">${country}</sup>
                  <h3 class="h4">${today}</h3>
                </div>
                <div class="d-flex align-items-center">
                  <span>Feels like ${feelsLike}&#8451</span>
                  <img src="https://openweathermap.org/img/wn/${icon}.png"/>
                </div>
                <div class="weather-details-wrapper">
                  <ul class="list-inline">
                    <li class="list-inline-item">${temp}&#8451</li>
                    <li class="list-inline-item">${humidity}%</li>
                    <li class="list-inline-item">${wind}m/s</li>
                  </ul>
                </div>
              </div>`
          );

          // add background based on weather
          $('.weather-main').css(
            'background-image',
            `url("./assets/images/${icon}.jpg")`
          );
          $('#today').empty().append(todayWeatherDisplay).hide().fadeIn(500);
        } else {
          console.error(`Error: ${result.cod}`);
        }
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
    .catch(displayStaticError)
    .then(function (result) {
      if (result) {
        let forecastData = result.list;
        // filter by hour to display by days, not 40 hour slots
        const dailyData = forecastData.filter((forecastData) => {
          return forecastData.dt_txt.includes('15:00:00');
        });
        let weekdates = dailyData.map((forecastData) =>
          moment(forecastData.dt_txt).format('dddd')
        );
        let dates = dailyData.map((forecastData) =>
          moment(forecastData.dt_txt).format('LL')
        );
        // define an array to append cards to
        // TODO: Recreate this in a way that card content is updated only
        for (let i = 0; i < dates.length; i++) {
          let icon = dailyData[i].weather[0].icon;
          let temp = Math.floor(dailyData[i].main.temp);
          let humidity = dailyData[i].main.humidity;
          let weekdate = weekdates[i];
          let date = dates[i];

          let existingForecastCard = $(`#forecast .card[data-index="${i}"]`);
          let forecastCardContent = $(
            `<div class="weather-data-wrapper">
              <ul class="list-inline">
                <li class="list-inline-item">${temp}&#8451</li>
                <li class="list-inline-item">${humidity}%</li>
              </ul>
              <img src="https://openweathermap.org/img/wn/${icon}.png"/>
            </div>`
          );

          if (existingForecastCard.length) {
            existingForecastCard
              .find('.weather-data-wrapper')
              .fadeOut(500, function () {
                $(this).replaceWith(forecastCardContent).hide().fadeIn(500);
              });
          } else {
            forecastCard = $(
              `<div class="card rounded-0 bg-image" data-index=${i}>
                <div class="card-body">
                  <h5>${weekdate}</h5>
                  <p>${date}</p>
                </div>
              </div>`
            );
            forecastCard.find('.card-body').append(forecastCardContent);
            $('#forecast').append(forecastCard);
          }

          // animate background fade-in on hover
          $(forecastCard)
            .mouseover(function () {
              $(this).css(
                'background-image',
                `url(./assets/images/${icon}.jpg)`
              );
            })
            .mouseleave(function () {
              $(this).css(
                'background-image',
                `url(./assets/images/transbg.png)`
              );
            });
        }
      }
    })
    .then(function () {
      if ($('#loader')) {
        setTimeout(() => {
          $('#loader').addClass('hide');
          setTimeout(() => {
            $('#loader').remove();
          }, 1000);
        }, 1000);
      }
    });
}

// show last 10 search history cities
function renderHistory() {
  citiesHistory = citiesHistory.reverse().splice(0, 10);
  for (i = 0; i < citiesHistory.length; i++) {
    const cityButton = $(
      `<button class="city-button btn text-capitalize text-start rounded-0 position-relative"><span>${citiesHistory[i]}</span></button>`
    );
    $('#history').append(cityButton);
  }
  // ?? check if I need to return array back to original
  // ?? could I update the history on click so the latest always on top, whether searched or clicked
  // citiesHistory = citiesHistory.reverse().splice(0, 0);
}
renderHistory();

// search event listener
$('#search-button, #search-input').on('click keypress', function (e) {
  if (e.type === 'click' || e.which === 13) {
    e.preventDefault();
    const newCity = $('#search-input').val().toString().toLocaleLowerCase();
    citiesHistory = Array.isArray(citiesHistory) ? citiesHistory : [];
    cityName = newCity;
    addCity = citiesHistory.includes(newCity) ? false : true;
    Promise.all([getCurrentWeather(cityName, addCity), getForecast(cityName)]);

    // I wanted to add this simply for better UX on mobile
    $('#search-input').blur();
  }
});

// display error in the search field
function displayStaticError() {
  $('#search-input').attr('placeholder', 'No city found');
  setTimeout(() => {
    $('#search-input').attr('placeholder', 'Search');
  }, 1500);
}

// get weather data by selecting city from the history list
$('#history').on('click', '.city-button', function () {
  cityName = $(this).text();
  Promise.all([getCurrentWeather(cityName, addCity), getForecast(cityName)]);
});

// toggle history list visibility
$('#history-button').click(() => {
  let el = $('#history');
  el.hasClass('no-show') ? el.removeClass('no-show') : el.addClass('no-show');
});
