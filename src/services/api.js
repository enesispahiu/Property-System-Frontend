import { propertyImages } from "../assets/propertyImages.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export async function logout() {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  try {
    if (refreshToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    // Local logout must succeed even when the API is unavailable.
  } finally {
    clearAuthTokens();
  }
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

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    const error = new Error(
      `Backend is not running at ${API_URL}. Check that the backend is running and CORS is enabled.`,
    );
    error.isConnectionError = true;
    throw error;
  }

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      message = response.statusText || message;
    }

    const error = new Error(
      Array.isArray(message) ? message.join(", ") : message,
    );
    error.status = response.status;

    if (
      response.status === 401 &&
      path !== "/auth/login" &&
      path !== "/auth/register"
    ) {
      clearAuthTokens();
      error.message = "Unauthorized, please login again.";

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function normalizePropertyList(result) {
  return normalizePropertySearchResult(result).data;
}

function normalizePropertySearchResult(result, fallbackFilters = {}) {
  const properties = Array.isArray(result)
    ? result
    : Array.isArray(result?.data)
      ? result.data
      : [];
  const page = Number(fallbackFilters.page || 1);
  const limit = Number(fallbackFilters.limit || properties.length || 0);
  const responseMeta = result?.meta || result?.pagination || {};
  const total = Number(responseMeta.total ?? properties.length);
  const normalizedLimit = Number(responseMeta.limit || limit);
  const totalPages =
    Number(responseMeta.totalPages) ||
    (normalizedLimit > 0 ? Math.ceil(total / normalizedLimit) : 1);

  return {
    data: properties.map(normalizeProperty),
    meta: {
      page: Number(responseMeta.page || page),
      limit: normalizedLimit,
      total,
      totalPages,
    },
  };
}

function normalizeProperty(property) {
  if (!property) {
    return property;
  }

  const images = Array.isArray(property.images) ? property.images : [];
  const imageUrl =
    property.imageUrl ||
    property.image ||
    images[0]?.url ||
    images[0]?.imageUrl ||
    propertyImages.fallback;

  return {
    ...property,
    images,
    amenities: Array.isArray(property.amenities) ? property.amenities : [],
    reviews: Array.isArray(property.reviews) ? property.reviews : [],
    bookings: Array.isArray(property.bookings) ? property.bookings : [],
    imageUrl,
  };
}

function normalizeFavorite(favorite) {
  if (!favorite) {
    return favorite;
  }

  const favoriteData = favorite.favorite || favorite;
  const property = favoriteData.property || favoriteData;

  return {
    ...favoriteData,
    property: normalizeProperty(property),
  };
}

function markMockProperty(property) {
  return property ? normalizeProperty({ ...property, isMock: true }) : property;
}

function filterMockProperties(filters = {}) {
  return mockProperties
    .filter((property) => {
      const matchesLocation =
        !filters.location ||
        property.location
          .toLowerCase()
          .includes(filters.location.toLowerCase());

      const matchesPrice =
        property.price >= Number(filters.minPrice || 0) &&
        property.price <= Number(filters.maxPrice || 1000);
      const matchesRating =
        property.rating >= Number(filters.minRating || filters.rating || 0);

      return matchesLocation && matchesPrice && matchesRating;
    })
    .map(markMockProperty);
}

function paginateMockProperties(properties, filters = {}) {
  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || properties.length || 6);
  const start = (page - 1) * limit;
  const data = properties.slice(start, start + limit);

  return {
    data,
    meta: {
      page,
      limit,
      total: properties.length,
      totalPages: Math.ceil(properties.length / limit),
    },
  };
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

export async function getProperties(filters = {}, options = {}) {
  try {
    return await searchProperties(filters, options);
  } catch (error) {
    if (error.isConnectionError || error.status === 401) {
      throw error;
    }

    const result = paginateMockProperties(
      filterMockProperties(filters),
      filters,
    );
    return options.includeMeta ? result : result.data;
  }
}

export async function getAdminProperties() {
  return normalizePropertyList(await request("/properties"));
}

export async function searchProperties(filters = {}, options = {}) {
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

    if (filters.category) {
      queryParams.set("category", filters.category);
    }

    const sort = filters.sort || filters.sortBy;
    if (sort) {
      queryParams.set("sort", sort);
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

    const result = normalizePropertySearchResult(await request(path), filters);
    return options.includeMeta ? result : result.data;
  } catch (error) {
    if (error.isConnectionError || error.status === 401) {
      throw error;
    }

    const result = paginateMockProperties(
      filterMockProperties(filters),
      filters,
    );
    return options.includeMeta ? result : result.data;
  }
}

export async function getPropertyById(id) {
  try {
    return normalizeProperty(await request(`/properties/${id}`));
  } catch (error) {
    if (error.isConnectionError || error.status === 401) {
      throw error;
    }

    const publicProperties = await searchProperties({ page: 1, limit: 100 });
    const publicProperty = publicProperties.find(
      (property) => String(property.id) === String(id),
    );

    if (publicProperty) {
      return normalizeProperty(publicProperty);
    }

    return markMockProperty(
      mockProperties.find((property) => String(property.id) === String(id)),
    );
  }
}

export async function createProperty(payload) {
  return request("/properties", {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      location: payload.location,
      price: Number(payload.price),
      ...(payload.status ? { status: payload.status } : {}),
    }),
  });
}

export async function updateProperty(id, payload) {
  return request(`/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...payload,
      ...(payload.price !== undefined ? { price: Number(payload.price) } : {}),
    }),
  });
}

export async function deleteProperty(id) {
  return request(`/properties/${id}`, {
    method: "DELETE",
  });
}

export async function reactivateProperty(id) {
  return normalizeProperty(
    await request(`/properties/${id}/reactivate`, {
      method: "PATCH",
    }),
  );
}

export async function createBooking(payload) {
  return request("/bookings", {
    method: "POST",
    body: JSON.stringify({
      propertyId: Number(payload.propertyId),
      startDate: payload.startDate,
      endDate: payload.endDate,
    }),
  });
}

export async function getBookings() {
  return normalizeBookingList(await request("/bookings"));
}

export async function getBookingById(id) {
  return request(`/bookings/${id}`);
}

export async function updateBookingStatus(id, status) {
  return request(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getUsers() {
  return request("/users");
}

export async function getTenants(options = {}) {
  const queryParams = new URLSearchParams();

  if (options.includeInactive) {
    queryParams.set("includeInactive", "true");
  }

  const queryString = queryParams.toString();
  return request(
    queryString ? `/platform/tenants?${queryString}` : "/platform/tenants",
  );
}

export async function createTenant(payload) {
  return request("/platform/tenants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTenant(id, payload) {
  return request(`/platform/tenants/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTenant(id) {
  return request(`/platform/tenants/${id}`, {
    method: "DELETE",
  });
}

export async function deactivateTenant(id) {
  return request(`/platform/tenants/${id}/deactivate`, {
    method: "PATCH",
  });
}

export async function reactivateTenant(id) {
  return request(`/platform/tenants/${id}/reactivate`, {
    method: "PATCH",
  });
}

export async function createTenantAdmin(tenantId, payload) {
  return request(`/platform/tenants/${tenantId}/admins`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUserRole(id, roleId) {
  return request(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ roleId: Number(roleId) }),
  });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, {
    method: "DELETE",
  });
}

export async function getUserBookings(userId) {
  return normalizeBookingList(await request(`/bookings/user/${userId}`));
}

export async function deleteBooking(id) {
  return request(`/bookings/${id}`, {
    method: "DELETE",
  });
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

export async function addFavorite(propertyId) {
  return normalizeFavorite(
    await request(`/favorites/${Number(propertyId)}`, {
      method: "POST",
    }),
  );
}

export async function getMyFavorites() {
  const result = await request("/favorites/me");
  const favorites = Array.isArray(result)
    ? result
    : Array.isArray(result?.data)
      ? result.data
      : [];

  return favorites.map(normalizeFavorite);
}

export async function removeFavorite(propertyId) {
  return request(`/favorites/${Number(propertyId)}`, {
    method: "DELETE",
  });
}

export async function payBooking(bookingId, method) {
  const result = await request(`/payments/bookings/${Number(bookingId)}/pay`, {
    method: "POST",
    body: JSON.stringify({ method }),
  });

  return {
    ...result,
    booking: result?.booking
      ? normalizeBooking(result.booking)
      : result?.booking,
  };
}

export async function getPropertyReviews(propertyId) {
  return request(`/properties/${propertyId}/reviews`);
}

export async function getReviews(propertyId) {
  if (!propertyId) {
    return [];
  }

  return getPropertyReviews(propertyId);
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

export async function deleteReview(id) {
  return request(`/reviews/${id}`, {
    method: "DELETE",
  });
}

export async function aiChat(message) {
  const properties = await searchProperties({ page: 1, limit: 12 }).catch(
    () => [],
  );
  const propertyContext = properties
    .map((property) => {
      return `${property.title} | ${property.location} | $${property.price}/night | ${property.description || "No description"}`;
    })
    .join("\n");
  const prompt = propertyContext
    ? `
User request:
${message}

Available properties:
${propertyContext}

Answer with a helpful recommendation. Suggest specific properties when relevant. Do not ask many questions.
`
    : message;

  return request("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message: prompt }),
  });
}

export async function generatePropertyDescription(payload) {
  return request("/ai/property-description", {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      location: payload.location,
      price: Number(payload.price),
    }),
  });
}

export async function analyzeReview(comment) {
  return request("/ai/review-analysis", {
    method: "POST",
    body: JSON.stringify({ comment }),
  });
}

export async function getDashboardSummary() {
  const user = await getCurrentUser();
  const bookings = user?.id ? await getUserBookings(user.id) : [];
  const paidConfirmedBookings = Array.isArray(bookings)
    ? bookings.filter(
        (booking) =>
          booking.status === "CONFIRMED" && booking.paymentStatus === "PAID",
      )
    : [];

  return {
    user,
    upcomingTrips: Array.isArray(bookings)
      ? bookings.filter((booking) => booking.status !== "CANCELLED").length
      : 0,
    savedHomes: 0,
    totalSpent: paidConfirmedBookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice || 0),
      0,
    ),
    bookings,
  };
}

function normalizeBookingList(result) {
  const bookings = Array.isArray(result)
    ? result
    : Array.isArray(result?.data)
      ? result.data
      : [];

  return bookings.map(normalizeBooking);
}

function normalizeBooking(booking) {
  const payments = Array.isArray(booking.payments) ? booking.payments : [];
  const paidPayment = payments.find((payment) => payment.status === "PAID");
  const latestPayment = payments[0] || null;

  return {
    ...booking,
    property: booking.property
      ? {
          ...booking.property,
          title: booking.property.title || booking.property.name,
          location:
            booking.property.location ||
            booking.property.address ||
            booking.property.city,
        }
      : null,
    payments,
    paymentStatus: paidPayment ? "PAID" : "UNPAID",
    paymentMethod: paidPayment?.method || latestPayment?.method || "",
    totalPrice: Number(booking.totalPrice || booking.total_price || 0),
    startDate: booking.startDate || booking.start_date,
    endDate: booking.endDate || booking.end_date,
    status: booking.status || "PENDING",
  };
}
