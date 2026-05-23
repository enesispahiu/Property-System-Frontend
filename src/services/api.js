import { propertyImages } from '../assets/propertyImages.js';

const API_URL =
  import.meta.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'property_system_access_token';
const REFRESH_TOKEN_KEY = 'property_system_refresh_token';
const AUTH_EVENT = 'property-system-auth-change';

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function setAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function onAuthChange(callback) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export const mockProperties = [
  {
    id: 'lakeview-villa',
    title: 'Lakeview Villa',
    location: 'Lake Como, Italy',
    type: 'Entire villa',
    price: 285,
    rating: 4.96,
    reviews: 128,
    guests: 6,
    bedrooms: 3,
    image: propertyImages.villa,
    description:
      'A bright lakeside retreat with panoramic windows, a chef kitchen, private dock access, and terraces designed for slow mornings.',
    amenities: ['Lake access', 'Chef kitchen', 'Workspace', 'Private terrace'],
  },
  {
    id: 'soho-loft',
    title: 'Soho Design Loft',
    location: 'New York, USA',
    type: 'Loft',
    price: 198,
    rating: 4.88,
    reviews: 94,
    guests: 3,
    bedrooms: 1,
    image: propertyImages.loft,
    description:
      'An airy loft close to galleries, restaurants, and transit, with refined furniture and a quiet sleeping nook.',
    amenities: ['Fast Wi-Fi', 'Elevator', 'Washer', 'Smart lock'],
  },
  {
    id: 'cedar-cabin',
    title: 'Cedar Ridge Cabin',
    location: 'Aspen, USA',
    type: 'Cabin',
    price: 240,
    rating: 4.92,
    reviews: 76,
    guests: 4,
    bedrooms: 2,
    image: propertyImages.cabin,
    description:
      'A warm mountain cabin with vaulted ceilings, trail access, a fire pit, and wide views across the pines.',
    amenities: ['Fireplace', 'Hot tub', 'Trail access', 'Parking'],
  },
  {
    id: 'notting-townhouse',
    title: 'Notting Hill Townhouse',
    location: 'London, UK',
    type: 'Townhouse',
    price: 176,
    rating: 4.79,
    reviews: 112,
    guests: 5,
    bedrooms: 2,
    image: propertyImages.townhouse,
    description:
      'A calm townhouse with garden doors, elegant bedrooms, and quick access to cafes, parks, and Underground stations.',
    amenities: ['Garden', 'Kitchen', 'Family ready', 'Transit nearby'],
  },
  {
    id: 'tulum-beach-house',
    title: 'Tulum Beach House',
    location: 'Tulum, Mexico',
    type: 'Beach house',
    price: 220,
    rating: 4.84,
    reviews: 67,
    guests: 4,
    bedrooms: 2,
    image: propertyImages.beach,
    description:
      'A breezy beach base with natural textures, outdoor dining, and a short walk to the water.',
    amenities: ['Beach nearby', 'Air conditioning', 'Patio', 'Outdoor shower'],
  },
  {
    id: 'shibuya-studio',
    title: 'Shibuya Studio',
    location: 'Tokyo, Japan',
    type: 'Studio',
    price: 132,
    rating: 4.74,
    reviews: 53,
    guests: 2,
    bedrooms: 1,
    image: propertyImages.city,
    description:
      'A compact, polished studio close to shopping, dining, and rail links, with everything needed for a city stay.',
    amenities: ['Kitchenette', 'Transit nearby', 'City view', 'Self check-in'],
  },
];

async function request(path, options) {
  const token = getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return response.json();
}

function extractAccessToken(data) {
  return data.accessToken || data.access_token || data.token || data.jwt;
}

function extractRefreshToken(data) {
  return data.refreshToken || data.refresh_token;
}

function storeAuthTokens(data) {
  const accessToken = extractAccessToken(data);
  const refreshToken = extractRefreshToken(data);

  if (!accessToken) {
    throw new Error('Authentication succeeded, but the response did not include an access token.');
  }

  setAccessToken(accessToken);

  if (refreshToken) {
    setRefreshToken(refreshToken);
  }
}

export async function register(payload) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  storeAuthTokens(data);
  return data;
}

export async function login(payload) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  storeAuthTokens(data);
  return data;
}

export async function getProperties(filters = {}) {
  try {
    // Backend integration point: replace `/properties` with your real endpoint
    // and pass filters as query parameters supported by the API.
    return await request('/properties');
  } catch {
    return mockProperties.filter((property) => {
      const matchesLocation =
        !filters.location ||
        property.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesPrice = property.price <= Number(filters.maxPrice || 1000);
      const matchesRating = property.rating >= Number(filters.minRating || 0);

      return matchesLocation && matchesPrice && matchesRating;
    });
  }
}

export async function getPropertyById(id) {
  try {
    // Backend integration point: GET `/properties/:id`.
    return await request(`/properties/${id}`);
  } catch {
    return mockProperties.find((property) => property.id === id);
  }
}

export async function createBooking(payload) {
  try {
    // Backend integration point: POST booking payload to `/bookings`.
    return await request('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return { id: crypto.randomUUID(), status: 'pending', ...payload };
  }
}

export async function getDashboardSummary() {
  try {
    // Backend integration point: GET authenticated user dashboard data.
    return await request('/dashboard');
  } catch {
    return {
      upcomingTrips: 3,
      savedHomes: 12,
      totalSpent: 1840,
      bookings: [
        { id: 1, title: 'Lakeview Villa', date: 'Jun 12-16', status: 'Confirmed' },
        { id: 2, title: 'Cedar Ridge Cabin', date: 'Jul 4-8', status: 'Awaiting payment' },
        { id: 3, title: 'Shibuya Studio', date: 'Aug 20-25', status: 'Confirmed' },
      ],
    };
  }
}
