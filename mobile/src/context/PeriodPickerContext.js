import React, { createContext, useContext, useRef, useCallback } from 'react';

const PeriodPickerContext = createContext(null);

export const PeriodPickerProvider = ({ children }) => {
  const openRef = useRef(null);
  const register = useCallback((fn) => { openRef.current = fn || null; }, []);
  const open = useCallback(() => openRef.current?.(), []);
  return (
    <PeriodPickerContext.Provider value={{ register, open }}>
      {children}
    </PeriodPickerContext.Provider>
  );
};

export const usePeriodPicker = () => useContext(PeriodPickerContext);
