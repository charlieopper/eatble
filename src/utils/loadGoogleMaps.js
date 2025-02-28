let isLoading = false;
let isLoaded = false;
const callbacks = [];

export const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (isLoaded) {
      resolve(window.google.maps);
      return;
    }

    if (isLoading) {
      callbacks.push(resolve);
      return;
    }

    isLoading = true;

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      callbacks.forEach(cb => cb(window.google.maps));
      callbacks.length = 0;
      resolve(window.google.maps);
    };

    script.onerror = (error) => {
      isLoading = false;
      reject(error);
    };

    document.head.appendChild(script);
  });
}; 