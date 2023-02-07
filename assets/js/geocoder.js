// geoCoder ajax call
// ?? Maybe it's better to use Google Maps API with autocomplete feature
function getGeoCode(cityName) {
  return new Promise((resolve, reject) => {
    let geoCoder = 'https://api.openweathermap.org/geo/1.0/direct';
    $.getJSON(geoCoder, {
      q: cityName,
      country: countryCode,
      limit: 1,
      appid: API_KEY,
    })
      // return result with latitude and longitude and resolve on success
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
      // get error and display the message underneath search bar
      .catch(function (error) {
        reject(error);
        $('#search-input').attr('placeholder', error.message);
        setTimeout(() => {
          $('#search-input').attr('placeholder', 'Search');
        }, 1500);
      });
  });
}
