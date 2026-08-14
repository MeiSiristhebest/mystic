/**
 * Ports & Adapters (Hexagonal Architecture) - Storage & Persistence Port
 * Enables mock repositories for unit testing and swappable persistent storage backends.
 */

export interface IStoragePort<T = any> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<boolean>;
  delete(key: string): Promise<boolean>;
}

/**
 * Memory Storage Adapter (Ideal for isolated unit testing)
 */
export class MemoryStorageAdapter<T = any> implements IStoragePort<T> {
  private store = new Map<string, T>();

  async get(key: string): Promise<T | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: T): Promise<boolean> {
    this.store.set(key, value);
    return true;
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }
}
