/**
 * Storage Manager - Hybrid approach for secure session management
 * Uses sessionStorage for sensitive data, localStorage for preferences
 */

class StorageManager {
  // Sensitive items that should use sessionStorage
  static SENSITIVE_KEYS = ['token', 'user'];

  // Non-sensitive items that can use localStorage
  static PERSISTENT_KEYS = ['theme', 'lastEmail', 'dashboardView'];

  /**
   * Smart set - automatically chooses correct storage based on key
   */
  static setItem(key, value) {
    const storage = this.SENSITIVE_KEYS.includes(key) ? sessionStorage : localStorage;

    if (typeof value === 'object') {
      storage.setItem(key, JSON.stringify(value));
    } else {
      storage.setItem(key, value);
    }
  }

  /**
   * Smart get - checks both storages, prioritizing sessionStorage
   */
  static getItem(key) {
    // Check sessionStorage first for sensitive data
    let value = sessionStorage.getItem(key);

    // Fall back to localStorage if not found
    if (value === null) {
      value = localStorage.getItem(key);
    }

    // Try to parse JSON, return raw value if not JSON
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * Remove from both storages
   */
  static removeItem(key) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }

  /**
   * Clear sensitive data (logout)
   */
  static clearSensitive() {
    this.SENSITIVE_KEYS.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key); // Also clear from localStorage for migration
    });
  }

  /**
   * Clear all data
   */
  static clearAll() {
    sessionStorage.clear();
    localStorage.clear();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    return this.getItem('token') !== null;
  }

  /**
   * Migrate existing localStorage to appropriate storage
   * Call this once on app init
   */
  static migrate() {
    this.SENSITIVE_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key);
        console.log(`Migrated ${key} from localStorage to sessionStorage`);
      }
    });
  }
}

// Export for use in pages
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}