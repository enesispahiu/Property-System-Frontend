const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001/api';

export const api = {
  // Get all properties
  getProperties: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_URL}/properties${queryString ? '?' + queryString : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Search properties
  searchProperties: async (searchParams) => {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const url = `${API_URL}/properties/search${queryString ? '?' + queryString : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to search properties: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  },

  // Get property by ID
  getPropertyById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch property: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  },

  // Get available locations
  getLocations: async () => {
    try {
      const response = await fetch(`${API_URL}/properties/locations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
};
