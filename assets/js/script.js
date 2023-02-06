$(document).ready(function () {
  $(window).on('load', function () {
    setTimeout(() => {
      $('#loader').addClass('hide');
    }, 1000);
  });

  const API_KEY = '01990277676ad45f8bc3f867a4878557';
  let cityName, countryCode, geo, lat, lon;
  let addCity = true;
  // Geolocation from navigator
  // https://stackoverflow.com/questions/33946925/how-do-i-get-geolocation-in-openweather-api
  // https://www.spatialtimes.com/2019/01/Create-a-JavaScript-Weather-App-with-Location-Data-Part-1/
  // https://stackoverflow.com/questions/6548504/how-can-i-get-city-name-from-a-latitude-and-longitude-point
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
      // https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
      function (error) {
        if (error.code === error.PERMISSION_DENIED) {
          cityName = 'london';
          getCurrentWeather(cityName);
          getForecast(cityName, addCity);
        }
      }
    );
  }

  function getGeoCode(cityName) {
    return new Promise((resolve, reject) => {
      let geoCoder = 'https://api.openweathermap.org/geo/1.0/direct';
      $.getJSON(geoCoder, {
        q: cityName,
        country: countryCode,
        limit: 1,
        appid: API_KEY,
      })
        .done(function (result) {
          if (!result || !result[0] || !result[0].lat || !result[0].lon) {
            reject(new Error('No city found'));
          } else {
            let geo = {
              latitude: result[0].lat,
              longitude: result[0].lon,
            };
            resolve(geo);
          }
        })
        .catch(function (error) {
          reject(error);
          if (!$('.error').length) {
            $('.search-wrapper').append(
              `<div class="error">
              <p>${error.message}</p>
            </div>`
            );
          } else {
            $('.search-wrapper .error').html(`<p>${error.message}</p>`);
          }
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
      .catch(function () {
        if (!$('.error').length) {
          $('.search-wrapper').append(
            `<div class="error">
            <p>No city found</p>
          </div>`
          );
        } else {
          $('.search-wrapper .error').text('No city found');
        }
      })
      .then(function (result) {
        console.log(result);
        if (result) {
          if (result.cod === 200) {
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
            let wind = result.wind.speed;

            let todayWeatherDisplay = $(
              `<div>
            <div class="weather-header position-relative">
              <h2 class="display-2 text-capitalise position-relative">${name}</h2><sup class="badge position-absolute">${country}</sup>
              <h3>${today}</h3>
            </div>
            <div class="d-flex align-items-center">
              <span>Feels like ${feelsLike}&#8451</span>
              <img src="ss://openweathermap.org/img/wn/${icon}.png"/>
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
            setTimeout(() => {
              $('.weather-main').css(
                'background-image',
                `url("./assets/images/${icon}.jpg")`
              );
              $('#today')
                .empty()
                .append(todayWeatherDisplay)
                .hide()
                .fadeIn(500);
            }, 500);
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
      .catch(function () {
        if (!$('.error').length) {
          $('.search-wrapper').append(
            `<div class="error">
            <p>No city found</p>
          </div>`
          );
        } else {
          $('.search-wrapper .error').text('No city found');
        }
      })
      .then(function (result) {
        if (result) {
          let forecastData = result.list;
          const dailyData = forecastData.filter((forecastData) => {
            return forecastData.dt_txt.includes('15:00:00');
          });
          let weekdates = dailyData.map((forecastData) =>
            moment(forecastData.dt_txt).format('dddd')
          );
          let dates = dailyData.map((forecastData) =>
            moment(forecastData.dt_txt).format('LL')
          );
          let forecastCards = [];
          for (let i = 0; i < dates.length; i++) {
            let icon = dailyData[i].weather[0].icon;
            let temp = Math.floor(dailyData[i].main.temp);
            let humidity = dailyData[i].main.humidity;
            let weekdate = weekdates[i];
            let date = dates[i];
            let forecastCard = $(
              `<div class="card rounded-0 bg-image">
              <div class="card-body">
                <h5>${weekdate}</h5>
                <p>${date}</p>
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
          $('#forecast').empty().append(forecastCards).hide().fadeIn(500);
          height();
        }
      });
  }

  function renderHistory() {
    citiesHistory = citiesHistory.reverse().splice(0, 10);
    for (i = 0; i < citiesHistory.length; i++) {
      const cityButton = $(
        `<button class="city-button btn text-capitalize text-start rounded-0 position-relative"><span>${citiesHistory[i]}</span></button>`
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

  $('#history-button').click(() => {
    let el = $('#history');
    el.hasClass('no-show') ? el.removeClass('no-show') : el.addClass('no-show');
  });

  // https://dzone.com/articles/checking-media-queries-jquery
  let height = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      $('#today').css(
        'min-height',
        `calc(100vh - ${$('#forecast').outerHeight(true)}px - ${$(
          'header'
        ).outerHeight(true)}px)`
      );
      $('main').css('padding-top', `${$('header').outerHeight(true)}px`);
    }
  };
  height();
  window.onresize = () => height();

  $('#history').css('width', `${$('.search-wrapper').outerWidth(true)}px`);
});
