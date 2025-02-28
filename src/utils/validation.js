export const isValidZipCode = (zip) => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
};

export const isValidCity = (city) => {
  const cityRegex = /^[a-zA-Z\s-]+$/;
  return cityRegex.test(city);
}; 