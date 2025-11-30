const https = require('https');

async function getCoordinates(cityName) {
  return new Promise((resolve, reject) => {
    let body = "";
    const req = https.get(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`, (res) => {

      res.on('data', (chunk) => body += chunk);

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (!response.results || response.results.length === 0) {
            return reject('City not found');

          }

          const results = response.results[0];
          const location = {
            city: results.name,
            country: results.country,
            countryCode: results.country_code,
            latitude: results.latitude,
            longitude: results.longitude,
            timezone: results.timezone
          };

          resolve(location);

        } catch (err) {
          reject(err);
        }

      })

    });
    req.on('error', (err) => reject(err))
  })


}

//Returns full response
async function getWeather(cityName) {

  const location = await getCoordinates(cityName);
  
  return new Promise((resolve, reject) => {
    const req = https.get(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,rain,snowfall,wind_speed_10m&timezone=${location.timezone}`, (res) => {
      let body = "";

      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {

        try {
          const response = JSON.parse(body);
          let weather = {};
          let timeArray = response.hourly.time;

          let weatherArray = response.hourly.temperature_2m;
          let rainArray = response.hourly.rain;
          let snowArray = response.hourly.snowfall;
          for (let x = 0; x < weatherArray.length; x++) {
            weather[timeArray[x]] = [weatherArray[x], rainArray[x], snowArray[x]];

          }

          resolve({ location, weather });


        } catch (err) {
          reject(err);
        }
      })
    });
    req.on('error', (err) => reject(err))
        
  })
}

module.exports = {
  getCoordinates, getWeather
}