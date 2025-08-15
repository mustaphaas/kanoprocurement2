// Persistent storage utility with fallback mechanisms for environments where localStorage might be restricted

interface StorageItem {
  value: string;
  timestamp: number;
}

class PersistentStorage {
  private memoryStore: Map<string, StorageItem> = new Map();
  private isLocalStorageAvailable: boolean = false;
  private localStorageTestKey = "_storage_test_";

  constructor() {
    this.testLocalStorage();
  }

  private testLocalStorage(): void {
    try {
      // Test if localStorage is actually working
      const testValue = "test_" + Date.now();
      localStorage.setItem(this.localStorageTestKey, testValue);
      const retrieved = localStorage.getItem(this.localStorageTestKey);

      if (retrieved === testValue) {
        localStorage.removeItem(this.localStorageTestKey);
        this.isLocalStorageAvailable = true;
        console.log("✅ localStorage is available and working");
      } else {
        console.log("❌ localStorage test failed - using memory fallback");
        this.isLocalStorageAvailable = false;
      }
    } catch (error) {
      console.log("❌ localStorage error:", error);
      this.isLocalStorageAvailable = false;
    }
  }

  setItem(key: string, value: string): void {
    const item: StorageItem = {
      value,
      timestamp: Date.now(),
    };

    // Always store in memory as backup
    this.memoryStore.set(key, item);

    // Try localStorage if available
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.setItem(key, value);
        localStorage.setItem(`${key}_timestamp`, item.timestamp.toString());
        console.log(`📦 Stored in localStorage: ${key} = ${value}`);
      } catch (error) {
        console.log(`❌ localStorage setItem failed for ${key}:`, error);
        this.isLocalStorageAvailable = false;
      }
    } else {
      console.log(`💾 Stored in memory: ${key} = ${value}`);
    }

    // Trigger storage event manually for same-window updates
    this.triggerStorageEvent(key, value);
  }

  getItem(key: string): string | null {
    // Try localStorage first if available
    if (this.isLocalStorageAvailable) {
      try {
        const value = localStorage.getItem(key);
        if (value !== null) {
          console.log(`📦 Retrieved from localStorage: ${key} = ${value}`);
          return value;
        }
      } catch (error) {
        console.log(`❌ localStorage getItem failed for ${key}:`, error);
        this.isLocalStorageAvailable = false;
      }
    }

    // Fallback to memory store
    const item = this.memoryStore.get(key);
    if (item) {
      console.log(`💾 Retrieved from memory: ${key} = ${item.value}`);
      return item.value;
    }

    console.log(`❌ Key not found: ${key}`);
    return null;
  }

  removeItem(key: string): void {
    // Remove from memory
    this.memoryStore.delete(key);

    // Remove from localStorage if available
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_timestamp`);
        console.log(`🗑️ Removed from localStorage: ${key}`);
      } catch (error) {
        console.log(`❌ localStorage removeItem failed for ${key}:`, error);
      }
    }

    // Trigger storage event
    this.triggerStorageEvent(key, null);
  }

  getAllKeys(): string[] {
    const keys = new Set<string>();

    // Get keys from memory
    this.memoryStore.forEach((_, key) => keys.add(key));

    // Get keys from localStorage if available
    if (this.isLocalStorageAvailable) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !key.endsWith("_timestamp")) {
            keys.add(key);
          }
        }
      } catch (error) {
        console.log("❌ Failed to get localStorage keys:", error);
      }
    }

    return Array.from(keys);
  }

  getUserStatusKeys(): string[] {
    return this.getAllKeys().filter((key) => key.startsWith("userStatus_"));
  }

  private triggerStorageEvent(key: string, newValue: string | null): void {
    // Create custom event for same-window storage updates
    const event = new CustomEvent("persistentStorageChange", {
      detail: { key, newValue },
    });
    window.dispatchEvent(event);

    // Also trigger localStorage event for cross-tab communication
    if (this.isLocalStorageAvailable) {
      try {
        // Create a temporary item to trigger storage event
        const tempKey = `_sync_trigger_${Date.now()}`;
        localStorage.setItem(
          tempKey,
          JSON.stringify({ key, newValue, timestamp: Date.now() }),
        );
        localStorage.removeItem(tempKey);
      } catch (error) {
        console.log("❌ Failed to trigger localStorage event:", error);
      }
    }
  }

  // Debug methods
  debugInfo(): void {
    console.log("=== PERSISTENT STORAGE DEBUG ===");
    console.log("localStorage available:", this.isLocalStorageAvailable);
    console.log("Memory store size:", this.memoryStore.size);
    console.log("All keys:", this.getAllKeys());
    console.log("UserStatus keys:", this.getUserStatusKeys());

    // Show all userStatus entries
    const userStatusKeys = this.getUserStatusKeys();
    userStatusKeys.forEach((key) => {
      const value = this.getItem(key);
      console.log(`${key}: ${value}`);
    });
  }

  clearAll(): void {
    // Clear memory
    this.memoryStore.clear();

    // Clear localStorage userStatus keys
    if (this.isLocalStorageAvailable) {
      try {
        const keysToRemove = this.getUserStatusKeys();
        keysToRemove.forEach((key) => {
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_timestamp`);
        });
        console.log("🗑️ Cleared localStorage userStatus keys");
      } catch (error) {
        console.log("❌ Failed to clear localStorage:", error);
      }
    }

    console.log("🗑️ Cleared all storage");
  }
}

// Create global instance
export const persistentStorage = new PersistentStorage();

// Add global debug functions
(window as any).debugStorage = () => persistentStorage.debugInfo();
(window as any).clearAllStorage = () => persistentStorage.clearAll();
(window as any).testStorage = () => {
  console.log("=== TESTING PERSISTENT STORAGE ===");
  persistentStorage.setItem("test_key", "test_value");
  const retrieved = persistentStorage.getItem("test_key");
  console.log(
    "Test result:",
    retrieved === "test_value" ? "SUCCESS" : "FAILED",
  );
  persistentStorage.removeItem("test_key");
};
