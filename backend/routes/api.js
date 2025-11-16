const API_BASE = 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка сервера');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const authAPI = {
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    }),

  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    }),
};

export const entriesAPI = {
  getAll: () => apiRequest('/entries'),

  getById: (id) => apiRequest(`/entries/${id}`),

  create: (entryData) =>
    apiRequest('/entries', {
      method: 'POST',
      body: entryData,
    }),

  delete: (id) =>
    apiRequest(`/entries/${id}`, {
      method: 'DELETE',
    }),
};

export const emotionsAPI = {
  getList: () => apiRequest('/emotions-list'),

  addToEntry: (emotionData) =>
    apiRequest('/emotions', {
      method: 'POST',
      body: emotionData,
    }),

  getUserEmotions: () => apiRequest('/user-emotions'),
};
