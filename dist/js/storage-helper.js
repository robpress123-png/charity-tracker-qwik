/**
 * Storage Helper - Progressive enhancement for security
 * Gracefully migrates sensitive data to sessionStorage
 */

// Auto-migrate on load
(function migrateStorage() {
  const sensitiveKeys = ['token', 'user'];

  sensitiveKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      // Copy to sessionStorage
      sessionStorage.setItem(key, value);
      // Remove from localStorage
      localStorage.removeItem(key);
      console.log(`Migrated ${key} to secure session storage`);
    }
  });
})();

// Enhanced storage functions
const secureStorage = {
  setAuth(token, user) {
    // Use sessionStorage for sensitive data
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
  },

  getAuth() {
    // Check sessionStorage first, then localStorage for backward compatibility
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');

    if (token && userStr) {
      try {
        return { token, user: JSON.parse(userStr) };
      } catch {
        return null;
      }
    }
    return null;
  },

  clearAuth() {
    // Clear from both storages
    ['token', 'user'].forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
  },

  isAuthenticated() {
    return this.getAuth() !== null;
  }
};