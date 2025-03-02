import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, InfoWindow } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

// Map container styles
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '8px',
};

// Default center (San Francisco)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

// Map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

// Custom marker styles
const markerStyle = {
  position: 'absolute',
  width: '20px',
  height: '20px',
  backgroundColor: '#ef4444',
  border: '2px solid white',
  borderRadius: '50%',
  transform: 'translate(-50%, -50%)',
  cursor: 'pointer',
  zIndex: 1
};

const MapView = ({ restaurants, onSelectRestaurant, center = defaultCenter }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef();
  const markersRef = useRef([]);
  const [mapCenter, setMapCenter] = useState(center);

  // Store map instance when it loads
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    console.log('Map loaded successfully');
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback((restaurant) => {
    console.log('Marker clicked:', restaurant);
    setSelectedMarker(restaurant);
  }, []);

  // Handle info window close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // Handle view details click
  const handleViewDetails = useCallback(() => {
    if (selectedMarker && onSelectRestaurant) {
      onSelectRestaurant(selectedMarker);
      setSelectedMarker(null);
    }
  }, [selectedMarker, onSelectRestaurant]);

  // Create custom HTML markers
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Clear previous markers
    markersRef.current.forEach(marker => {
      if (marker.element && marker.element.parentNode) {
        marker.element.parentNode.removeChild(marker.element);
      }
    });
    markersRef.current = [];

    // Create new markers
    const mapDiv = mapRef.current.getDiv();
    const overlay = new window.google.maps.OverlayView();
    overlay.setMap(mapRef.current);
    
    overlay.onAdd = function() {
      const panes = this.getPanes();
      
      restaurants.forEach(restaurant => {
        if (!restaurant.lat || !restaurant.lng) return;
        
        const markerElement = document.createElement('div');
        markerElement.style.position = 'absolute';
        markerElement.style.width = '20px';
        markerElement.style.height = '20px';
        markerElement.style.backgroundColor = restaurant.eatableReview?.rating >= 4.5 ? '#1e40af' : '#ef4444';
        markerElement.style.border = '2px solid white';
        markerElement.style.borderRadius = '50%';
        markerElement.style.transform = 'translate(-50%, -50%)';
        markerElement.style.cursor = 'pointer';
        markerElement.style.zIndex = '1';
        
        markerElement.addEventListener('click', () => {
          handleMarkerClick(restaurant);
        });
        
        panes.overlayMouseTarget.appendChild(markerElement);
        
        markersRef.current.push({
          element: markerElement,
          position: new window.google.maps.LatLng(restaurant.lat, restaurant.lng),
          restaurant
        });
      });
    };
    
    overlay.draw = function() {
      const projection = this.getProjection();
      
      markersRef.current.forEach(marker => {
        const position = projection.fromLatLngToDivPixel(marker.position);
        
        marker.element.style.left = position.x + 'px';
        marker.element.style.top = position.y + 'px';
      });
    };
    
    // Add the overlay
    overlay.setMap(mapRef.current);
    
    return () => {
      overlay.setMap(null);
      markersRef.current.forEach(marker => {
        if (marker.element && marker.element.parentNode) {
          marker.element.parentNode.removeChild(marker.element);
        }
      });
    };
  }, [restaurants, isLoaded, handleMarkerClick]);

  // Fit bounds to show all markers
  useEffect(() => {
    if (!isLoaded || !mapRef.current || restaurants.length === 0) return;
    
    console.log('Adjusting map bounds to fit all restaurants:', restaurants);
    
    const bounds = new window.google.maps.LatLngBounds();
    restaurants.forEach(restaurant => {
      if (restaurant.lat && restaurant.lng) {
        bounds.extend({
          lat: restaurant.lat,
          lng: restaurant.lng
        });
      }
    });
    
    // Only adjust bounds if we have valid coordinates
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
      
      // If we only have one marker, zoom out a bit
      if (restaurants.length === 1) {
        window.google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
          mapRef.current.setZoom(Math.min(15, mapRef.current.getZoom()));
        });
      }
    }
  }, [restaurants, isLoaded]);

  // Show loading state
  if (loadError) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        color: '#ef4444'
      }}>
        <div>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Error loading maps</p>
          <p>Please check your internet connection and try again</p>
          <p style={{ fontSize: '12px', marginTop: '10px', color: '#6b7280' }}>
            Error details: {loadError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(0, 0, 0, 0.1)', 
          borderLeftColor: '#3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  console.log('Rendering map with restaurants:', restaurants);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={13}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {/* Debug info */}
        {restaurants.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'white',
            padding: '5px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 1000,
            fontSize: '12px'
          }}>
            No restaurants to display
          </div>
        )}

        {/* Info Window for selected marker */}
        {selectedMarker && (
          <InfoWindow
            position={{
              lat: selectedMarker.lat,
              lng: selectedMarker.lng
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div style={{ 
              padding: '5px', 
              maxWidth: '250px',
              fontFamily: 'Arial, sans-serif'
            }}>
              <h3 style={{ 
                margin: '0 0 5px 0', 
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {selectedMarker.name}
              </h3>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                <div style={{ 
                  backgroundColor: '#1e40af', 
                  color: 'white', 
                  borderRadius: '4px', 
                  padding: '2px 6px',
                  marginRight: '8px',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}>
                  {selectedMarker.eatableReview?.rating || 'N/A'}
                </div>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>
                  {selectedMarker.eatableReview?.reviewCount || 0} reviews
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '4px',
                marginBottom: '8px'
              }}>
                {selectedMarker.cuisines?.map((cuisine, index) => (
                  <span key={index} style={{ 
                    backgroundColor: '#f3f4f6', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {cuisine}
                  </span>
                ))}
              </div>
              
              <button 
                onClick={handleViewDetails}
                style={{
                  backgroundColor: '#1e40af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: 'bold'
                }}
              >
                View Details
              </button>
            </div>
          </InfoWindow>
        )}

        {/* Debug panel */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontSize: '12px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <strong>Debug: Restaurant Coordinates</strong>
          <ul style={{ margin: '5px 0', padding: '0 0 0 20px' }}>
            {restaurants.map((r, i) => (
              <li key={i}>
                {r.name}: {r.lat.toFixed(6)}, {r.lng.toFixed(6)}
              </li>
            ))}
          </ul>
        </div>
      </GoogleMap>
    </div>
  );
};

export default MapView; 