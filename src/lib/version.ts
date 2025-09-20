// Version management - Update APP_VERSION when making changes
export const APP_VERSION = '1.0.1';
export const BUILD_DATE = new Date().toISOString().split('T')[0];
export const VERSION_INFO = `v${APP_VERSION}`;

// Version history
export const VERSION_HISTORY = [
  { version: '1.0.1', date: '2025-01-20', changes: 'Added version tracking system to login page' },
  { version: '1.0.0', date: '2025-01-20', changes: 'Initial release with authentication and dashboard' }
];