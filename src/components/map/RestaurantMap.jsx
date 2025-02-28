import React, { useEffect, useRef } from 'react';

export default function RestaurantMap({ restaurants, selectedLocation, onRestaurantClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Helper function to get lat/lng values regardless of format
  const getLatLng = (location) => {
    if (!location) return null;
    
    const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
    const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
    
    return { lat, lng };
  };

  // Initialize map
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // NYC default
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: selectedLocation?.geometry?.location 
        ? getLatLng(selectedLocation.geometry.location) 
        : defaultCenter,
      zoom: 13,
      mapTypeControl: false,
    });

    // Add location marker if available
    if (selectedLocation?.geometry?.location) {
      new window.google.maps.Marker({
        position: getLatLng(selectedLocation.geometry.location),
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 0.8,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
        },
        title: 'Your location',
      });
    }
  }, [selectedLocation]);

  // Add restaurant markers
  useEffect(() => {
    if (!window.google || !mapInstanceRef.current || !restaurants.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    restaurants.forEach(restaurant => {
      if (!restaurant.geometry?.location) return;
      
      const position = getLatLng(restaurant.geometry.location);
      
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: restaurant.name,
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        if (onRestaurantClick) {
          onRestaurantClick(restaurant);
          marker.setAnimation(window.google.maps.Animation.BOUNCE);
          setTimeout(() => marker.setAnimation(null), 1500);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      if (selectedLocation?.geometry?.location) {
        bounds.extend(getLatLng(selectedLocation.geometry.location));
      }
      
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [restaurants, onRestaurantClick]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg shadow-md"
      style={{ minHeight: '400px' }}
    />
  );
} 