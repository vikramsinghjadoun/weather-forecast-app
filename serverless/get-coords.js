const fetch = require('node-fetch');

const { WEATHER_API_KEY } = process.env;

exports.handler = async (event, context) => {
  const params = JSON.parse(event.body);
  const { text, units } = params;
  const regex = /^\d+$/g;
  const flag = regex.test(text) ? 'zip' : 'q';
  const url = `http://api.openweathermap.org/data/2.5/weather?${flag}=${text}&units=${units}&appid=${WEATHER_API_KEY}`;
  const encodeUrl = encodeURI(url);

  try {
    const weatherStream = await fetch(url);
    const weatherJson = await dataStream.json();
    return {
      statusCode: 200,
      body: JSON.stringify(jsonData),
    };
  } catch (err) {
    return { statusCode: 422, body: err.stack };
  }
};
