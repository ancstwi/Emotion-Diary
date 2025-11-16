const API_BASE = 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = token;
  }

  if (config.body) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export const authAPI = {
  register: (userData) =>
    apiRequest('/users/register', {
      method: 'POST',
      body: userData,
    }),

  login: (credentials) =>
    apiRequest('/users/login', {
      method: 'POST',
      body: credentials,
    }),
};
