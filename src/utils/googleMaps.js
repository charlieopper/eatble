// Create a new file for Google Maps utilities
let googleMapsPromise = null;

export const loadGoogleMapsAPI = () => {
  if (googleMapsPromise) {
    return googleMapsPromise;
  }
  
  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    
    // Load the API
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Set up callbacks
    window.initGoogleMaps = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps API failed to load'));
      }
      delete window.initGoogleMaps;
    };
    
    script.src += '&callback=initGoogleMaps';
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
    };
    
    document.head.appendChild(script);
  });
  
  return googleMapsPromise;
}; 