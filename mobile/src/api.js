import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';

function normalizeToken(raw) {
  if (raw == null) return null;
  let t = String(raw).trim();
  if (t.startsWith('Bearer ')) t = t.slice(7).trim();
  return t || null;
}

async function apiRequest(endpoint, options = {}) {
  const token = normalizeToken(await AsyncStorage.getItem('authToken'));

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || response.statusText || 'Ошибка сервера' };
    }

    const location = response.headers.get('location');
    if (location && data && typeof data === 'object' && !Array.isArray(data)) {
      data.location = location;
    }

    if (!response.ok) {
      if (response.status === 401 && data.message === 'Неверный токен') {
        await AsyncStorage.removeItem('authToken');
      }
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    const message = String(error?.message || '');
    if (!/Неверный токен|Токен не предоставлен|Токен отсутствует/i.test(message)) {
      console.warn('API Error:', error);
    }
    throw error;
  }
}

function extractIdFromLocation(location) {
  if (!location) return null;
  const match = String(location).match(/\/(\d+)(?:\/)?$/);
  return match ? Number(match[1]) : null;
}

export const authAPI = {
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
};

export const entriesAPI = {
  getAll: async () => {
    const response = await apiRequest('/entries');
    if (Array.isArray(response)) return { entries: response };
    return response;
  },
  getById: async (id) => {
    const response = await apiRequest(`/entries/${id}`);
    if (response && typeof response === 'object' && 'entry' in response) return response;
    return { entry: response };
  },
  create: async (entryData) => {
    const response = await apiRequest('/entries', { method: 'POST', body: entryData });
    if (response?.id) return response;
    const id = extractIdFromLocation(response?.location);
    return id ? { id, location: response.location } : response;
  },
  update: (id, entryData) =>
    apiRequest(`/entries/${id}`, {
      method: 'PUT',
      body: entryData,
    }),
  delete: (id) => apiRequest(`/entries/${id}`, { method: 'DELETE' }),
};

export const emotionsAPI = {
  getList: async () => {
    const response = await apiRequest('/emotions-list');
    if (Array.isArray(response)) return { emotions: response };
    return response;
  },
  addToEntry: (emotionData) => apiRequest('/emotions', { method: 'POST', body: emotionData }),
  getUserEmotions: async () => {
    const response = await apiRequest('/user-emotions');
    if (Array.isArray(response)) return { data: response };
    return response;
  },
};

export const insightsAPI = {
  analyze: () => apiRequest('/insights/analyze', { method: 'POST', body: {} }),
};
