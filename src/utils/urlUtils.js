export const cleanUrl = (url) => {
  if (!url) return '';
  return url
    .replace(/https?:\/\/(www\.)?/, '')  // Remove http(s):// and www.
    .split('?')[0];                      // Remove query parameters
}; 