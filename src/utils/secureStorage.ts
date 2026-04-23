// Secure localStorage wrapper with validation and sanitization

const STORAGE_PREFIX = 'aaa_';

interface StorageItem<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CURRENT_VERSION = 1;

export class SecureStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecureStorageError';
  }
}

// Validate if a string contains potential XSS
function containsXSS(str: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
  ];
  return xssPatterns.some(pattern => pattern.test(str));
}

// Sanitize string value
function sanitizeString(value: string): string {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Recursively sanitize object values
function sanitizeValue<T>(value: T): T {
  if (typeof value === 'string') {
    if (containsXSS(value)) {
      console.warn('Potentially malicious content detected in storage');
      return sanitizeString(value) as unknown as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized as T;
  }
  return value;
}

export const secureStorage = {
  set<T>(key: string, value: T): void {
    try {
      const fullKey = `${STORAGE_PREFIX}${key}`;
      const sanitizedValue = sanitizeValue(value);
      const item: StorageItem<T> = {
        data: sanitizedValue as T,
        timestamp: Date.now(),
        version: CURRENT_VERSION,
      };
      localStorage.setItem(fullKey, JSON.stringify(item));
    } catch (e) {
      console.error('SecureStorage: Failed to set item', e);
      throw new SecureStorageError('Failed to save data');
    }
  },

  get<T>(key: string, maxAge?: number): T | null {
    try {
      const fullKey = `${STORAGE_PREFIX}${key}`;
      const item = localStorage.getItem(fullKey);
      if (!item) return null;

      const parsed: StorageItem<T> = JSON.parse(item);

      // Check version
      if (parsed.version !== CURRENT_VERSION) {
        localStorage.removeItem(fullKey);
        return null;
      }

      // Check expiry
      if (maxAge && Date.now() - parsed.timestamp > maxAge) {
        localStorage.removeItem(fullKey);
        return null;
      }

      return sanitizeValue(parsed.data);
    } catch (e) {
      console.error('SecureStorage: Failed to get item', e);
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return null;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (e) {
      console.error('SecureStorage: Failed to remove item', e);
    }
  },

  clear(): void {
    try {
      // Only clear items with our prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('SecureStorage: Failed to clear items', e);
    }
  },

  has(key: string): boolean {
    return localStorage.getItem(`${STORAGE_PREFIX}${key}`) !== null;
  },
};
