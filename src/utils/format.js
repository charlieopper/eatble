export const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format: (XXX) XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  
  return phoneNumber; // Return original if formatting fails
};

export const formatTime = (time) => {
  // Convert 24hr time (e.g., "1430") to 12hr time (e.g., "2:30 PM")
  if (!time || time.length !== 4) return time;
  
  const hours = parseInt(time.substring(0, 2));
  const minutes = time.substring(2);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  
  return `${displayHours}:${minutes} ${period}`;
}; 