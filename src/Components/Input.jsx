import React, { useState } from 'react';
import { UilSearch, UilLocationPoint, UilStar } from '@iconscout/react-unicons';
import axios from 'axios';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Input({ setQuery, units, setUnits }) {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || []);

  const handleSearchClick = () => {
    if (city !== '') {
      setQuery({ q: city });
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setQuery({ lat, lon });
      });
    }
  };

  const handleUnitsChange = (e) => {
    const selectedUnit = e.currentTarget.name;
    if (units !== selectedUnit) {
      setUnits(selectedUnit);
    }
  };

  const handleInputChange = (e) => {
    const value = e.currentTarget.value;
    setCity(value);
  
    axios
      .get(`https://nominatim.openstreetmap.org/search?q=${value}&format=json&limit=5`)
      .then((response) => {
        const suggestions = response.data.map((result) => {
          const cityName = result.display_name.split(',')[0];
          const isFavorite = favorites.includes(cityName);
          return { cityName, isFavorite, lat: result.lat, lon: result.lon }; // add lat and lon to suggestion object
        });
        setSuggestions(suggestions);
      })
      .catch((error) => {
        console.log(error);
        setSuggestions([]);
      });
  };
  
  const handleSuggestionClick = (suggestion) => {
    setQuery({ lat: suggestion.lat, lon: suggestion.lon }); // set lat and lon from suggestion object
    setCity(suggestion.cityName);
    setSuggestions([]);
  
    handleFavoriteClick(suggestion.isFavorite); // pass isFavorite to handleFavoriteClick
  };
  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleFavoriteClick = () => {
    if (city) {
      if (!favorites.includes(city)) {
        setFavorites([...favorites, city]);
        localStorage.setItem('favorites', JSON.stringify([...favorites, city]));
        // console.log(favorites);
        toast.success(`${city} added to favorites.`, {
          autoClose: 1500,
          theme: 'colored',
          newestOnTop: true,
        });
        // console.log(favorites);
      } else {
        handleRemoveFavoriteClick(city);
      }
    } else {
      toast.error(`Can't find a city to add to favorites.`, {
        autoClose: 1500,
        theme: 'colored',
        newestOnTop: true,
      });
    }
  };
  ;

  // console.log(favorites);

  const handleRemoveFavoriteClick = (cityToRemove) => {
    const newFavorites = favorites.filter((city) => city !== cityToRemove);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    toast.success(`${city} removed from favorites.`, {
      autoClose: 1500,
      theme: 'colored',
      newestOnTop: true,
      style: { background: 'orange', color: 'white' }
    });
  };

  return (
    <div className="flex flex-row justify-center my-6 mt-14">
      <div className="flex flex-row w-3/4 items-center justify-center space-x-4">
        <img src="https://user-images.githubusercontent.com/48355572/228884054-f988bc51-1536-49d7-a38b-938bcc8f7a3e.png" alt="logo" className="w-12" />
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="🔍 Search Cities..."
          className="text-xl font-light p-2 w-full shadow-xl focus:outline-none capitalize rounded-md"
        />
        <UilSearch
          onClick={handleSearchClick}
          size={25}
          className="text-white cursor-pointer transition ease-out hover:scale-125"
        />
        <UilLocationPoint
          onClick={handleLocationClick}
          size={25}
          className="text-white cursor-pointer transition ease-out hover:scale-125"
        />
        <UilStar
          onClick={handleFavoriteClick}
          size={25}
          className={`text-white cursor-pointer transition ease-out hover:scale-125 ${favorites.includes(city) ? 'text-yellow-400' : ''}`}
        />
      </div>
      <div className="flex flex-row w-1/4 items-center justify-center">
        <button
          onClick={handleUnitsChange}
          name="metric"
          className="text-xl text-white font-light transition ease-out hover:scale-125"
        >
          °C
        </button>
        <p className="text-xl text-white mx-1">|</p>
        <button
          onClick={handleUnitsChange}
          name="imperial"
          className="text-xl text-white font-light transition ease-out hover:scale-125"
        >
          °F
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-1/3 lg:left-48 mt-12 rounded-md shadow-xl bg-white">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.cityName}
              className="px-2 py-1 hover:bg-gray-300 cursor-pointer flex items-center justify-between"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span>{suggestion.cityName}</span>
              {suggestion.isFavorite && (
                <UilStar size={18} className="text-yellow-400" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Input;
