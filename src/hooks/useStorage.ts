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

  // Load the initial value
  useEffect(() => {
    const loadInitialValue = async () => {
      try {
        if (storageType === 'localStorage') {
          const savedValue = localStorage.getItem(key);
          if (savedValue !== null) {
            setValue(JSON.parse(savedValue));
          }
        } else if (storageType === 'indexedDB') {
          const db = await openDB();
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const savedValue = await store.get(key);
          if (savedValue !== undefined) {
            setValue(savedValue);
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
      
      if (storageType === 'localStorage') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } else if (storageType === 'indexedDB') {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        await store.put(valueToStore, key);
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  return [value, saveValue, loading];
}
