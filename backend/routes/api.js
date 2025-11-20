const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  });

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }

      const errorData = await response.json().catch(() => ({
        message: `HTTP error ${response.status}: ${response.statusText}`,
      }));

      throw new Error(errorData.message || `Ошибка ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    console.error(`API Request Failed [${endpoint}]:`, error);

    if (
      error.name === 'TypeError' &&
      error.message.includes('Failed to fetch')
    ) {
      throw new Error('Проблемы с подключением к серверу');
    }

    throw error;
  }
};

const apiRequestWithRetry = async (endpoint, options = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await apiRequest(endpoint, options);
    } catch (error) {
      if (i === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

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

  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  },
};

export const entriesAPI = {
  getAll: () => apiRequestWithRetry('/entries'),

  getById: (id) => apiRequest(`/entries/${id}`),

  create: (entryData) =>
    apiRequest('/entries', {
      method: 'POST',
      body: entryData,
    }),

  update: (id, entryData) =>
    apiRequest(`/entries/${id}`, {
      method: 'PUT',
      body: entryData,
    }),

  delete: (id) =>
    apiRequest(`/entries/${id}`, {
      method: 'DELETE',
    }),
};

export const emotionsAPI = {
  getList: () => apiRequest('/emotions'),

  addToEntry: (entryId, emotionData) =>
    apiRequest(`/entries/${entryId}/emotions`, {
      method: 'POST',
      body: emotionData,
    }),

  removeFromEntry: (entryId, emotionId) =>
    apiRequest(`/entries/${entryId}/emotions/${emotionId}`, {
      method: 'DELETE',
    }),

  getUserEmotions: (period = 'week') =>
    apiRequest(`/user/emotions?period=${period}`),
};

export const apiUtils = {
  setToken: (token) => localStorage.setItem('authToken', token),
  getToken: () => localStorage.getItem('authToken'),
  clearToken: () => localStorage.removeItem('authToken'),
};
