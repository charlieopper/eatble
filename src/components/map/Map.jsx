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
          fullscreenControl: false
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
      // Clean up markers when component unmounts
      markers.forEach(marker => {
        if (marker) marker.setMap(null);
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
      
      // Create info window for hover previews
      const infoWindow = new window.google.maps.InfoWindow();
      
      // Create a variable to track if we're hovering over the info window
      let isHoveringInfoWindow = false;
      
      // Add restaurant markers
      restaurants.forEach((restaurant, index) => {
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
        
        // Create marker
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
        
        // Create the content for the info window
        const infoWindowContent = createInfoWindowContent(restaurant);
        
        // Add hover handler to show preview
        marker.addListener('mouseover', () => {
          infoWindow.setContent(infoWindowContent);
          infoWindow.open(map, marker);
          
          // Add mouseout event listener to the info window DOM element
          setTimeout(() => {
            const infoWindowElement = document.querySelector('.gm-style-iw-a');
            if (infoWindowElement) {
              infoWindowElement.addEventListener('mouseover', () => {
                isHoveringInfoWindow = true;
              });
              
              infoWindowElement.addEventListener('mouseout', () => {
                isHoveringInfoWindow = false;
                // Give a small delay before closing to allow moving between pin and info window
                setTimeout(() => {
                  if (!isHoveringInfoWindow) {
                    infoWindow.close();
                  }
                }, 300);
              });
            }
          }, 100); // Small delay to ensure the DOM element is available
        });
        
        // Close info window when mouse leaves the marker (but not if hovering info window)
        marker.addListener('mouseout', () => {
          // Give a small delay before closing to allow moving between pin and info window
          setTimeout(() => {
            if (!isHoveringInfoWindow) {
              infoWindow.close();
            }
          }, 300);
        });
        
        // Add click handler to navigate to restaurant details
        marker.addListener('click', () => {
          navigate(`/restaurant/${restaurant.id || restaurant.place_id}`);
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
  }, [map, restaurants, navigate]);

  // Helper function to create info window content
  const createInfoWindowContent = (restaurant) => {
    if (!restaurant) return '';
    
    try {
      const { name, cuisines, eatableReview, googleReview, allergens, accommodations, image, photos } = restaurant;
      
      // Get image URL (try different possible sources)
      let imageUrl = image;
      if (!imageUrl && photos && photos.length > 0) {
        // If using Google Photos object
        if (typeof photos[0].getUrl === 'function') {
          imageUrl = photos[0].getUrl();
        } else if (photos[0].url) {
          imageUrl = photos[0].url;
        } else {
          imageUrl = photos[0];
        }
      }
      // Fallback to a placeholder if no image is available
      if (!imageUrl) {
        imageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGludGVyaW9yfGVufDB8fDB8fHww&w=1000&q=80";
      }
      
      // Format cuisines
      const cuisineText = Array.isArray(cuisines) ? cuisines.join(', ') : '';
      
      // Format ratings
      const eatableRating = eatableReview?.rating || restaurant.eatableRating || 0;
      const googleRating = googleReview?.rating || restaurant.rating || 0;
      
      // Create more compact allergen tags HTML
      const allergenTags = allergens && allergens.length > 0 
        ? allergens.slice(0, 3).map(allergen => { // Limit to 3 allergens to save space
            if (!allergen) return '';
            
            const allergenName = typeof allergen === 'string' ? allergen : allergen.name;
            const allergenIcon = typeof allergen === 'string' ? '' : allergen.icon;
            const ratingHtml = allergen.rating 
              ? `<span style="margin-left:2px;background-color:#0d9488;color:white;border-radius:50%;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;">${allergen.rating.average}</span>` 
              : '';
            
            return `
              <span style="display:inline-flex;align-items:center;padding:2px 6px;background-color:#ccfbf1;border:1px solid #99f6e4;border-radius:9999px;font-size:11px;color:#0d9488;margin-right:3px;margin-bottom:3px;">
                ${allergenIcon ? `<span style="margin-right:2px;">${allergenIcon}</span>` : ''}
                ${allergenName}
                ${ratingHtml}
              </span>
            `;
          }).join('') 
        : '';
      
      // Create more compact accommodations HTML
      const accommodationsHtml = `
        <div style="display:flex;margin-top:4px;margin-bottom:4px;">
          ${accommodations?.chefAvailable ? 
            `<div style="display:flex;align-items:center;font-size:11px;color:#0d9488;margin-right:8px;">
              <span style="margin-right:2px;">👨‍🍳</span> Chef available
            </div>` : ''}
          ${accommodations?.allergenMenu ? 
            `<div style="display:flex;align-items:center;font-size:11px;color:#0d9488;">
              <span style="margin-right:2px;">📋</span> Allergen menu
            </div>` : ''}
        </div>
      `;
      
      // Create the HTML content for the info window with optimized layout
      return `
        <div style="width:250px;padding:8px;font-family:Arial,sans-serif;">
          <div style="display:flex;margin-bottom:4px;align-items:center;justify-content:space-between;">
            <!-- Restaurant Info -->
            <div style="flex:1;max-width:170px;">
              <div style="font-weight:bold;font-size:15px;margin-bottom:2px;line-height:1.2;">${name}</div>
              ${cuisineText ? `<div style="font-size:11px;color:#6b7280;margin-bottom:2px;">${cuisineText}</div>` : ''}
            </div>
            
            <!-- Small Restaurant Image - moved closer to center -->
            <div style="width:50px;height:50px;overflow:hidden;border-radius:4px;margin-left:8px;">
              <img 
                src="${imageUrl}" 
                alt="${name}" 
                style="width:100%;height:100%;object-fit:cover;"
                onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGludGVyaW9yfGVufDB8fDB8fHww&w=1000&q=80';"
              />
            </div>
          </div>
          
          <div style="display:flex;align-items:center;margin-bottom:4px;">
            <div style="display:flex;align-items:center;margin-right:10px;">
              <span style="margin-right:2px;">⭐</span>
              <span style="font-weight:bold;font-size:13px;">${eatableRating.toFixed(1)}</span>
              <span style="color:#6b7280;font-size:11px;margin-left:2px;">eatABLE</span>
            </div>
            
            <div style="display:flex;align-items:center;">
              <span style="margin-right:2px;">⭐</span>
              <span style="font-weight:bold;font-size:13px;">${googleRating.toFixed(1)}</span>
              <span style="color:#6b7280;font-size:11px;margin-left:2px;">Google</span>
            </div>
          </div>
          
          ${accommodationsHtml}
          
          ${allergenTags ? `
            <div style="margin-top:4px;margin-bottom:4px;">
              <div style="display:flex;flex-wrap:wrap;">
                ${allergenTags}
              </div>
            </div>
          ` : ''}
          
          <div style="font-size:10px;color:#6b7280;margin-top:4px;text-align:center;background-color:#f3f4f6;padding:2px;border-radius:4px;">
            Click for more details
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error creating info window content:', error);
      return `<div>Error displaying restaurant information</div>`;
    }
  };

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
    </div>
  );
};

export default Map; 