export interface Restaurant {
  id: string;
  name: string;
  address: Address;
  location: GeoLocation;
  contact: ContactInfo;
  cuisineTypes: string[];
  photos: string[];
  placeId: string;
  ratings: RatingAggregate;
  allergenAccommodations: AllergenAccommodations;
}

interface Address {
  formatted: string;
  components: AddressComponents;
}

interface GeoLocation {
  lat: number;
  lng: number;
}

interface ContactInfo {
  phone: string;
  website?: string;
  hours: OperatingHours[];
}

interface RatingAggregate {
  average: number;
  count: number;
}

interface AllergenAccommodations {
  chefManagerAvailable: boolean;
  allergenMenuAvailable: boolean;
}

interface AddressComponents {
  streetNumber: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface OperatingHours {
  day: number; // 0-6 representing Sunday-Saturday
  open: string; // HH:mm format
  close: string; // HH:mm format
  isOpen: boolean;
} 