import { Injectable } from '@angular/core';

export type StorageType = 'localStorage' | 'sessionStorage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly defaultStorageType: StorageType = 'localStorage';

  /**
   * Set item in storage
   */
  setItem(key: string, value: any, storageType: StorageType = this.defaultStorageType): void {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      this.getStorage(storageType).setItem(key, serializedValue);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  }

  /**
   * Get item from storage
   */
  getItem(key: string, storageType: StorageType = this.defaultStorageType): string | null {
    try {
      return this.getStorage(storageType).getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  }

  /**
   * Get item as parsed JSON
   */
  getItemAsObject<T>(key: string, storageType: StorageType = this.defaultStorageType): T | null {
    try {
      const item = this.getItem(key, storageType);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error parsing item from storage:', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string, storageType: StorageType = this.defaultStorageType): void {
    try {
      this.getStorage(storageType).removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  }

  /**
   * Clear all items from storage
   */
  clear(storageType: StorageType = this.defaultStorageType): void {
    try {
      this.getStorage(storageType).clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Check if key exists in storage
   */
  hasItem(key: string, storageType: StorageType = this.defaultStorageType): boolean {
    return this.getItem(key, storageType) !== null;
  }

  /**
   * Get all keys from storage
   */
  getKeys(storageType: StorageType = this.defaultStorageType): string[] {
    try {
      const storage = this.getStorage(storageType);
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        keys.push(storage.key(i) || '');
      }
      return keys;
    } catch (error) {
      console.error('Error getting keys from storage:', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes
   */
  getStorageSize(storageType: StorageType = this.defaultStorageType): number {
    try {
      const storage = this.getStorage(storageType);
      let totalSize = 0;
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  /**
   * Get storage quota information
   */
  getStorageQuota(storageType: StorageType = this.defaultStorageType): Promise<{ quota: number; usage: number; available: number }> {
    return new Promise((resolve, reject) => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          const quota = estimate.quota || 0;
          const usage = estimate.usage || 0;
          const available = quota - usage;
          
          resolve({ quota, usage, available });
        }).catch(reject);
      } else {
        // Fallback for browsers that don't support storage quota API
        const usage = this.getStorageSize(storageType);
        resolve({ quota: 0, usage, available: 0 });
      }
    });
  }

  /**
   * Set item with expiration
   */
  setItemWithExpiration(
    key: string, 
    value: any, 
    expirationMinutes: number, 
    storageType: StorageType = this.defaultStorageType
  ): void {
    const expirationTime = new Date().getTime() + (expirationMinutes * 60 * 1000);
    const itemWithExpiration = {
      value,
      expiration: expirationTime
    };
    
    this.setItem(key, itemWithExpiration, storageType);
  }

  /**
   * Get item with expiration check
   */
  getItemWithExpiration<T>(key: string, storageType: StorageType = this.defaultStorageType): T | null {
    try {
      const item = this.getItemAsObject<{ value: T; expiration: number }>(key, storageType);
      
      if (!item) {
        return null;
      }

      if (new Date().getTime() > item.expiration) {
        this.removeItem(key, storageType);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Error getting item with expiration:', error);
      return null;
    }
  }

  /**
   * Clean expired items
   */
  cleanExpiredItems(storageType: StorageType = this.defaultStorageType): void {
    try {
      const keys = this.getKeys(storageType);
      const currentTime = new Date().getTime();
      
      keys.forEach(key => {
        const item = this.getItemAsObject<{ value: any; expiration: number }>(key, storageType);
        if (item && item.expiration && currentTime > item.expiration) {
          this.removeItem(key, storageType);
        }
      });
    } catch (error) {
      console.error('Error cleaning expired items:', error);
    }
  }

  /**
   * Get storage instance
   */
  private getStorage(storageType: StorageType): Storage {
    if (storageType === 'localStorage') {
      return localStorage;
    } else {
      return sessionStorage;
    }
  }

  /**
   * Check if storage is available
   */
  isStorageAvailable(storageType: StorageType = this.defaultStorageType): boolean {
    try {
      const storage = this.getStorage(storageType);
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Migrate data between storage types
   */
  migrateData(fromStorage: StorageType, toStorage: StorageType, keys?: string[]): void {
    try {
      const keysToMigrate = keys || this.getKeys(fromStorage);
      
      keysToMigrate.forEach(key => {
        const value = this.getItem(key, fromStorage);
        if (value) {
          this.setItem(key, value, toStorage);
          this.removeItem(key, fromStorage);
        }
      });
    } catch (error) {
      console.error('Error migrating data:', error);
    }
  }
}
