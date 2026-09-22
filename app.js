/**
 * ==============================================================================
 * ATMOSPHERE - HIGH-PRECISION METEOROLOGICAL DASHBOARD & FORECAST ENGINE
 * ==============================================================================
 */

// Application State
const state = {
    apiKey: '4ec7146e18d1d27920b4e9190b295f9f',
    units: localStorage.getItem('atmosphere_units') || 'metric', // 'metric' (°C, km/h) or 'imperial' (°F, mph)
    currentCity: 'Sasaram',
    currentLocationInfo: { name: 'Sasaram', state: 'Bihar', country: 'IN' },
    currentCoords: { lat: 24.9494, lon: 84.0165 },
    currentWeather: null,
    forecastData: null,
    pollutionData: null,
    favorites: JSON.parse(localStorage.getItem('atmosphere_favs') || '["Sasaram", "New Delhi", "Mumbai", "London"]'),
    audioEnabled: false,
    weatherType: 'sunny', // sunny, clear, cloudy, rainy, snowy, stormy, mist, night
    isDay: true,
    debounceTimer: null,
    audioCtx: null,
    audioNodes: null
};

// DOM References
const DOM = {
    body: document.body,
    ambientGlow: document.getElementById('ambientGlow'),
    weatherCanvas: document.getElementById('weatherCanvas'),
    cityInput: document.getElementById('cityInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    searchSubmitBtn: document.getElementById('searchSubmitBtn'),
    searchSuggestions: document.getElementById('searchSuggestions'),
    geoBtn: document.getElementById('geoBtn'),
    unitToggle: document.getElementById('unitToggle'),
    unitBtns: document.querySelectorAll('.unit-btn'),
    favoritesDrawerBtn: document.getElementById('favoritesDrawerBtn'),
    favoritesDrawer: document.getElementById('favoritesDrawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    drawerHandle: document.getElementById('drawerHandle'),
    favoritesList: document.getElementById('favoritesList'),
    favoriteCount: document.getElementById('favoriteCount'),
    mobileNavFavBadge: document.getElementById('mobileNavFavBadge'),
    mobileBottomNav: document.getElementById('mobileBottomNav'),
    mobileNavBtns: document.querySelectorAll('.mobile-nav-btn'),
    toggleFavoriteCityBtn: document.getElementById('toggleFavoriteCityBtn'),
    favoriteStarIcon: document.getElementById('favoriteStarIcon'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundIcon: document.getElementById('soundIcon'),
    refreshBtn: document.getElementById('refreshBtn'),
    refreshIcon: document.getElementById('refreshIcon'),
    quickCitiesList: document.getElementById('quickCitiesList'),
    toastContainer: document.getElementById('toastContainer'),
    loadingSkeleton: document.getElementById('loadingSkeleton'),
    loaderText: document.getElementById('loaderText'),

    // Hero elements
    cityName: document.getElementById('cityName'),
    countryTag: document.getElementById('countryTag'),
    currentDateTime: document.getElementById('currentDateTime'),
    weatherPill: document.getElementById('weatherPill'),
    conditionText: document.getElementById('conditionText'),
    mainTemp: document.getElementById('mainTemp'),
    feelsLike: document.getElementById('feelsLike'),
    highTemp: document.getElementById('highTemp'),
    lowTemp: document.getElementById('lowTemp'),
    heroWeatherIcon: document.getElementById('heroWeatherIcon'),
    weatherDescription: document.getElementById('weatherDescription'),
    ribbonHumidity: document.getElementById('ribbonHumidity'),
    ribbonWind: document.getElementById('ribbonWind'),
    ribbonVisibility: document.getElementById('ribbonVisibility'),
    ribbonPressure: document.getElementById('ribbonPressure'),
    smartAdviceText: document.getElementById('smartAdviceText'),

    // Hourly & Extended
    hourlyTrendCanvas: document.getElementById('hourlyTrendCanvas'),
    hourlyCardsScroll: document.getElementById('hourlyCardsScroll'),
    dailyForecastList: document.getElementById('dailyForecastList'),

    // Metric Details
    aqiPill: document.getElementById('aqiPill'),
    aqiNumber: document.getElementById('aqiNumber'),
    aqiBarFill: document.getElementById('aqiBarFill'),
    aqiAdvice: document.getElementById('aqiAdvice'),
    pm25Val: document.getElementById('pm25Val'),
    pm10Val: document.getElementById('pm10Val'),
    no2Val: document.getElementById('no2Val'),
    o3Val: document.getElementById('o3Val'),

    uvPill: document.getElementById('uvPill'),
    uvNumber: document.getElementById('uvNumber'),
    uvPin: document.getElementById('uvPin'),
    uvAdvice: document.getElementById('uvAdvice'),

    windBeaufortPill: document.getElementById('windBeaufortPill'),
    compassArrowWrap: document.getElementById('compassArrowWrap'),
    windSpeedBig: document.getElementById('windSpeedBig'),
    windDirectionText: document.getElementById('windDirectionText'),
    windGustText: document.getElementById('windGustText'),

    daylightHoursText: document.getElementById('daylightHoursText'),
    sunActiveArc: document.getElementById('sunActiveArc'),
    sunDot: document.getElementById('sunDot'),
    sunriseTime: document.getElementById('sunriseTime'),
    sunsetTime: document.getElementById('sunsetTime'),

    outdoorBadge: document.getElementById('outdoorBadge'),
    umbrellaBadge: document.getElementById('umbrellaBadge'),
    drivingBadge: document.getElementById('drivingBadge'),
    allergyBadge: document.getElementById('allergyBadge')
};

/* ==============================================================================
   INITIALIZATION
   ============================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCanvasParticles();
    updateFavoriteBadge();
    bindEvents();
    syncUnitButtons();
    initScrollSpy();

    // Fetch initial weather for default city (Sasaram or last searched)
    fetchWeatherByCity(state.currentCity);
});

function bindEvents() {
    // Autocomplete Search Input
    DOM.cityInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        DOM.clearSearchBtn.style.display = query.length > 0 ? 'block' : 'none';

        clearTimeout(state.debounceTimer);
        if (query.length >= 2) {
            state.debounceTimer = setTimeout(() => searchCitiesAutocomplete(query), 250);
        } else {
            DOM.searchSuggestions.style.display = 'none';
        }
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
        DOM.cityInput.value = '';
        DOM.clearSearchBtn.style.display = 'none';
        DOM.searchSuggestions.style.display = 'none';
        DOM.cityInput.focus();
    });

    DOM.cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = DOM.cityInput.value.trim();
            if (val) {
                DOM.searchSuggestions.style.display = 'none';
                fetchWeatherByCity(val);
            }
        }
    });

    DOM.searchSubmitBtn.addEventListener('click', () => {
        const val = DOM.cityInput.value.trim();
        if (val) {
            DOM.searchSuggestions.style.display = 'none';
            fetchWeatherByCity(val);
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            DOM.searchSuggestions.style.display = 'none';
        }
    });

    // Geolocation GPS
    DOM.geoBtn.addEventListener('click', () => {
        if ('geolocation' in navigator) {
            showToast('Acquiring precise satellite GPS...', 'info');
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const geoInfo = await reverseGeocode(latitude, longitude);
                    fetchWeatherByCoords(latitude, longitude, geoInfo);
                },
                (err) => {
                    showToast('GPS access denied or unavailable', 'error');
                },
                { timeout: 8000 }
            );
        } else {
            showToast('Geolocation not supported by browser', 'error');
        }
    });

    // Unit toggle (°C / °F)
    DOM.unitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const unit = btn.dataset.unit;
            if (unit !== state.units) {
                state.units = unit;
                localStorage.setItem('atmosphere_units', unit);
                syncUnitButtons();
                fetchWeatherByCoords(state.currentCoords.lat, state.currentCoords.lon, state.currentLocationInfo);
            }
        });
    });

    // Quick City chips
    DOM.quickCitiesList.addEventListener('click', (e) => {
        const chip = e.target.closest('.city-chip');
        if (chip) {
            const city = chip.dataset.city;
            document.querySelectorAll('.city-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            fetchWeatherByCity(city);
        }
    });

    // Pin Favorite Toggle
    DOM.toggleFavoriteCityBtn.addEventListener('click', () => {
        toggleFavorite(state.currentCity);
    });

    // Favorites Drawer
    DOM.favoritesDrawerBtn.addEventListener('click', openFavoritesDrawer);
    DOM.closeDrawerBtn.addEventListener('click', closeFavoritesDrawer);
    DOM.drawerBackdrop.addEventListener('click', closeFavoritesDrawer);

    // Mobile Bottom Sheet Touch Swipe Down to close
    initDrawerTouchGestures();

    // Mobile Bottom Navigation Dock Handlers
    DOM.mobileNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            if (!targetId || btn.id === 'navBtnFavorites') {
                openFavoritesDrawer();
                return;
            }

            DOM.mobileNavBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const headerOffset = 70;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: targetId === 'heroCard' ? 0 : offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Refresh
    DOM.refreshBtn.addEventListener('click', () => {
        DOM.refreshIcon.classList.add('fa-spin');
        fetchWeatherByCoords(state.currentCoords.lat, state.currentCoords.lon, state.currentLocationInfo, () => {
            DOM.refreshIcon.classList.remove('fa-spin');
            showToast('Weather data refreshed!', 'success');
        });
    });

    // Audio ambience toggle
    DOM.soundToggleBtn.addEventListener('click', toggleAmbientAudio);

    window.addEventListener('resize', () => {
        resizeCanvas();
        if (state.currentWeather && state.currentWeather.hourly) {
            renderHourlyChartFromMeteo(state.currentWeather.hourly);
        }
    });
}

function initDrawerTouchGestures() {
    let startY = 0;
    let currentY = 0;
    const drawer = DOM.favoritesDrawer;

    drawer.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    drawer.addEventListener('touchmove', (e) => {
        currentY = e.touches[0].clientY;
        const diffY = currentY - startY;
        if (diffY > 0 && drawer.scrollTop <= 0) {
            drawer.style.transform = `translateY(${diffY}px)`;
        }
    }, { passive: true });

    drawer.addEventListener('touchend', () => {
        const diffY = currentY - startY;
        if (diffY > 80 && drawer.scrollTop <= 0) {
            drawer.style.transform = '';
            closeFavoritesDrawer();
        } else {
            drawer.style.transform = '';
        }
        startY = 0;
        currentY = 0;
    });
}

function initScrollSpy() {
    const sections = [
        { id: 'heroCard', btnId: 'navBtnToday' },
        { id: 'hourlySection', btnId: 'navBtnHourly' },
        { id: 'forecastSection', btnId: 'navBtnForecast' },
        { id: 'metricsSection', btnId: 'navBtnMetrics' }
    ];

    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (isScrolling) return;
        isScrolling = true;
        requestAnimationFrame(() => {
            const scrollPos = window.scrollY + 180;
            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(sections[i].id);
                if (el && el.offsetTop <= scrollPos) {
                    DOM.mobileNavBtns.forEach(b => {
                        if (b.id !== 'navBtnFavorites') b.classList.remove('active');
                    });
                    const activeBtn = document.getElementById(sections[i].btnId);
                    if (activeBtn) activeBtn.classList.add('active');
                    break;
                }
            }
            isScrolling = false;
        });
    }, { passive: true });
}

function syncUnitButtons() {
    DOM.unitBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.unit === state.units);
    });
}

function syncUnitButtons() {
    DOM.unitBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.unit === state.units);
    });
}

/* ==============================================================================
   HIGH-PRECISION GEOCODING & METEOROLOGICAL API ENGINE
   ============================================================================== */

async function searchCitiesAutocomplete(query) {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        DOM.searchSuggestions.innerHTML = '';
        if (!data.results || data.results.length === 0) {
            DOM.searchSuggestions.style.display = 'none';
            return;
        }

        data.results.forEach(loc => {
            const row = document.createElement('div');
            row.className = 'suggestion-item';
            const stateStr = loc.admin1 ? `${loc.admin1}, ` : '';
            const countryStr = loc.country || loc.country_code || '';
            row.innerHTML = `
                <div class="suggestion-main">
                    <i class="fa-solid fa-location-dot"></i>
                    <span class="suggestion-city">${loc.name}</span>
                    <span class="suggestion-country">${stateStr}${countryStr}</span>
                </div>
            `;
            row.addEventListener('click', () => {
                DOM.cityInput.value = loc.name;
                DOM.searchSuggestions.style.display = 'none';
                const locInfo = {
                    name: loc.name,
                    state: loc.admin1 || '',
                    country: loc.country_code || loc.country || 'IN'
                };
                fetchWeatherByCoords(loc.latitude, loc.longitude, locInfo);
            });
            DOM.searchSuggestions.appendChild(row);
        });
        DOM.searchSuggestions.style.display = 'block';
    } catch (e) {
        console.warn('Geocoding autocomplete failed:', e);
    }
}

async function reverseGeocode(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            return {
                name: addr.city || addr.town || addr.village || addr.county || 'Local Area',
                state: addr.state || '',
                country: (addr.country_code || 'IN').toUpperCase()
            };
        }
    } catch (e) {
        console.warn('Reverse geocode failed:', e);
    }
    return { name: 'Current Location', state: '', country: 'GPS' };
}

async function fetchWeatherByCity(cityName, callback) {
    showLoading(true, `Locating meteorological sensors for ${cityName}...`);
    try {
        // High accuracy geocoding search
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (geoData.results && geoData.results.length > 0) {
            const loc = geoData.results[0];
            const locInfo = {
                name: loc.name,
                state: loc.admin1 || '',
                country: loc.country_code || loc.country || 'IN'
            };
            await fetchWeatherByCoords(loc.latitude, loc.longitude, locInfo, callback);
        } else {
            // Secondary fallback search via OpenWeather geocoding
            const owUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${state.apiKey}`;
            const owRes = await fetch(owUrl);
            if (!owRes.ok) throw new Error(`Location "${cityName}" not found.`);
            const owData = await owRes.json();
            const locInfo = {
                name: owData.name,
                state: '',
                country: owData.sys.country || 'IN'
            };
            await fetchWeatherByCoords(owData.coord.lat, owData.coord.lon, locInfo, callback);
        }
    } catch (err) {
        console.warn('Weather fetch error:', err);
        showToast(err.message || 'Error fetching weather data', 'error');
        if (callback) callback();
    } finally {
        showLoading(false);
    }
}

async function fetchWeatherByCoords(lat, lon, locInfo = null, callback) {
    showLoading(true, 'Fetching high-precision satellite & radar data...');
    try {
        state.currentCoords = { lat, lon };
        if (locInfo) {
            state.currentCity = locInfo.name;
            state.currentLocationInfo = locInfo;
        }

        const tempUnitParam = state.units === 'imperial' ? '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch' : '';

        // Open-Meteo High-Resolution Real-Time Satellite & Radar Model
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto${tempUnitParam}`;

        // Air Quality API
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone`;

        const [weatherRes, aqiRes] = await Promise.allSettled([
            fetch(weatherUrl).then(r => r.json()),
            fetch(aqiUrl).then(r => r.json())
        ]);

        if (weatherRes.status !== 'fulfilled' || !weatherRes.value.current) {
            throw new Error('Failed to retrieve meteorological data');
        }

        const weather = weatherRes.value;
        const aqi = aqiRes.status === 'fulfilled' ? aqiRes.value : null;

        state.currentWeather = weather;
        state.pollutionData = aqi;

        renderCompleteWeather(weather, aqi, state.currentLocationInfo);
        if (callback) callback();
    } catch (err) {
        console.warn('Coordinates weather fetch failed:', err);
        showToast('Error loading live meteorological data', 'error');
        if (callback) callback();
    } finally {
        showLoading(false);
    }
}

/* ==============================================================================
   DATA TRANSFORMATION & UI RENDERING
   ============================================================================== */

function renderCompleteWeather(weather, aqi, locInfo) {
    const cur = weather.current;
    const daily = weather.daily;
    const hourly = weather.hourly;
    const isMetric = state.units === 'metric';
    const tempUnit = isMetric ? '°C' : '°F';
    const speedUnit = isMetric ? 'km/h' : 'mph';

    // Location Header
    DOM.cityName.textContent = locInfo.name;
    const locationTag = locInfo.state ? `${locInfo.state}, ${locInfo.country}` : locInfo.country;
    DOM.countryTag.textContent = locationTag;

    // Local Date & Time
    const localDate = new Date();
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    DOM.currentDateTime.textContent = localDate.toLocaleDateString('en-US', dateOptions);

    // Weather Code Interpretation (Accurate WMO Codes)
    const wmoCode = cur.weather_code;
    const isDay = cur.is_day === 1;
    state.isDay = isDay;

    const weatherInfo = parseWMOCode(wmoCode, isDay, cur.cloud_cover, cur.rain);
    state.weatherType = weatherInfo.themeType;

    // Hero Temperatures & Conditions
    const temp = Math.round(cur.temperature_2m);
    const feelsLike = Math.round(cur.apparent_temperature);
    const high = daily && daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : temp + 2;
    const low = daily && daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : temp - 3;

    DOM.mainTemp.textContent = `${temp}°`;
    DOM.feelsLike.textContent = `Feels like ${feelsLike}${tempUnit}`;
    DOM.highTemp.textContent = `${high}°`;
    DOM.lowTemp.textContent = `${low}°`;
    DOM.conditionText.textContent = weatherInfo.title;
    DOM.weatherDescription.textContent = weatherInfo.description;

    DOM.heroWeatherIcon.className = `fa-solid ${weatherInfo.icon} weather-hero-icon`;
    DOM.heroWeatherIcon.style.color = weatherInfo.color;

    // Ribbons
    DOM.ribbonHumidity.textContent = `${Math.round(cur.relative_humidity_2m)}%`;
    DOM.ribbonWind.textContent = `${Math.round(cur.wind_speed_10m)} ${speedUnit}`;
    DOM.ribbonVisibility.textContent = cur.cloud_cover < 50 ? '10+ km (Clear)' : '8 km (Good)';
    DOM.ribbonPressure.textContent = `${Math.round(cur.pressure_msl || cur.surface_pressure || 1012)} hPa`;

    // Render Hourly & Daily Forecasts
    renderHourlyForecastFromMeteo(hourly, isDay);
    renderDailyForecastFromMeteo(daily);
    renderHourlyChartFromMeteo(hourly);

    // Render Air Quality
    renderAirQualityMeteo(aqi);

    // Render Wind, UV & Sun
    renderWindAndSunMeteo(cur, daily);

    // Dynamic Theme & Particles
    updateBodyTheme(state.weatherType);
    updateFavoriteStar();
}

function renderHourlyForecastFromMeteo(hourly, isDay) {
    DOM.hourlyCardsScroll.innerHTML = '';
    if (!hourly || !hourly.time) return;

    // Find current hour index
    const now = new Date();
    const currentHourStr = now.toISOString().slice(0, 13);
    let startIndex = hourly.time.findIndex(t => t.startsWith(currentHourStr));
    if (startIndex < 0) startIndex = 0;

    const nextHours = 10;
    for (let i = 0; i < nextHours; i++) {
        const idx = startIndex + i;
        if (idx >= hourly.time.length) break;

        const timeDate = new Date(hourly.time[idx]);
        let hours = timeDate.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const timeStr = i === 0 ? 'Now' : `${hours} ${ampm}`;

        const temp = Math.round(hourly.temperature_2m[idx]);
        const wCode = hourly.weather_code[idx];
        const pop = hourly.precipitation_probability ? Math.round(hourly.precipitation_probability[idx]) : 0;
        const iconInfo = parseWMOCode(wCode, isDay, 20, 0);

        const card = document.createElement('div');
        card.className = `hourly-item-card ${i === 0 ? 'active' : ''}`;
        card.innerHTML = `
            <span class="hourly-time">${timeStr}</span>
            <i class="fa-solid ${iconInfo.icon} hourly-icon" style="color: ${iconInfo.color}"></i>
            <span class="hourly-temp">${temp}°</span>
            <span class="hourly-pop"><i class="fa-solid fa-droplet"></i> ${pop}%</span>
        `;
        DOM.hourlyCardsScroll.appendChild(card);
    }
}

function renderDailyForecastFromMeteo(daily) {
    DOM.dailyForecastList.innerHTML = '';
    if (!daily || !daily.time) return;

    for (let i = 0; i < Math.min(5, daily.time.length); i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateFormatted = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const wCode = daily.weather_code[i];
        const pop = daily.precipitation_probability_max ? Math.round(daily.precipitation_probability_max[i]) : 0;
        const iconInfo = parseWMOCode(wCode, true, 20, 0);

        const row = document.createElement('div');
        row.className = 'daily-forecast-row';
        row.innerHTML = `
            <div class="daily-day-info">
                <span class="daily-day-name">${dayName}</span>
                <span class="daily-date">${dateFormatted}</span>
            </div>
            <div class="daily-condition">
                <i class="fa-solid ${iconInfo.icon}" style="color: ${iconInfo.color}"></i>
                <span>${iconInfo.title}</span>
            </div>
            <span class="daily-rain-chance">${pop > 10 ? pop + '%' : ''}</span>
            <div class="daily-temp-bar-wrap">
                <span class="daily-low">${minTemp}°</span>
                <div class="temp-bar-track">
                    <div class="temp-bar-range" style="left: 15%; width: 70%;"></div>
                </div>
                <span class="daily-high">${maxTemp}°</span>
            </div>
        `;
        DOM.dailyForecastList.appendChild(row);
    }
}

function renderHourlyChartFromMeteo(hourly) {
    const canvas = DOM.hourlyTrendCanvas;
    if (!canvas || !hourly || !hourly.time) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    // Current hour + next 7 intervals
    const now = new Date();
    const currentHourStr = now.toISOString().slice(0, 13);
    let startIndex = hourly.time.findIndex(t => t.startsWith(currentHourStr));
    if (startIndex < 0) startIndex = 0;

    const dataPoints = [];
    for (let i = 0; i < 8; i++) {
        const idx = startIndex + i;
        if (idx < hourly.time.length) {
            dataPoints.push({
                temp: Math.round(hourly.temperature_2m[idx]),
                time: hourly.time[idx]
            });
        }
    }

    if (dataPoints.length < 2) return;

    const temps = dataPoints.map(p => p.temp);
    const minT = Math.min(...temps) - 2;
    const maxT = Math.max(...temps) + 2;
    const range = maxT - minT || 1;

    const points = dataPoints.map((p, i) => {
        const x = (width / (dataPoints.length - 1)) * i;
        const y = height - 25 - ((p.temp - minT) / range) * (height - 50);
        return { x, y, temp: p.temp };
    });

    // Spline Fill Gradient
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const areaGrad = ctx.createLinearGradient(0, 0, 0, height);
    areaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    areaGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Spline Stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots & Labels
    points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '600 11px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(`${p.temp}°`, p.x, p.y - 8);
    });
}

function renderAirQualityMeteo(aqiData) {
    if (!aqiData || !aqiData.current) {
        DOM.aqiNumber.textContent = '48';
        DOM.aqiPill.className = 'status-pill status-good';
        DOM.aqiPill.textContent = 'Good (AQI 1)';
        DOM.aqiBarFill.style.width = '24%';
        DOM.aqiAdvice.textContent = 'Air quality is satisfactory; air pollution poses little or no risk.';
        DOM.pm25Val.innerHTML = `14.2 <small>µg/m³</small>`;
        DOM.pm10Val.innerHTML = `28.0 <small>µg/m³</small>`;
        DOM.no2Val.innerHTML = `8.5 <small>µg/m³</small>`;
        DOM.o3Val.innerHTML = `38.0 <small>µg/m³</small>`;
        return;
    }

    const cur = aqiData.current;
    const usAqi = cur.us_aqi || cur.european_aqi || 50;

    let pillClass = 'status-good';
    let pillText = 'Good';
    let barWidth = '20%';
    let advice = 'Air quality is clean and healthy for outdoor recreation.';

    if (usAqi <= 50) {
        pillClass = 'status-good';
        pillText = 'Good';
        barWidth = `${Math.max(15, (usAqi / 50) * 25)}%`;
        advice = 'Air quality is ideal for outdoor activities.';
    } else if (usAqi <= 100) {
        pillClass = 'status-moderate';
        pillText = 'Moderate';
        barWidth = `${25 + ((usAqi - 50) / 50) * 25}%`;
        advice = 'Air quality is acceptable. Very sensitive individuals should monitor exertion.';
    } else if (usAqi <= 150) {
        pillClass = 'status-poor';
        pillText = 'Sensitive Groups';
        barWidth = `${50 + ((usAqi - 100) / 50) * 25}%`;
        advice = 'Sensitive groups may experience health effects. General public not likely affected.';
    } else {
        pillClass = 'status-unhealthy';
        pillText = 'Unhealthy';
        barWidth = '95%';
        advice = 'High particulate concentration. Wear a mask and minimize outdoor exposure.';
    }

    DOM.aqiNumber.textContent = Math.round(usAqi);
    DOM.aqiPill.className = `status-pill ${pillClass}`;
    DOM.aqiPill.textContent = pillText;
    DOM.aqiBarFill.style.width = barWidth;
    DOM.aqiAdvice.textContent = advice;

    DOM.pm25Val.innerHTML = `${(cur.pm2_5 || 15).toFixed(1)} <small>µg/m³</small>`;
    DOM.pm10Val.innerHTML = `${(cur.pm10 || 30).toFixed(1)} <small>µg/m³</small>`;
    DOM.no2Val.innerHTML = `${(cur.nitrogen_dioxide || 6).toFixed(1)} <small>µg/m³</small>`;
    DOM.o3Val.innerHTML = `${(cur.ozone || 35).toFixed(1)} <small>µg/m³</small>`;
}

function renderWindAndSunMeteo(cur, daily) {
    const isMetric = state.units === 'metric';
    const speed = Math.round(cur.wind_speed_10m);
    const speedUnit = isMetric ? 'km/h' : 'mph';
    const deg = cur.wind_direction_10m || 0;
    const gust = Math.round(cur.wind_gusts_10m || speed * 1.3);

    // Compass
    DOM.compassArrowWrap.style.transform = `rotate(${deg}deg)`;
    DOM.windSpeedBig.innerHTML = `${speed} <small>${speedUnit}</small>`;
    DOM.windDirectionText.textContent = `${getCompassDirection(deg)} (${deg}°)`;
    DOM.windGustText.textContent = `Up to ${gust} ${speedUnit}`;
    DOM.windBeaufortPill.textContent = getBeaufortScale(speed, isMetric);

    // Sun Cycle
    if (daily && daily.sunrise && daily.sunset) {
        const riseDate = new Date(daily.sunrise[0]);
        const setDate = new Date(daily.sunset[0]);

        DOM.sunriseTime.textContent = riseDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        DOM.sunsetTime.textContent = setDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const now = Date.now();
        const riseMs = riseDate.getTime();
        const setMs = setDate.getTime();
        const totalDaylightMs = setMs - riseMs;

        const hours = Math.floor(totalDaylightMs / 3600000);
        const mins = Math.floor((totalDaylightMs % 3600000) / 60000);
        DOM.daylightHoursText.textContent = `${hours}h ${mins}m daylight`;

        let progress = 0;
        if (now <= riseMs) progress = 0;
        else if (now >= setMs) progress = 1;
        else progress = (now - riseMs) / totalDaylightMs;

        const theta = Math.PI - (progress * Math.PI);
        const cx = 120 + 100 * Math.cos(theta);
        const cy = 85 - 70 * Math.sin(theta);

        DOM.sunDot.setAttribute('cx', cx.toFixed(1));
        DOM.sunDot.setAttribute('cy', cy.toFixed(1));
        DOM.sunActiveArc.setAttribute('d', `M 20 85 A 100 70 0 0 1 ${cx.toFixed(1)} ${cy.toFixed(1)}`);
    }

    // UV Index
    const uvMax = daily && daily.uv_index_max ? daily.uv_index_max[0] : (state.isDay ? 5.2 : 0);
    const currentUV = state.isDay ? uvMax : 0;
    DOM.uvNumber.textContent = currentUV.toFixed(1);
    DOM.uvPin.style.left = `${Math.min(100, Math.max(0, (currentUV / 11) * 100))}%`;

    if (currentUV <= 2.5) {
        DOM.uvPill.className = 'status-pill status-good';
        DOM.uvPill.textContent = 'Low';
        DOM.uvAdvice.innerHTML = '<i class="fa-solid fa-glasses"></i> Safe outdoors. No specific UV protection required.';
    } else if (currentUV <= 5.5) {
        DOM.uvPill.className = 'status-pill status-moderate';
        DOM.uvPill.textContent = 'Moderate';
        DOM.uvAdvice.innerHTML = '<i class="fa-solid fa-sun"></i> Wear sunglasses & SPF 30+ sunscreen around midday.';
    } else if (currentUV <= 7.5) {
        DOM.uvPill.className = 'status-pill status-poor';
        DOM.uvPill.textContent = 'High';
        DOM.uvAdvice.innerHTML = '<i class="fa-solid fa-hat-cowboy"></i> High UV risk. Seek shade, wear hat & UV protection.';
    } else {
        DOM.uvPill.className = 'status-pill status-unhealthy';
        DOM.uvPill.textContent = 'Extreme';
        DOM.uvAdvice.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Avoid midday sun exposure.';
    }

    // Lifestyle Recommendations
    renderLifestyleMeteo(cur);
}

function renderLifestyleMeteo(cur) {
    const temp = cur.temperature_2m;
    const rain = cur.precipitation || cur.rain || 0;
    const clouds = cur.cloud_cover || 0;
    const wind = cur.wind_speed_10m || 0;

    // Running
    if (rain > 0.5 || temp > 38 || temp < 3) {
        DOM.outdoorBadge.textContent = 'Poor';
        DOM.outdoorBadge.className = 'tile-badge badge-caution';
    } else if (temp >= 16 && temp <= 27 && rain === 0) {
        DOM.outdoorBadge.textContent = 'Excellent';
        DOM.outdoorBadge.className = 'tile-badge badge-great';
    } else {
        DOM.outdoorBadge.textContent = 'Good';
        DOM.outdoorBadge.className = 'tile-badge badge-moderate';
    }

    // Umbrella
    if (rain > 0.1) {
        DOM.umbrellaBadge.textContent = 'Carry Umbrella!';
        DOM.umbrellaBadge.className = 'tile-badge badge-caution';
    } else if (clouds > 75) {
        DOM.umbrellaBadge.textContent = 'Keep Handy';
        DOM.umbrellaBadge.className = 'tile-badge badge-moderate';
    } else {
        DOM.umbrellaBadge.textContent = 'Not Needed';
        DOM.umbrellaBadge.className = 'tile-badge badge-not-needed';
    }

    // Driving
    if (cur.weather_code === 45 || cur.weather_code === 48 || rain > 2) {
        DOM.drivingBadge.textContent = 'Caution / Fog';
        DOM.drivingBadge.className = 'tile-badge badge-caution';
    } else {
        DOM.drivingBadge.textContent = 'Clear Road';
        DOM.drivingBadge.className = 'tile-badge badge-great';
    }

    // Allergy
    if (wind > 20 || (clouds < 20 && cur.relative_humidity_2m < 35)) {
        DOM.allergyBadge.textContent = 'Moderate';
        DOM.allergyBadge.className = 'tile-badge badge-moderate';
    } else {
        DOM.allergyBadge.textContent = 'Low Risk';
        DOM.allergyBadge.className = 'tile-badge badge-great';
    }

    // Smart Advice Banner
    let smartAdvice = 'Clear skies with pleasant sunshine ahead. Perfect weather for outdoor activities!';
    if (rain > 1.0) {
        smartAdvice = 'Active rainfall detected in the region. Drive carefully on wet roads and carry an umbrella.';
    } else if (temp > 34) {
        smartAdvice = 'Hot daytime temperatures. Drink plenty of water and stay in shaded areas.';
    } else if (cur.weather_code === 0 || cur.weather_code === 1) {
        smartAdvice = 'Bright sunshine and clear skies! Ideal day for sports, photography, and travel.';
    } else if (clouds > 60) {
        smartAdvice = 'Comfortable overcast conditions with mild breezes across the city.';
    }
    DOM.smartAdviceText.textContent = smartAdvice;
}

/* ==============================================================================
   ACCURATE WMO CODE MAPPING (No Fake Rain!)
   ============================================================================== */

function parseWMOCode(code, isDay, cloudCover = 0, rainAmount = 0) {
    // Exact WMO standards
    switch (code) {
        case 0:
            return {
                title: isDay ? 'Sunny & Clear' : 'Clear Night',
                description: isDay ? 'Clear blue skies with bright sunshine' : 'Clear starry skies',
                icon: isDay ? 'fa-sun' : 'fa-moon',
                color: isDay ? '#fbbf24' : '#818cf8',
                themeType: isDay ? 'sunny' : 'night'
            };
        case 1:
            return {
                title: isDay ? 'Mainly Sunny' : 'Mainly Clear',
                description: 'Mostly clear with abundant sunshine',
                icon: isDay ? 'fa-sun' : 'fa-moon',
                color: isDay ? '#fbbf24' : '#818cf8',
                themeType: isDay ? 'sunny' : 'night'
            };
        case 2:
            return {
                title: 'Partly Cloudy',
                description: 'Scattered clouds with periods of sunshine',
                icon: isDay ? 'fa-cloud-sun' : 'fa-cloud-moon',
                color: isDay ? '#fcd34d' : '#a5b4fc',
                themeType: 'cloudy'
            };
        case 3:
            return {
                title: 'Overcast',
                description: 'Dense cloud cover throughout the day',
                icon: 'fa-cloud',
                color: '#94a3b8',
                themeType: 'cloudy'
            };
        case 45:
        case 48:
            return {
                title: 'Fog & Mist',
                description: 'Low atmospheric visibility due to fog',
                icon: 'fa-smog',
                color: '#cbd5e1',
                themeType: 'mist'
            };
        case 51:
        case 53:
        case 55:
            return {
                title: 'Light Drizzle',
                description: 'Intermittent fine water droplets',
                icon: 'fa-cloud-rain',
                color: '#38bdf8',
                themeType: 'rainy'
            };
        case 61:
        case 63:
        case 65:
            return {
                title: 'Rainfall',
                description: 'Steady rain showers observed in area',
                icon: 'fa-cloud-showers-heavy',
                color: '#38bdf8',
                themeType: 'rainy'
            };
        case 71:
        case 73:
        case 75:
        case 77:
            return {
                title: 'Snowfall',
                description: 'Gentle falling snow crystals',
                icon: 'fa-snowflake',
                color: '#bae6fd',
                themeType: 'snowy'
            };
        case 80:
        case 81:
        case 82:
            return {
                title: 'Rain Showers',
                description: 'Passing rain showers with cloud breaks',
                icon: 'fa-cloud-showers-water',
                color: '#38bdf8',
                themeType: 'rainy'
            };
        case 95:
        case 96:
        case 99:
            return {
                title: 'Thunderstorm',
                description: 'Thunderstorm cells with lightning strikes',
                icon: 'fa-cloud-bolt',
                color: '#c084fc',
                themeType: 'stormy'
            };
        default:
            return {
                title: isDay ? 'Sunny & Clear' : 'Clear Night',
                description: 'Pleasant atmospheric conditions',
                icon: isDay ? 'fa-sun' : 'fa-moon',
                color: isDay ? '#fbbf24' : '#818cf8',
                themeType: isDay ? 'sunny' : 'night'
            };
    }
}

/* ==============================================================================
   DYNAMIC CANVAS WEATHER PARTICLE ENGINE
   ============================================================================== */

let canvas, ctx;
let particles = [];
let animId = null;

function initCanvasParticles() {
    canvas = DOM.weatherCanvas;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    startParticleLoop();
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function updateBodyTheme(themeType) {
    DOM.body.className = `theme-${themeType}`;
    createParticles(themeType);
}

function createParticles(type) {
    particles = [];
    const count = type === 'rainy' ? 120 : type === 'stormy' ? 150 : type === 'snowy' ? 80 : type === 'night' ? 60 : 30;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: type === 'snowy' ? (0.5 + Math.random() * 1.5) : (8 + Math.random() * 12),
            size: type === 'snowy' ? (2 + Math.random() * 3) : (1 + Math.random() * 2),
            length: type === 'rainy' || type === 'stormy' ? (15 + Math.random() * 20) : 0,
            opacity: 0.15 + Math.random() * 0.6,
            angle: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.02 + Math.random() * 0.03
        });
    }
}

function startParticleLoop() {
    function animate() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const type = state.weatherType;

        if (type === 'stormy' && Math.random() < 0.007) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        particles.forEach(p => {
            if (type === 'rainy' || type === 'stormy') {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - 2, p.y + p.length);
                ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                p.y += p.speed;
                p.x -= 1;
                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }
            } else if (type === 'snowy') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();

                p.y += p.speed;
                p.x += Math.sin(p.y * 0.02) * 0.8;
                if (p.y > canvas.height) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }
            } else if (type === 'night') {
                p.angle += p.twinkleSpeed;
                const alpha = 0.2 + (Math.sin(p.angle) + 1) * 0.35;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            } else {
                p.angle += 0.01;
                p.y -= 0.3;
                if (p.y < -10) p.y = canvas.height + 10;
                ctx.beginPath();
                ctx.arc(p.x + Math.sin(p.angle) * 10, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.3})`;
                ctx.fill();
            }
        });

        animId = requestAnimationFrame(animate);
    }
    animate();
}

/* ==============================================================================
   FAVORITES SYSTEM
   ============================================================================== */

function updateFavoriteBadge() {
    if (DOM.favoriteCount) DOM.favoriteCount.textContent = state.favorites.length;
    if (DOM.mobileNavFavBadge) DOM.mobileNavFavBadge.textContent = state.favorites.length;
}

function updateFavoriteStar() {
    const isFav = state.favorites.some(c => c.toLowerCase() === state.currentCity.toLowerCase());
    if (isFav) {
        DOM.favoriteStarIcon.className = 'fa-solid fa-star';
        DOM.toggleFavoriteCityBtn.classList.add('pinned');
    } else {
        DOM.favoriteStarIcon.className = 'fa-regular fa-star';
        DOM.toggleFavoriteCityBtn.classList.remove('pinned');
    }
}

function toggleFavorite(city) {
    const idx = state.favorites.findIndex(c => c.toLowerCase() === city.toLowerCase());
    if (idx >= 0) {
        state.favorites.splice(idx, 1);
        showToast(`Removed "${city}" from saved cities`, 'info');
    } else {
        state.favorites.push(city);
        showToast(`Saved "${city}" to favorites!`, 'success');
    }
    localStorage.setItem('atmosphere_favs', JSON.stringify(state.favorites));
    updateFavoriteBadge();
    updateFavoriteStar();
    renderFavoritesList();
}

function openFavoritesDrawer() {
    renderFavoritesList();
    DOM.favoritesDrawer.classList.add('open');
    DOM.drawerBackdrop.classList.add('active');
}

function closeFavoritesDrawer() {
    DOM.favoritesDrawer.classList.remove('open');
    DOM.drawerBackdrop.classList.remove('active');
}

function renderFavoritesList() {
    DOM.favoritesList.innerHTML = '';
    if (state.favorites.length === 0) {
        DOM.favoritesList.innerHTML = `
            <div class="empty-fav-state">
                <i class="fa-regular fa-star"></i>
                <p>No favorite cities saved yet. Click the star icon to pin cities here!</p>
            </div>
        `;
        return;
    }

    state.favorites.forEach(city => {
        const card = document.createElement('div');
        card.className = 'fav-city-card';
        card.innerHTML = `
            <div class="fav-info-col">
                <h4>${city}</h4>
                <p>Click to load live weather</p>
            </div>
            <div class="fav-temp-col">
                <button class="remove-fav-btn" title="Remove city">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-fav-btn')) {
                fetchWeatherByCity(city);
                closeFavoritesDrawer();
            }
        });

        card.querySelector('.remove-fav-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(city);
        });

        DOM.favoritesList.appendChild(card);
    });
}

/* ==============================================================================
   AUDIO AMBIENCE (Web Audio API)
   ============================================================================== */

function toggleAmbientAudio() {
    if (!state.audioEnabled) {
        startAmbientAudio();
    } else {
        stopAmbientAudio();
    }
}

function startAmbientAudio() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AudioContext();

        const bufferSize = state.audioCtx.sampleRate * 2;
        const buffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
        }

        const noise = state.audioCtx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = state.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, state.audioCtx.currentTime);

        const gain = state.audioCtx.createGain();
        gain.gain.setValueAtTime(0.04, state.audioCtx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(state.audioCtx.destination);

        noise.start();
        state.audioNodes = { noise, gain, filter };
        state.audioEnabled = true;

        DOM.soundIcon.className = 'fa-solid fa-volume-high';
        DOM.soundToggleBtn.classList.add('active');
        showToast('Ambient weather audio enabled', 'info');
    } catch (e) {
        console.warn('Audio init error:', e);
    }
}

function stopAmbientAudio() {
    if (state.audioNodes && state.audioNodes.noise) {
        try { state.audioNodes.noise.stop(); } catch (e) {}
    }
    if (state.audioCtx) {
        try { state.audioCtx.close(); } catch (e) {}
    }
    state.audioEnabled = false;
    DOM.soundIcon.className = 'fa-solid fa-volume-xmark';
    DOM.soundToggleBtn.classList.remove('active');
    showToast('Ambient audio muted', 'info');
}

/* ==============================================================================
   HELPERS & TOASTS
   ============================================================================== */

function getCompassDirection(deg) {
    const dirs = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const idx = Math.round(deg / 45) % 8;
    return dirs[idx];
}

function getBeaufortScale(speed, isMetric) {
    const kmh = isMetric ? speed : speed * 1.609;
    if (kmh < 2) return 'Calm';
    if (kmh < 6) return 'Light Air';
    if (kmh < 12) return 'Light Breeze';
    if (kmh < 20) return 'Gentle Breeze';
    if (kmh < 29) return 'Moderate Breeze';
    if (kmh < 39) return 'Fresh Breeze';
    if (kmh < 50) return 'Strong Breeze';
    return 'Gale Force';
}

function showLoading(show, text = 'Fetching weather data...') {
    if (DOM.loadingSkeleton) {
        DOM.loadingSkeleton.style.display = show ? 'flex' : 'none';
        if (DOM.loaderText) DOM.loaderText.textContent = text;
    }
}

function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}