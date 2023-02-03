const API_KEY = '01990277676ad45f8bc3f867a4878557';
// Maybe: add geolocation from navigator and convert to city somehow?
let cityName = 'London';
let addCity = true;
let limit = '1';
let forecast = 'weather';
let citiesHistory = JSON.parse(localStorage.getItem('citiesHistory')) || [];

function getData(cityName, forecast, addCity) {
  // on incorrect input, this throws error
  let queryURL = `https://api.openweathermap.org/data/2.5/${forecast}?q=${cityName}&limit=${limit}&units=metric&appid=${API_KEY}`;

  $.ajax({
    url: queryURL,
    method: 'GET',
  }).then(function (result) {
    if (result.cod === 200) {
      if (addCity & !citiesHistory.includes(cityName)) {
        citiesHistory.push(cityName);
        localStorage.setItem('citiesHistory', JSON.stringify(citiesHistory));
        $('#history').empty();
        renderHistory();
      }

      if (forecast === 'weather') {
        let name = result.name;
        let today = moment().format('LL');
        let icon = result.weather[0].icon;
        let temp = result.main.temp;
        let humidity = result.main.humidity;
        let wind = result.wind.speed;

        let todayWeatherDisplay = `
        <div>
        `;
        $('#today').append(todayWeatherDisplay);

        console.log(name, today, icon, temp, humidity, wind);
      } else if (forecast === 'forecast') {
        let forecastData = result.list;
        for (let i = 0; i < forecastData.length; i += 8) {
          let date = moment(forecastData[i].dt_txt).format('LL');
          let icon = forecastData[i].weather[0].icon;
          // "https://openweathermap.org/img/wn/" + icon + ".png"
          let temp = forecastData[i].main.temp;
          let humidity = forecastData[i].main.humidity;

          console.log(date, icon, temp, humidity);
        }
      }
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
  newCity = $('#search-input').val().toString().toLocaleLowerCase();

  if (!Array.isArray(citiesHistory)) {
    citiesHistory = [];
  }
  if (!citiesHistory.includes(newCity)) {
    cityName = newCity;
    getData(cityName, 'weather', addCity);
    getData(cityName, 'forecast', addCity);
  }
  if (citiesHistory.includes(newCity)) {
    cityName = $('#search-input').val().toString().toLocaleLowerCase();
    addCity = false;
    getData(cityName, 'weather', addCity);
    getData(cityName, 'forecast', addCity);
  }
  $('#search-input').val('');
});

$('#history').on('click', '.city-button', function () {
  cityName = $(this).text();
  getData(cityName, forecast);
});
