const https = require('https');
const { readCache, writeCache } = require('./history');
const fs = require('fs').promises;
const { getWeather } = require('./api');
var name = process.argv[2];
const flag = process.argv[3];
const selectDate = process.argv[4]

function normalizeInput(string) {
  return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

async function getCache(arg) {

  const cache = await readCache('./cache.json');
  const cityToFind = arg.toLowerCase();

  let searchCountry = null;
  for (const country in cache) {

    for (const city in cache[country]) {

      if (normalizeInput(city) === normalizeInput(cityToFind)) {
        searchCountry = country;
        return cache[searchCountry][city];
      }
    }
  }
  return null;
}

async function organize(location, weather) {

  let fullList = await readCache('./cache.json') || {}
  let requestedList = {};
  if (!fullList[location.country]) fullList[location.country] = {};
  fullList[location.country][location.city] = requestedList;

  for (let key of Object.keys(weather)) {
    var day = key.split("T");
    requestedList[day[0]] = {};
  }

  for (let dayKey of Object.keys(requestedList)) {
    for (let key of Object.keys(weather)) {
      if (key.includes(dayKey)) {
        var time = key.slice(11);
        Object.assign(requestedList[dayKey], { [time]: weather[key] });
      }
    }
  }
  Object.assign(fullList[location.country][location.city], requestedList);

  return { fullList, requestedList };
}

function userinput(flag) {

  const now = Date.now();
  const dateUnix = new Date(now);
  const dateString = dateUnix.toLocaleString();
  const dateSplit = dateString.split(',');
  const todayString = dateSplit[0];
  const timeString = dateSplit[1];
  const timeSplit = timeString.split(':');
  const hour = timeSplit[0].trim();
  const amPmSplit = timeString.split(' ');
  const amPm = amPmSplit[2];
  const todaySplit = todayString.split('/');
  const month = todaySplit[0];
  const day = todaySplit[1];
  const year = todaySplit[2];
  let date = year + '-' + month + '-' + day;
  const numberHour = Number(hour);
  const adjustedTime = amPm === 'AM' && numberHour < 12 ? numberHour : amPm === 'PM' && numberHour < 12 ? numberHour + 12 : 0;
  const time = String(adjustedTime).length === 1 ? "0" + adjustedTime + ":00" : adjustedTime + ":00";

  if (flag === '--now') { return { date, time } };
  if (flag === '--today') { return { date } };
  if (flag === '--date') {
    date = selectDate;
    return { date }
  };

  return {};

}


function cleanOutput(location, list) {

  console.log(`📍  ${location.city},${location.countryCode}`);
  try {
    Object.entries(list).forEach(([date, times]) => {

      const dayOfweek = getDayOfWeek(date);
      console.log(`${dayOfweek} ${date}`);
      console.log();


      Object.entries(times).forEach(([hour, weather]) => {
        const temperature = weather[0];
        const rain = weather[1];
        const snowfall = weather[2];

        console.log(hour);

        console.log(`     🌡️   Temperature: ${temperature}`);
        console.log(`     🌧️   Rain: ${rain}`);
        console.log(`     ❄️   Snow: ${snowfall}`);
        console.log('     -------------------------------------------------------------------');


      })

    }

    )
  }
  catch (err) {
    console.log('Data not found');
    return;

  }
  
}
function displayWeather(list, date, time) {

  if (date && time) {
    return { [date]: { [time]: list[date][time] } };
  }
  else if (date) {
    return { [date]: list[date] };
  }
  else return list;

}



function getDayOfWeek(input) {
  const week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(input);
  const dayNumber = date.getDay();
  const day = week[dayNumber];
  return day
}


(async () => {

  let location, weather;

  try {
    const result = await getWeather(name);
    location = result.location;
    weather = result.weather;
  } catch (err) {
    console.log('getWeather FAILED');

    var cachedResponse = await getCache(process.argv[2]);
    console.log(cachedResponse);
    return;
  }
  const weatherInfo = await organize(location, weather);
  await writeCache('./cache.json', weatherInfo.fullList)

  const input = userinput(flag)

  const date = input.date
  const time = input.time

  const final = displayWeather(weatherInfo.requestedList, date, time)

  cleanOutput(location, final)

})();
