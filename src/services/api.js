import { propertyImages } from "../assets/propertyImages.js";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  "http://localhost:3000";

const TOKEN_KEY = "property_system_access_token";
const REFRESH_TOKEN_KEY = "property_system_refresh_token";
const AUTH_EVENT = "property-system-auth-change";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
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
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export const mockProperties = [
  {
    id: "lakeview-villa",
    title: "Lakeview Villa",
    location: "Lake Como, Italy",
    type: "Entire villa",
    price: 285,
    rating: 4.96,
    reviews: 128,
    guests: 6,
    bedrooms: 3,
    image: propertyImages.villa,
    description:
      "A bright lakeside retreat with panoramic windows, a chef kitchen, private dock access, and terraces designed for slow mornings.",
    amenities: ["Lake access", "Chef kitchen", "Workspace", "Private terrace"],
  },
  {
    id: "soho-loft",
    title: "Soho Design Loft",
    location: "New York, USA",
    type: "Loft",
    price: 198,
    rating: 4.88,
    reviews: 94,
    guests: 3,
    bedrooms: 1,
    image: propertyImages.loft,
    description:
      "An airy loft close to galleries, restaurants, and transit, with refined furniture and a quiet sleeping nook.",
    amenities: ["Fast Wi-Fi", "Elevator", "Washer", "Smart lock"],
  },
  {
    id: "cedar-cabin",
    title: "Cedar Ridge Cabin",
    location: "Aspen, USA",
    type: "Cabin",
    price: 240,
    rating: 4.92,
    reviews: 76,
    guests: 4,
    bedrooms: 2,
    image: propertyImages.cabin,
    description:
      "A warm mountain cabin with vaulted ceilings, trail access, a fire pit, and wide views across the pines.",
    amenities: ["Fireplace", "Hot tub", "Trail access", "Parking"],
  },
  {
    id: "notting-townhouse",
    title: "Notting Hill Townhouse",
    location: "London, UK",
    type: "Townhouse",
    price: 176,
    rating: 4.79,
    reviews: 112,
    guests: 5,
    bedrooms: 2,
    image: propertyImages.townhouse,
    description:
      "A calm townhouse with garden doors, elegant bedrooms, and quick access to cafes, parks, and Underground stations.",
    amenities: ["Garden", "Kitchen", "Family ready", "Transit nearby"],
  },
  {
    id: "tulum-beach-house",
    title: "Tulum Beach House",
    location: "Tulum, Mexico",
    type: "Beach house",
    price: 220,
    rating: 4.84,
    reviews: 67,
    guests: 4,
    bedrooms: 2,
    image: propertyImages.beach,
    description:
      "A breezy beach base with natural textures, outdoor dining, and a short walk to the water.",
    amenities: ["Beach nearby", "Air conditioning", "Patio", "Outdoor shower"],
  },
  {
    id: "shibuya-studio",
    title: "Shibuya Studio",
    location: "Tokyo, Japan",
    type: "Studio",
    price: 132,
    rating: 4.74,
    reviews: 53,
    guests: 2,
    bedrooms: 1,
    image: propertyImages.city,
    description:
      "A compact, polished studio close to shopping, dining, and rail links, with everything needed for a city stay.",
    amenities: ["Kitchenette", "Transit nearby", "City view", "Self check-in"],
  },
];

async function request(path, options = {}) {
  const token = getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
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

    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return response.json();
}

function normalizeAmenity(amenity) {
  if (typeof amenity === "string") {
    return amenity;
  }

  return amenity?.amenity?.name || amenity?.name || "";
}

function normalizeProperty(property) {
  if (!property) {
    return property;
  }

  const averageRating =
    property.averageRating ??
    property.rating ??
    (Array.isArray(property.reviews) && property.reviews.length
      ? property.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        property.reviews.length
      : undefined);

  return {
    ...property,
    image: property.image || property.images?.[0]?.url || propertyImages.fallback,
    amenities: Array.isArray(property.amenities)
      ? property.amenities.map(normalizeAmenity).filter(Boolean)
      : [],
    rating:
      averageRating === undefined || averageRating === null
        ? undefined
        : Number(averageRating).toFixed(1),
    reviews: property.totalReviews ?? property.reviews?.length ?? property.reviews ?? 0,
  };
}

function normalizePropertyCollection(data) {
  const properties = Array.isArray(data) ? data : data?.data || [];
  return properties.map(normalizeProperty);
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
    throw new Error(
      "Authentication succeeded, but the response did not include an access token.",
    );
  }

  setAccessToken(accessToken);

  if (refreshToken) {
    setRefreshToken(refreshToken);
  }
}

export async function register(payload) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  storeAuthTokens(data);
  return data;
}

export async function login(payload) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  storeAuthTokens(data);
  return data;
}

export async function getCurrentUser() {
  return request("/auth/me");
}

export async function getProperties(filters = {}) {
  try {
    return normalizePropertyCollection(await searchProperties(filters));
  } catch {
    return mockProperties.filter((property) => {
      const matchesLocation =
        !filters.location ||
        property.location
          .toLowerCase()
          .includes(filters.location.toLowerCase());

      const matchesPrice = property.price <= Number(filters.maxPrice || 1000);
      const matchesRating =
        property.rating >= Number(filters.minRating || filters.rating || 0);

      return matchesLocation && matchesPrice && matchesRating;
    });
  }
}

export async function searchProperties(filters = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (filters.location) {
      queryParams.set("location", filters.location);
    }

    if (filters.minPrice) {
      queryParams.set("minPrice", filters.minPrice);
    }

    if (filters.maxPrice) {
      queryParams.set("maxPrice", filters.maxPrice);
    }

    if (filters.minRating) {
      queryParams.set("rating", filters.minRating);
    }

    if (filters.rating) {
      queryParams.set("rating", filters.rating);
    }

    if (filters.propertyType) {
      queryParams.set("propertyType", filters.propertyType);
    }

    if (filters.sortBy) {
      queryParams.set("sortBy", filters.sortBy);
    }

    if (filters.sort) {
      queryParams.set("sort", filters.sort);
    }

    if (filters.page) {
      queryParams.set("page", filters.page);
    }

    if (filters.limit) {
      queryParams.set("limit", filters.limit);
    }

    const queryString = queryParams.toString();
    const path = queryString
      ? `/search/properties?${queryString}`
      : "/search/properties";

    return await request(path);
  } catch {
    return mockProperties.filter((property) => {
      const matchesLocation =
        !filters.location ||
        property.location
          .toLowerCase()
          .includes(filters.location.toLowerCase());

      const matchesPrice = property.price <= Number(filters.maxPrice || 1000);
      const matchesRating =
        property.rating >= Number(filters.minRating || filters.rating || 0);

      return matchesLocation && matchesPrice && matchesRating;
    });
  }
}

export async function getPropertyById(id) {
  try {
    return normalizeProperty(await request(`/properties/${id}`));
  } catch {
    return normalizeProperty(mockProperties.find(
      (property) => String(property.id) === String(id),
    ));
  }
}

export async function createBooking(payload) {
  const currentUser = payload.userId ? null : await getCurrentUser();

  return request("/bookings", {
    method: "POST",
    body: JSON.stringify({
      propertyId: Number(payload.propertyId),
      userId: Number(payload.userId || currentUser.id),
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: payload.status || "PENDING",
    }),
  });
}

export async function getUserBookings(userId) {
  return request(`/bookings/user/${userId}`);
}

export async function cancelBooking(id) {
  return request(`/bookings/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function confirmBooking(id) {
  return request(`/bookings/${id}/confirm`, {
    method: "PATCH",
  });
}

export async function getPropertyReviews(propertyId) {
  return request(`/properties/${propertyId}/reviews`);
}

export async function getPropertyAverageRating(propertyId) {
  return request(`/properties/${propertyId}/reviews/average`);
}

export async function createReview(payload) {
  return request("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getDashboardSummary() {
  const user = await getCurrentUser();

  let bookings = [];

  if (user?.id) {
    bookings = await getUserBookings(user.id);
  }

  return {
    user,
    upcomingTrips: Array.isArray(bookings)
      ? bookings.filter((booking) => booking.status !== "CANCELLED").length
      : 0,
    savedHomes: 0,
    totalSpent: Array.isArray(bookings)
      ? bookings.reduce(
          (sum, booking) => sum + Number(booking.totalPrice || 0),
          0,
        )
      : 0,
    bookings,
  };
}
