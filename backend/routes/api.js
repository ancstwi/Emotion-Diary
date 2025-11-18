const API_BASE = 'http://localhost:5000';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    headers: headers,
    method: options.method || 'GET',
  };

  if (options.body) {
    config.body =
      typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return { error: error.message };
  }
}

export const entriesAPI = {
  getAll: () => apiRequest('/api/entries'),

  getById: (id) => apiRequest(`/api/entry/${id}`),

  create: (entryData) =>
    apiRequest('/api/entries', {
      method: 'POST',
      body: entryData,
    }),

  delete: (id) =>
    apiRequest(`/api/entries/${id}`, {
      method: 'DELETE',
    }),
};
