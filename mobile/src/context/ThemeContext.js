import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightPalette, darkPalette } from '../theme/palettes';

const STORAGE_KEY = 'emotion_diary_theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'dark' || v === 'light') setMode(v);
      setReady(true);
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, [mode]);

  const value = useMemo(() => {
    const colors = mode === 'dark' ? darkPalette : lightPalette;
    return {
      mode,
      isDark: mode === 'dark',
      colors,
      ready,
      toggleTheme,
      setMode: async (m) => {
        if (m !== 'dark' && m !== 'light') return;
        setMode(m);
        await AsyncStorage.setItem(STORAGE_KEY, m);
      },
    };
  }, [mode, ready, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export function useThemeOptional() {
  return useContext(ThemeContext);
}
