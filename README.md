# Atmosphere — Next-Gen Weather Intelligence Dashboard ⛅⚡

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg?style=for-the-badge)](https://sachin-web-portfolio.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Glassmorphism](https://img.shields.io/badge/UI-Glassmorphism-9cf.svg?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/CSS)

> An ultra-modern, high-precision weather forecast dashboard crafted with vanilla web technologies, dynamic HTML5 Canvas particle physics, and real-time European ECMWF / Open-Meteo satellite & radar intelligence.

---

## ✨ Features & Highlights

- 🎨 **Apple-Grade Glassmorphism UI**: Dynamic ambient theme glows that seamlessly adapt to live atmospheric conditions (Sunny Amber, Rainy Azure, Stormy Violet, Snowy Frost, Night Indigo, Cloudy Slate).
- 🌧️ **Interactive Particle Canvas Engine**: Real-time canvas physics rendering drifting snow, raindrop streaks, thunderstorm lightning flashes, and twinkling starfields.
- 🎯 **High-Precision Meteorological Accuracy**: Zero false rain reports — uses satellite radar models with exact precipitation verification, accurate WMO weather code mapping, and global geolocation.
- 📈 **24-Hour Interactive Hourly Temperature Spline**: Smooth HTML5 Canvas 2D bezier curve chart tracking hourly temperature progression and precipitation probability.
- 📅 **5-Day Extended Outlook**: Daily breakdown cards with min-max temperature range progress bars and weather condition badges.
- 🍃 **Air Quality Index (AQI)**: Real-time air health index with color-coded safety badges and particulate breakdown ($PM_{2.5}$, $PM_{10}$, $NO_2$, $O_3$).
- ☀️ **UV Index & Sun Protection**: Solar radiation gauge with real-time health advice and protective recommendations.
- 🧭 **360° Visual Wind Compass**: Live rotating compass dial displaying wind heading, speed ($km/h$ & $mph$), and Beaufort scale ratings.
- 🌅 **Daylight Solar Arc**: SVG solar progression curve visualizer tracking the sun from Sunrise to Sunset.
- 🏃 **Lifestyle & Health Advisories**: Smart recommendations for outdoor workouts, umbrella necessity, driving road safety, and pollen risk.
- 🔍 **Live Search Autocomplete**: Instant city suggestion dropdown with support for global and local cities.
- 📍 **GPS Geolocation**: 1-click current location weather detection.
- 🔄 **Unit Converter**: Instant toggle between Celsius ($°C$) and Fahrenheit ($°F$).
- 📌 **Saved Favorite Cities**: Bookmark cities with `localStorage` persistence and slide-out side drawer.
- 🎧 **Ambient Audio Synthesizer**: Procedural soothing rain & wind noise generator built with the Web Audio API.

---

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla JavaScript (ES6+ Modules & Async/Await)
- **Styling**: Vanilla CSS3 (Custom Properties, Backdrop Filters, Flexbox & Grid Systems, CSS Keyframe Animations)
- **Visuals & Charts**: HTML5 Canvas 2D Context, SVG Vector Graphics
- **Sound**: Web Audio API (Procedural Noise Synthesis)
- **APIs**:
  - Open-Meteo Satellite & Radar Forecast API
  - Open-Meteo High-Resolution Geocoding API
  - Open-Meteo Air Quality & Pollution API
  - OpenWeatherMap API (Secondary Fallback Layer)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/sachinkr2007/Weather-Application.git
cd Weather-Application
```

### 2. Run locally
You can open `index.html` directly in any web browser, or serve it locally using any static file server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js npx
npx serve .
```

Open `http://localhost:3000` in your browser.

---

## 👨‍💻 Developer & Credits

**Design and Developed by Sachin Kumar**
- 🌐 **Portfolio**: [https://sachin-web-portfolio.netlify.app/](https://sachin-web-portfolio.netlify.app/)
- 🐙 **GitHub**: [@sachinkr2007](https://github.com/sachinkr2007)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
