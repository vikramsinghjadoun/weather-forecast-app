import {
  setLocationObject,
  getHomeLocation,
  getWeatherFromCoords,
  getCoordsFromApi,
  cleanText,
} from './dataFunction.js';
import {
  setPlaceholderText,
  addSpinner,
  displayError,
  displayApiError,
  updateScreenReaderConfirmation,
  updateDisplay,
} from './domFunctions.js';
import CurrentLocation from './currentLocation.js';
const currentLoc = new CurrentLocation();
const initApp = () => {
  //add listners
  //from geoLocation button
  const geoButton = document.getElementById('getLocation');
  geoButton.addEventListener('click', getGeoWeather);
  //from home button
  const homeButton = document.getElementById('home');
  homeButton.addEventListener('click', loadWeather);
  //for save button
  const saveButton = document.getElementById('saveLocation');
  saveButton.addEventListener('click', saveLocation);
  //for unit change button
  const unitButton = document.getElementById('unit');
  unitButton.addEventListener('click', setUnitPref);
  // for refresh button
  const refreshButton = document.getElementById('refresh');
  refreshButton.addEventListener('click', refreshWeather);
  //for searchbox
  const locationEntry = document.getElementById('searchBar-form');
  locationEntry.addEventListener('submit', submitNewLocation);
  //set up
  setPlaceholderText();
  //load events
  loadWeather();
};

document.addEventListener('DOMContentLoaded', initApp);

const getGeoWeather = e => {
  if (e) {
    if (e.type === 'click') {
      //add spinner
      const mapIcon = document.querySelector('.fa-map-marker-alt');
      addSpinner(mapIcon);
    }
  }
  if (!navigator.geolocation) geoError();
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};
const geoError = errObj => {
  const errMsg = errObj ? errObj.message : 'Geolocation not supported';
  displayError(errMsg, errMsg);
};

const geoSuccess = position => {
  const myCoordsObj = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    name: `Lat:${position.coords.latitude} Long:${position.coords.longitude}`,
  };
  //set location object
  setLocationObject(currentLoc, myCoordsObj);
  //update data and display
  updateDateAndDisplay(currentLoc);
};

// here is the function for home button
const loadWeather = event => {
  const savedLocation = getHomeLocation();
  if (!savedLocation && !event) return getGeoWeather();
  if (!savedLocation && event.type === 'click') {
    displayError(
      'No Home Location Saved',
      'Sorry, Please save your home location first'
    );
  } else if (savedLocation && !event) {
    displayHomeLocationWeather(savedLocation);
  } else {
    const homeIcon = document.querySelector('.fa-home');
    addSpinner(homeIcon);
    displayHomeLocationWeather(savedLocation);
  }
};

const displayHomeLocationWeather = home => {
  if (typeof home === 'string') {
    const locationJson = JSON.parse(home);
    const myCoordsObj = {
      lat: locationJson.lat,
      lon: locationJson.lon,
      name: locationJson.name,
      unit: locationJson.unit,
    };
    setLocationObject(currentLoc, myCoordsObj);
    updateDateAndDisplay(currentLoc);
  }
};

//here is the function for save button
const saveLocation = () => {
  if (currentLoc.getLat() && currentLoc.getLon()) {
    const saveIcon = document.querySelector('.fa-save');
    addSpinner(saveIcon);
    const location = {
      name: currentLoc.getName(),
      lat: currentLoc.getLat(),
      lon: currentLoc.getLon(),
      unit: currentLoc.getUnit(),
    };
    localStorage.setItem('defaultWeatherLocation', JSON.stringify(location));
    updateScreenReaderConfirmation(
      `Saved ${currentLoc.getName()} as home location`
    );
  }
};

//here is the function for unit converter button
const setUnitPref = () => {
  const unitIcon = document.querySelector('.fa-chart-bar');
  addSpinner(unitIcon);
  currentLoc.toggleUnit();
  updateDateAndDisplay(currentLoc);
};

//here is the function for refresh button
const refreshWeather = () => {
  const refreshIcon = document.querySelector('.fa-sync-alt');
  addSpinner(refreshIcon);
  updateDateAndDisplay(currentLoc);
};

//here is the function for serchbox button
const submitNewLocation = async event => {
  event.preventDefault();
  const text = document.getElementById('searchBar-text').value;
  const entryText = cleanText(text);
  if (!entryText.length) return;
  const locationIcon = document.querySelector('.fa-search');
  addSpinner(locationIcon);
  const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
  if (coordsData) {
    if (coordsData.cod === 200) {
      //work with api data
      //sucsess
      const myCoordsObj = {
        lat: coordsData.coord.lat,
        lon: coordsData.coord.lon,
        name: coordsData.sys.country
          ? `${coordsData.name}, ${coordsData.sys.country}`
          : coordsData.name,
      };
      setLocationObject(currentLoc, myCoordsObj);
      updateDateAndDisplay(currentLoc);
    } else {
      displayApiError(coordsData);
    }
  } else {
    displayError('Connection Error', 'Connection Error');
  }
};

const updateDateAndDisplay = async locationObj => {
  const weatherJson = await getWeatherFromCoords(locationObj);
  //console.log(weatherJson);
  if (weatherJson) updateDisplay(weatherJson, locationObj);
};
