import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import './CSS/WeatherApp.css';
const BACKEND_URL = import.meta.env.VITE_API_URL;

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState({});
  const [hourlyForecast, setHourlyForecast] = useState([
    { time: '6:00 AM', icon: '☁️', temp: '25°' },
    { time: '9:00 AM', icon: '⛅', temp: '28°' },
    { time: '12:00 PM', icon: '☀️', temp: '33°' },
    { time: '3:00 PM', icon: '☀️', temp: '34°' },
    { time: '6:00 PM', icon: '☀️', temp: '32°' },
    { time: '9:00 PM', icon: '⛅', temp: '30°' }
  ]);
  const [dailyForecast, setDailyForecast] = useState([
    { day: 'Today', icon: '☀️', desc: 'Sunny', high: '36', low: '22' },
    { day: 'Tue', icon: '☀️', desc: 'Sunny', high: '37', low: '21' },
    { day: 'Wed', icon: '☀️', desc: 'Sunny', high: '37', low: '21' },
    { day: 'Thu', icon: '☁️', desc: 'Cloudy', high: '37', low: '21' },
    { day: 'Fri', icon: '☁️', desc: 'Cloudy', high: '37', low: '21' },
    { day: 'Sat', icon: '🌧️', desc: 'Rainy', high: '37', low: '21' },
    { day: 'Sun', icon: '⛈️', desc: 'Storm', high: '37', low: '21' }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState('');
  
  const API_KEY = '210d5062b95c6d926279c92dbf27770b';
  const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

  const updateUserCity = async (email, city) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/update-city`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ email: email, city: city }),
      });
      const data = await response.json();
      if (response.ok) { console.log(`City updated to ${city} for ${email}:`, data.message);} 
      else { console.error('Error updating city:', data.error); }
    } catch (error) { console.error('Error updating city:', error); }
  };

  const checkForRainAlert = async (weatherInfo) => {
    const rainChance = parseInt(weatherInfo.rainChance.replace('%', ''));
    const description = weatherInfo.description.toLowerCase();
    const hasRain = rainChance > 30 || description.includes('rain') || description.includes('storm') || description.includes('thunder') || description.includes('drizzle') || description.includes('shower');        
    if (hasRain && isRegistered && userEmail) {
      console.log('Sending rain alert...');
      try {
        const response = await fetch(`${BACKEND_URL}/api/check-weather-immediate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify({ email: userEmail, cityName: weatherInfo.cityName }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          if (data.severity && data.severity !== 'NONE') {
            console.log('Weather alert sent successfully:', data.message);
            setRegistrationStatus(`Weather alert sent! Severity: ${data.severity}`);
          } else {
            console.log(' No alert needed:', data.message);
            setRegistrationStatus(data.message);
          }
        } else {
          console.error('Error checking weather:', data.error);
          setRegistrationStatus('Error checking weather. Please try again.');
        }
      } catch (error) {
        console.error('Error checking weather:', error);
        setRegistrationStatus('Error checking weather. Is the backend server running?');
      }
    }
  };

  const getWeatherIcon = (weatherMain) => {
    const iconMap = { 'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️', 'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Smoke': '🌫️', 'Haze': '🌫️', 'Dust': '🌫️', 'Fog': '🌫️', 'Sand': '🌫️', 'Ash': '🌫️', 'Squall': '💨', 'Tornado': '🌪️' };
    return iconMap[weatherMain] || '☀️';
  };

  const fetchWeatherByCity = async (cityName) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${CURRENT_WEATHER_URL}?q=${cityName}&appid=${API_KEY}&units=metric`);
      if (!response.ok) { throw new Error('City not found'); }
      const data = await response.json();
      const newWeatherData = {
        cityName: data.name,
        temperature: `${Math.round(data.main.temp)}°`,
        description: data.weather[0].description,
        icon: getWeatherIcon(data.weather[0].main),
        feelsLike: `${Math.round(data.main.feels_like)}°`,
        windSpeed: `${data.wind.speed} km/h`,
        rainChance: `${data.clouds.all}%`,
        uvIndex: '3'
      };
      setWeatherData(newWeatherData);
      checkForRainAlert(newWeatherData);
      if (isRegistered && userEmail) { updateUserCity(userEmail, newWeatherData.cityName); }
      fetchForecastData(data.coord.lat, data.coord.lon);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      alert('City not found. Please try again.');
    } finally { setIsLoading(false); }
  };

  const fetchForecastData = async (lat, lon) => {
    try {
      const response = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      const data = await response.json(); 
      const hourlyData = data.list.slice(0, 6).map(item => {
        const time = new Date(item.dt * 1000);
        const hour = time.getHours();
        const displayTime = hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
        return {
          time: displayTime,
          icon: getWeatherIcon(item.weather[0].main),
          temp: `${Math.round(item.main.temp)}°`
        };
      });
      setHourlyForecast(hourlyData);
      const dailyData = groupForecastByDay(data.list);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const processedDaily = Object.keys(dailyData).slice(0, 7).map((date, index) => {
        const dayData = dailyData[date];
        const dateObj = new Date(date);
        const dayName = index === 0 ? 'Today' : days[dateObj.getDay()];
        const temps = dayData.map(item => item.main.temp);
        const maxTemp = Math.round(Math.max(...temps));
        const minTemp = Math.round(Math.min(...temps));
        const weather = dayData[0].weather[0].main;
        const description = dayData[0].weather[0].description;
        return {
          day: dayName,
          icon: getWeatherIcon(weather),
          desc: description,
          high: maxTemp.toString(),
          low: minTemp.toString()
        };
      });
      setDailyForecast(processedDaily);
    } catch (error) { console.error('Error fetching forecast data:', error); }
  };

  const groupForecastByDay = (forecastData) => {
    const grouped = {};
    forecastData.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!grouped[date]) { grouped[date] = []; }
      grouped[date].push(item);
    }); return grouped;
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsLoading(false); return;
    } navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const response = await fetch(`${CURRENT_WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
          const data = await response.json();
          const newWeatherData = {
            cityName: data.name,
            temperature: `${Math.round(data.main.temp)}°`,
            description: data.weather[0].description,
            icon: getWeatherIcon(data.weather[0].main),
            feelsLike: `${Math.round(data.main.feels_like)}°`,
            windSpeed: `${data.wind.speed} km/h`,
            rainChance: `${data.clouds.all}%`,
            uvIndex: '3'
          };
          setWeatherData(newWeatherData);
          checkForRainAlert(newWeatherData);
          if (isRegistered && userEmail) { updateUserCity(userEmail, newWeatherData.cityName); }
          fetchForecastData(lat, lon);
        } catch (error) {
          console.error('Error fetching weather data:', error);
          alert('Unable to fetch weather data. Please try again.');
        } finally { setIsLoading(false); }
      }, (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Loading default city.');
        fetchWeatherByCity('Madrid');
      }
    );
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const city = citySearch.trim();
      if (city) { fetchWeatherByCity(city); setCitySearch(''); }
    }
  };

  const handleEmailRegistration = async () => {
    if (!userEmail || !userEmail.includes('@')) { alert('Please enter a valid email address.'); return; }
    setIsLoading(true);
    setRegistrationStatus('Registering...');
    try {
      const response = await fetch(`${BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ email: userEmail, city: weatherData.cityName }),
      }); 
      const data = await response.json();
      if (response.ok) {
        setIsRegistered(true);
        setRegistrationStatus('Successfully registered for weather alerts!');
        alert('Successfully registered for weather alerts! You will receive notifications for severe weather conditions.');
      } else {
        setRegistrationStatus(`Registration failed: ${data.error}`);
        alert(`Registration failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error registering for alerts:', error);
      setRegistrationStatus('Failed to register. Please check if the backend server is running on port 8000.');
      alert('Failed to register. Please check if the backend server is running on port 8000.');
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (navigator.geolocation) { getCurrentLocation(); }
    else { fetchWeatherByCity('Madrid'); }
  }, []);

  return (
    <div className="weather-app">
      {isLoading && ( <>
        <div className="toast-overlay" />
        <div className="toast-message processing">Loading the Data...</div>
      </> )}
      <Header section={"Weather"} />
      <div className="weather-container">
        <div className="main-content">
          {!isRegistered && (
            <div className="email-registration">
              <div>
                <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="Enter email for weather alerts" className="email-input" />
                <button onClick={handleEmailRegistration} className="register-btn" disabled={isLoading} > {isLoading ? 'Registering...' : 'Register for Alerts'} </button>
              </div>
              {registrationStatus && (
                <div className={`registration-status ${isRegistered ? 'success' : 'error'}`}> {registrationStatus} </div>
              )}
            </div>
          )}
          
          {isRegistered && (
            <div className="registration-success">
              <p>✅ Registered for weather alerts: {userEmail}</p>
              {registrationStatus && <p className="status-message">{registrationStatus}</p>}
              <div className="manual-check-section">
                <button onClick={() => checkForRainAlert(weatherData)} className="check-weather-btn"  disabled={isLoading}> 🔍 Check Weather & Send Alert Now </button>
                <p className="check-info"> Click this button to immediately check current weather conditions and send an alert if needed. </p>
              </div>
            </div>
          )}
          
          <div className="search-bar">
            <input type="text" value={citySearch} onChange={(e) => setCitySearch(e.target.value)} onKeyPress={handleSearch} placeholder="Search for cities" className="city-search" />
            <button onClick={getCurrentLocation} className="location-btn"> 📍 Get My Location </button>
          </div>

          <div className="weather-main">
            <div className="city-info">
              <h1>{weatherData.cityName}</h1>
              <p>{weatherData.description}</p>
            </div>
             <div className="current-temp">
              <span className="temperature">{weatherData.temperature}</span>
              <div className="weather-icon">{weatherData.icon}</div>
            </div>
          </div>

          <div className="hourly-forecast">
            <h3>TODAY'S FORECAST</h3>
            <div className="hourly-container">
              {hourlyForecast.map((item, index) => (
                <div key={index} className="hourly-item">
                  <div className="hourly-time">{item.time}</div>
                  <div className="hourly-icon">{item.icon}</div>
                  <div className="hourly-temp">{item.temp}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="air-conditions">
            <div className="conditions-header">
              <h3>AIR CONDITIONS</h3>
              <button className="see-more">See more</button>
            </div>
            <div className="conditions-grid">
              <div className="condition-item">
                <div className="condition-icon">🌡️</div>
                <div className="condition-info">
                  <span className="condition-label">Real Feel</span>
                  <span className="condition-value">{weatherData.feelsLike}</span>
                </div>
              </div>
              <div className="condition-item">
                <div className="condition-icon">💨</div>
                <div className="condition-info">
                  <span className="condition-label">Wind</span>
                  <span className="condition-value">{weatherData.windSpeed}</span>
                </div>
              </div>
              <div className="condition-item">
                <div className="condition-icon">💧</div>
                <div className="condition-info">
                  <span className="condition-label">Chance of rain</span>
                  <span className="condition-value">{weatherData.rainChance}</span>
                </div>
              </div>
              <div className="condition-item">
                <div className="condition-icon">☀️</div>
                <div className="condition-info">
                  <span className="condition-label">UV Index</span>
                  <span className="condition-value">{weatherData.uvIndex}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="forecast-sidebar">
          <h3>7-DAY FORECAST</h3>
          <div className="daily-forecast">
            {dailyForecast.map((item, index) => (
              <div key={index} className="daily-item">
                <div className="daily-left">
                  <div className="daily-day">{item.day}</div>
                  <div className="daily-icon">{item.icon}</div>
                  <div className="daily-desc">{item.desc}</div>
                </div>
                <div className="daily-temps">
                  <span className="daily-high">{item.high}</span>
                  <span className="daily-low">/{item.low}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;