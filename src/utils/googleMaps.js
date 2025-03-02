// Improved Google Maps utility with better caching and error handling
let googleMapsPromise = null;
let isLoading = false;

export const loadGoogleMapsAPI = () => {
  // Return existing promise if we already started loading
  if (googleMapsPromise) {
    return googleMapsPromise;
  }
  
  // Return a resolved promise if Google Maps is already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }
  
  // Prevent multiple loading attempts
  if (isLoading) {
    return new Promise((resolve, reject) => {
      // Check every 100ms if the API has loaded
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkLoaded);
          resolve(window.google.maps);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        reject(new Error('Google Maps API loading timeout'));
      }, 10000);
    });
  }
  
  isLoading = true;
  
  // Create a new loading promise
  googleMapsPromise = new Promise((resolve, reject) => {
    try {
      // Create a unique callback name
      const callbackName = `googleMapsCallback_${Date.now()}`;
      
      // Set up the callback function
      window[callbackName] = () => {
        if (window.google && window.google.maps) {
          console.log('Google Maps API loaded successfully');
          resolve(window.google.maps);
        } else {
          reject(new Error('Google Maps API failed to load'));
        }
        // Clean up the global callback
        delete window[callbackName];
      };
      
      // Create script element
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=${callbackName}&loading=async`;
      script.async = true;
      script.defer = true;
      
      // Handle script load errors
      script.onerror = () => {
        isLoading = false;
        reject(new Error('Failed to load Google Maps API script'));
      };
      
      // Add the script to the document
      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });
  
  // Add error handling to reset the loading state
  googleMapsPromise.catch(error => {
    isLoading = false;
    googleMapsPromise = null;
    console.error('Error loading Google Maps:', error);
  });
  
  return googleMapsPromise;
};

// Helper function to check if Maps API is loaded
export const isMapsLoaded = () => {
  return window.google && window.google.maps ? true : false;
}; 