const background = document.querySelector('.wrapper')
const cityNameInput = document.querySelector('.search-field input')
const buttonSearch = document.querySelector('.search-btn')
const degree = document.querySelector('.current-weather .degree')
const weatherName = document.querySelector('.current-weather .weather-name')
const icon = document.querySelector('.icon-weather img')
const inforWeatherDescription = document.getElementsByClassName("description")
const body = document.querySelector("body")
const mainApp = document.querySelector(".wrapper")
const mapApp = document.querySelector(".map-container")
const backBtn = document.querySelector(".back-btn")
const apiKey = ""
const tileMapApiKey = ""
const PlaceApiKey = ""

// Build a map
var map = L.map('map');

var Thunderforest_OpenCycleMap = L.tileLayer(`https://api.thunderforest.com/cycle/{z}/{x}/{y}{r}.png?apikey=${tileMapApiKey}`, {
	attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	apikey: 'e810ee1a40e940aa8a3893db3fd8bdac',
	maxZoom: 22
})

Thunderforest_OpenCycleMap.addTo(map)



// get Coordinates
async function getCoordinates(cityName) {
        try {
                const respone = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`)
                const data = await respone.json()
                const coordinates = {
                        lat : data[0].lat,
                        lon : data[0].lon
                }
                return await coordinates 
        } catch (error) {
                
        }       
}

// get current weather
async function getCurrentWeather(lat, lon) { 
        try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
                const data = await response.json()
                const currentWeather = await {
                        main: data.weather[0].main,
                        description: data.weather[0].description,
                        icon:data.weather[0].icon, 
                        temp: data.main.temp,
                        humidity: data.main.humidity,
                        windSpeed: data.wind.speed,
                        clouds: data.clouds.all
                }
                return currentWeather        
        } catch (error) {
                
        }
}

async function getPlaceInfor(lat, lng) {
        const respone = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C+${lng}&key=${PlaceApiKey}`)
        const data = await respone.json()
        const placeInfor = {
                city: data.results[0].components.city,
                country: data.results[0].components.country
        }
        return placeInfor
}

// change the infor in the interface of the app
async function changeInfor(currentWeather) {
        degree.textContent = currentWeather.temp+" °C"
        weatherName.textContent = currentWeather.main
        icon.src = `/icons/${currentWeather.main}.svg`
        switch (currentWeather.main) {
                case "Clear":
                        background.style.backgroundColor = "#8FE0FF"
                        body.style.backgroundImage = "url(/Images/clearBackground.jpg)"
                        changeColorInforBlack()
                        break;
                case"Clouds":
                        background.style.backgroundColor = "#75B4E3"
                        body.style.backgroundImage = "url(/Images/cloudsBackground.jpg)"
                        changeColorInforBlack()
                        break
                case"Rain":
                        background.style.backgroundColor = "#024683"
                        body.style.backgroundImage = "url(/Images/rainBackground.jpg)"
                        changeColorInforWhite()
                        break
                default:
                        break;
        }
        const description = [currentWeather.description
                , currentWeather.humidity+"%"
                , Math.round((currentWeather.windSpeed)*3.6)+" km/h"
                , currentWeather.clouds+"%"]

        for(let i = 0; i < inforWeatherDescription.length; i++) {
                inforWeatherDescription[i].textContent = description[i]
        }
}

// change white color of words
function changeColorInforWhite() {
        const inforWeather = document.querySelectorAll(".infor-field P")
        const currentWeatherName = document.querySelector(".weather-name")
        const currentWeatherDegree = document.querySelector(".degree")
        for(i = 0; i < inforWeather.length; i++) {
                inforWeather[i].style.color = "#fff"
        }
        currentWeatherName.style.color = "#fff"
        currentWeatherDegree.style.color = "#fff"
}

// change black color of words
function changeColorInforBlack() {
        const inforWeather = document.querySelectorAll(".infor-field P")
        const currentWeatherName = document.querySelector(".weather-name")
        const currentWeatherDegree = document.querySelector(".degree")
        for(i = 0; i < inforWeather.length; i++) {
                inforWeather[i].style.color = "#333"
        }
        currentWeatherName.style.color = "#333"
        currentWeatherDegree.style.color = "#333"
}

// event handle on search bar
cityNameInput.onkeyup = async function(e) {
        if(e.keyCode === 13) {
                const nameCity= cityNameInput.value
                const coordinates = await getCoordinates(nameCity)
                const currentWeather = await getCurrentWeather(coordinates.lat, coordinates.lon)
                changeInfor(currentWeather)
        }
}

// event handle on map
buttonSearch.onclick = function() {
        const mapSearchBar = document.querySelector(".header-map .search-field-map input")
        mainApp.style.display = "none"
        mapApp.style.display = "flex"
        map.invalidateSize()
        map.fitWorld()

        backBtn.onclick = function() {
                mainApp.style.display ="block"  
                mapApp.style.display = "none"
        }

        map.on('dblclick', async function(e) {
                const currentWeather = await getCurrentWeather(e.latlng.lat, e.latlng.lng)
                const placeInfor =  await getPlaceInfor(e.latlng.lat, e.latlng.lng)
                mainApp.style.display ="block"  
                mapApp.style.display = "none"
                mapSearchBar.value = ""
                changeInfor(currentWeather)
                if(!(placeInfor.city == undefined)) {
                        cityNameInput.value = placeInfor.city+` (${placeInfor.country})`
                }else{
                        cityNameInput.value = placeInfor.country
                }

        })

        mapSearchBar.onkeypress = async function(e) {
               if(e.keyCode === 13) {
                        const location = mapSearchBar.value
                        const coordinates = await getCoordinates(location)
                        map.setView(L.latLng(coordinates.lat, coordinates.lon), 10)
               }
        }
}
