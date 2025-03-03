import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadGoogleMapsAPI } from '../../utils/googleMaps';

const Map = ({ restaurants, userLocation, height = '400px' }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const navigateRef = useRef();

  // Update the useEffect to store navigate in the ref instead of window
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  // Load Google Maps API and initialize the map
  useEffect(() => {
    if (!mapRef.current) return;
    
    setIsLoading(true);
    
    loadGoogleMapsAPI()
      .then(googleMaps => {
        const center = userLocation || { lat: 37.7749, lng: -122.4194 }; // Default to SF
        
        const mapInstance = new googleMaps.Map(mapRef.current, {
          center,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_ID || 'DEFAULT_MAP_ID' // Added Map ID to fix the error
        });
        
        setMap(mapInstance);
        setIsLoading(false);
        
        // Add user location marker if available
        if (userLocation) {
          new googleMaps.Marker({
            position: userLocation,
            map: mapInstance,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            },
            title: 'Your Location'
          });
        }
      })
      .catch(error => {
        console.error('Error loading Google Maps:', error);
        setMapError('Failed to load Google Maps. Please check your internet connection and refresh the page.');
        setIsLoading(false);
      });
    
    return () => {
      console.log('Cleaning up markers');
      markers.forEach(marker => {
        if (marker) {
          console.log('Removing marker and listeners');
          // Remove event listeners
          if (marker.listeners) {
            marker.listeners.forEach(listener => {
              window.google.maps.event.removeListener(listener);
            });
          }
          // Remove marker from map
          marker.setMap(null);
        }
      });
    };
  }, [userLocation]);
  
  // Update markers when restaurants change
  useEffect(() => {
    if (!map || !restaurants || !restaurants.length) return;
    if (!window.google || !window.google.maps) return;
    
    try {
      // Clear existing markers
      markers.forEach(marker => {
        if (marker) marker.setMap(null);
      });
      
      const newMarkers = [];
      
      // Create custom marker icon with a red pin
      const createCustomMarker = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 36;
        
        const ctx = canvas.getContext('2d');
        
        // Draw pin shape
        ctx.beginPath();
        // Draw the pin head (circle)
        ctx.arc(12, 12, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#e53935'; // Red color
        ctx.fill();
        
        // Draw the pin needle
        ctx.beginPath();
        ctx.moveTo(12, 12);
        ctx.lineTo(12, 34);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#c62828'; // Darker red for the needle
        ctx.stroke();
        
        // Add a small highlight to the pin head
        ctx.beginPath();
        ctx.arc(9, 9, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Semi-transparent white
        ctx.fill();
        
        return canvas.toDataURL();
      };
      
      // Add restaurant markers with simple click navigation
      restaurants.forEach((restaurant) => {
        if (!restaurant) return;
        
        // Get coordinates from restaurant
        let position;
        
        if (restaurant.geometry && restaurant.geometry.location) {
          // Handle Google Places API format
          if (typeof restaurant.geometry.location.lat === 'function') {
            position = {
              lat: restaurant.geometry.location.lat(),
              lng: restaurant.geometry.location.lng()
            };
          } else {
            position = {
              lat: restaurant.geometry.location.lat,
              lng: restaurant.geometry.location.lng
            };
          }
        } else if (restaurant.lat && restaurant.lng) {
          // Handle our custom format
          position = {
            lat: parseFloat(restaurant.lat),
            lng: parseFloat(restaurant.lng)
          };
        } else {
          console.error('No valid coordinates for restaurant:', restaurant.name);
          return;
        }
        
        // Validate coordinates
        if (isNaN(position.lat) || isNaN(position.lng)) {
          console.error('Invalid coordinates for restaurant:', restaurant.name, position);
          return;
        }
        
        // Create simple marker with only click functionality
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: restaurant.name,
          icon: {
            url: createCustomMarker(),
            scaledSize: new window.google.maps.Size(24, 36),
            anchor: new window.google.maps.Point(12, 36)
          },
          zIndex: 1
        });
        
        // Simple click handler with direct navigation
        marker.addListener('click', () => {
          const restaurantId = restaurant.id || restaurant.place_id;
          // Use window.location directly instead of React Router
          window.location.assign(`/restaurant/${restaurantId}`);
        });
        
        newMarkers.push(marker);
      });
      
      setMarkers(newMarkers);
      
      // Fit bounds to include all markers if we have restaurants
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        
        // Add user location to bounds if available
        if (userLocation) {
          bounds.extend(userLocation);
        }
        
        // Add all restaurant markers to bounds
        newMarkers.forEach(marker => {
          if (marker && marker.getPosition) {
            bounds.extend(marker.getPosition());
          }
        });
        
        map.fitBounds(bounds);
        
        // Don't zoom in too far
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom() > 16) map.setZoom(16);
          window.google.maps.event.removeListener(listener);
        });
      }
    } catch (error) {
      console.error('Error updating markers:', error);
      setMapError('Error displaying restaurant markers. Please refresh the page.');
    }
  }, [map, restaurants]);

  // At the top of the component, add this event handler setup
  useEffect(() => {
    // Create a custom event handler for restaurant navigation
    const handleRestaurantNavigation = (event) => {
      const { restaurantId } = event.detail;
      if (restaurantId && navigate) {
        navigate(`/restaurant/${restaurantId}`);
      }
    };

    // Add the event listener
    window.addEventListener('navigateToRestaurant', handleRestaurantNavigation);

    // Cleanup
    return () => {
      window.removeEventListener('navigateToRestaurant', handleRestaurantNavigation);
    };
  }, [navigate]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height, 
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'relative'
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 10
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #0d9488',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              margin: '0 auto 8px auto',
              animation: 'spin 1s linear infinite'
            }} />
            <div>Loading map...</div>
          </div>
        </div>
      )}
      
      {mapError && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '8px'
        }}>
          <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '8px' }}>
            Map Error
          </div>
          <div style={{ marginBottom: '16px' }}>
            {mapError}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#0d9488',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      )}
      
      {/* Add a small attribution for Google Maps */}
      <div style={{
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '2px 5px',
        borderRadius: '3px',
        fontSize: '10px',
        zIndex: 5
      }}>
        ©Google Maps
      </div>
    </div>
  );
};

export default Map; 