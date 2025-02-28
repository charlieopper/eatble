import React, { useState, useEffect } from 'react';
import { Search, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';
import { isValidZipCode, isValidCity } from '../../utils/validation';
import { loadGoogleMaps } from '../../utils/loadGoogleMaps';

export default function LocationSearch({ onLocationSelect }) {
  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchType, setSearchType] = useState('city'); // 'city' or 'zip'

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        initializeAutocomplete();
      })
      .catch(error => {
        console.error('Error loading Google Maps:', error);
        toast.error('Error loading location search');
      });
  }, []);

  const initializeAutocomplete = () => {
    const autocomplete = new window.google.maps.places.AutocompleteService();
    // Store autocomplete instance if needed
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (!value.trim()) {
      setPredictions([]);
      return;
    }

    // Detect if input is likely a zip code
    if (/^\d+$/.test(value)) {
      setSearchType('zip');
      if (isValidZipCode(value)) {
        handleZipCodeSearch(value);
      }
    } else {
      setSearchType('city');
      handleCitySearch(value);
    }
  };

  const handleZipCodeSearch = async (zipCode) => {
    setIsLoading(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ address: zipCode });
      
      if (result.results[0]) {
        setPredictions([{
          description: result.results[0].formatted_address,
          place_id: result.results[0].place_id,
          geometry: result.results[0].geometry.location
        }]);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('Zip code search error:', error);
      toast.error('Error searching zip code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySearch = async (value) => {
    setIsLoading(true);
    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const results = await autocompleteService.getPlacePredictions({
        input: value,
        types: ['(cities)'],
        componentRestrictions: { country: 'us' }
      });
      
      setPredictions(results.predictions || []);
    } catch (error) {
      console.error('City search error:', error);
      toast.error('Error searching cities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (prediction) => {
    setSearchInput(prediction.description);
    setPredictions([]);
    onLocationSelect(prediction);
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geocoder = new window.google.maps.Geocoder();
          
          const result = await geocoder.geocode({
            location: { lat: latitude, lng: longitude }
          });

          if (result.results[0]) {
            const locationData = {
              description: result.results[0].formatted_address,
              place_id: result.results[0].place_id,
              geometry: result.results[0].geometry.location,
            };
            
            setSearchInput(locationData.description);
            onLocationSelect(locationData);
          } else {
            toast.error('No address found for your location');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          toast.error('Error getting your location');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Error getting your location. Please check your permissions.');
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            placeholder="Enter city or zip code"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Crosshair size={20} />
          {isGettingLocation ? 'Getting location...' : 'Current Location'}
        </button>
      </div>

      {/* Predictions dropdown */}
      {predictions.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handleLocationSelect(prediction)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              {prediction.description}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
} 