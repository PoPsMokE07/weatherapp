import { useEffect, useState } from 'react';
import './App.css';
import Forecast from './Components/Forecast';
import Input from './Components/Input';
import TemperatureandDetails from './Components/Temperaturedetails';
import Timeandlocation from './Components/Timeandlocation';
import getFormattedWeatherData from './Services/weatherservice';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [query, setQuery] = useState({ q: "kolkata" });
  const [units, setUnits] = useState("metric");
  const [weather, setWeather] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      await getFormattedWeatherData({ ...query, units }).then((data) => {
        toast.success(
          `Weather successfully updated for ${data.name}, ${data.country}.`
        );

        setWeather(data);
      });
    };

    fetchWeather();
  }, [query, units]);

  const formatBackground = () => {
    if (!weather) return "from-blue-500 to-fuchsia-500";
    const threshold = units === "metric" ? 20 : 40;
    if (weather.temp <= threshold) return "from-blue-500 to-fuchsia-500";

    return "from-blue-800 to-gray-700";
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", !darkMode);
  }

  useEffect(() => {
    const currentTheme = localStorage.getItem("darkMode");
    if (currentTheme === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    } else {
      setDarkMode(false);
      document.body.classList.remove("dark-mode");
    }
  }, []);

  return (
    <div>
      <div
        className={`mx-auto my-auto max-w-full pt-4 px-32 bg-gradient-to-br ${darkMode ? 'from-gray-900 to-gray-700' : 'from-violet-800 to-blue-500'} ${formatBackground()}`}
      >
        <div className="absolute justify-end mb-2 ml-auto lg:right-32 lg:top-20">
          <span
            role="img"
            aria-label="toggle dark mode"
            className={`cursor-pointer ${darkMode ? 'text-gray-400' : 'text-yellow-400'} text-2xl`}
            onClick={toggleDarkMode}
          >
            {darkMode ? "🌙" : "☀️"}
          </span>
        </div>

        <Input setQuery={setQuery} units={units} setUnits={setUnits} />

        {weather && (
          <div>
            <Timeandlocation weather={weather} />
            <TemperatureandDetails weather={weather} />

            <Forecast title="hourly forecast" items={weather.hourly} />
            <br />
            <Forecast title="daily forecast" items={weather.daily} />
            <br />
          </div>
        )}

        <ToastContainer autoClose={1500} theme="colored" newestOnTop={true} />
      </div>
    </div>
  );
}

export default App;
