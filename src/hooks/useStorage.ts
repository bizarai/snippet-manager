// src/hooks/useStorage.ts
import { useState, useEffect } from 'react';

// Type for storage options
type StorageType = 'localStorage' | 'indexedDB';

interface StorageOptions {
  storageType: StorageType;
  dbName?: string;
  storeName?: string;
}

// Generic hook for handling storage with multiple backends
export function useStorage<T>(
  key: string, 
  initialValue: T,
  options: StorageOptions = { storageType: 'localStorage' }
): [T, (value: T | ((val: T) => T)) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const { storageType, dbName = 'snippetManagerDB', storeName = 'snippets' } = options;

  // Check if IndexedDB is fully supported
  const isIndexedDBSupported = () => {
    try {
      return typeof indexedDB !== 'undefined' && 
        indexedDB !== null &&
        typeof window !== 'undefined';
    } catch (e) {
      return false;
    }
  };

  // Get effective storage type based on browser support
  const getEffectiveStorageType = (): StorageType => {
    if (storageType === 'indexedDB' && !isIndexedDBSupported()) {
      console.warn('IndexedDB not supported, falling back to localStorage');
      return 'localStorage';
    }
    return storageType;
  };

  // Load the initial value
  useEffect(() => {
    const loadInitialValue = async () => {
      try {
        const effectiveStorageType = getEffectiveStorageType();
        
        if (effectiveStorageType === 'localStorage') {
          if (typeof window !== 'undefined' && window.localStorage) {
            const savedValue = localStorage.getItem(key);
            if (savedValue !== null) {
              setValue(JSON.parse(savedValue));
            }
          }
        } else if (effectiveStorageType === 'indexedDB') {
          try {
            const db = await openDB();
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const savedValue = await store.get(key);
            if (savedValue !== undefined) {
              setValue(savedValue);
            }
          } catch (error) {
            console.error('IndexedDB operation failed:', error);
            // Fallback to localStorage if IndexedDB fails
            if (typeof window !== 'undefined' && window.localStorage) {
              const savedValue = localStorage.getItem(key);
              if (savedValue !== null) {
                setValue(JSON.parse(savedValue));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialValue();
  }, [key, storageType, dbName, storeName]);

  // Helper function to open IndexedDB
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (!isIndexedDBSupported()) {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      
      const request = indexedDB.open(dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
      
      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
      
      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  };

  // Save the value
  const saveValue = async (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      
      const effectiveStorageType = getEffectiveStorageType();
      
      if (effectiveStorageType === 'localStorage') {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } else if (effectiveStorageType === 'indexedDB') {
        try {
          const db = await openDB();
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          await store.put(valueToStore, key);
        } catch (error) {
          console.error('IndexedDB save failed, falling back to localStorage:', error);
          // Fallback to localStorage if IndexedDB fails
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        }
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  return [value, saveValue, loading];
}
