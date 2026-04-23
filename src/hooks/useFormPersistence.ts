import { useState, useEffect, useCallback } from 'react';
import { secureStorage } from '../utils/secureStorage';

interface UseFormPersistenceOptions<T> {
  key: string;
  expiryMs?: number;
  excludeFields?: (keyof T)[];
}

interface PersistedFormState<T> {
  data: Partial<T>;
  timestamp: number;
}

export function useFormPersistence<T extends Record<string, unknown>>(
  _initialData: T,
  options: UseFormPersistenceOptions<T>
) {
  const { key, expiryMs = 24 * 60 * 60 * 1000, excludeFields = [] } = options;
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load saved data on mount
  const loadSavedData = useCallback(() => {
    try {
      const parsed = secureStorage.get<PersistedFormState<T>>(key, expiryMs);
      if (parsed) {
        setLastSaved(new Date(parsed.timestamp));
        return parsed.data;
      }
    } catch (e) {
      console.error('Failed to load persisted form:', e);
    }
    return null;
  }, [key, expiryMs]);

  useEffect(() => {
    loadSavedData();
    setIsHydrated(true);
  }, [loadSavedData]);

  const saveForm = useCallback(
    (data: T) => {
      try {
        const dataToSave = { ...data };
        excludeFields.forEach((field) => {
          delete dataToSave[field];
        });

        secureStorage.set(key, {
          data: dataToSave,
          timestamp: Date.now(),
        });
        setLastSaved(new Date());
      } catch (e) {
        console.error('Failed to save form:', e);
      }
    },
    [key, excludeFields]
  );

  const clearSavedForm = useCallback(() => {
    try {
      secureStorage.remove(key);
      setLastSaved(null);
    } catch (e) {
      console.error('Failed to clear saved form:', e);
    }
  }, [key]);

  const checkHasSavedData = useCallback(() => {
    return secureStorage.has(key);
  }, [key]);

  return {
    isHydrated,
    setIsHydrated,
    lastSaved,
    saveForm,
    clearSavedForm,
    checkHasSavedData,
  };
}

// Hook for auto-saving form with debounce
export function useAutoSave<T extends Record<string, unknown>>(
  data: T,
  options: UseFormPersistenceOptions<T> & { debounceMs?: number }
) {
  const { saveForm, lastSaved } = useFormPersistence(data, options);
  const { debounceMs = 1000 } = options;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveForm(data);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [data, debounceMs, saveForm]);

  return { lastSaved };
}
