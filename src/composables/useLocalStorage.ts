import { ref, watch } from "vue";

/**
 * A composable for interacting with localStorage.
 * It provides reactive functions to set, get, and remove items,
 * automatically handling JSON serialization and deserialization.
 */
export function useLocalStorage() {
  /**
   * Saves an item to localStorage. The value will be JSON.stringified.
   * @param key The key under which to store the value.
   * @param value The value to store. Can be any serializable JavaScript type.
   */
  const setItem = <T>(key: string, value: T) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting localStorage item "${key}":`, error);
    }
  };

  /**
   * Retrieves an item from localStorage. The value will be JSON.parsed.
   * @param key The key of the item to retrieve.
   * @returns The retrieved value, or null if the key is not found or an error occurs.
   */
  const getItem = <T>(key: string): T | null => {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error getting localStorage item "${key}":`, error);
      return null;
    }
  };

  /**
   * Removes an item from localStorage.
   * @param key The key of the item to remove.
   */
  const removeItem = (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage item "${key}":`, error);
    }
  };

  /**
   * Creates a reactive ref that is synced with localStorage.
   * @param key The localStorage key.
   * @param defaultValue The default value to use if the key is not found in localStorage.
   * @returns A reactive ref synced with the localStorage item.
   */
  const createReactiveItem = <T>(key: string, defaultValue: T) => {
    const item = ref<T>(getItem<T>(key) ?? defaultValue);

    watch(
      item,
      (newValue) => {
        if (newValue === null || newValue === undefined) {
          removeItem(key);
        } else {
          setItem(key, newValue);
        }
      },
      { deep: true }
    );

    return item;
  };

  return {
    setItem,
    getItem,
    removeItem,
    createReactiveItem,
  };
}
