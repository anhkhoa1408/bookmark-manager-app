const DATABASE_NAME = "bookmark-manager-cache";
const DATABASE_VERSION = 2;

type StoreName = "bookmarks" | "tags";

export abstract class IndexedDbStoreService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  protected async getAll<TValue>(storeName: StoreName) {
    const db = await this.getDb();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    return this.wrapRequest<TValue[]>(store.getAll());
  }

  protected async putMany<TValue>(storeName: StoreName, values: TValue[]) {
    if (values.length === 0) {
      return;
    }

    const db = await this.getDb();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    for (const value of values) {
      store.put(value);
    }

    await this.wrapTransaction(transaction);
  }

  protected async deleteMany(storeName: StoreName, keys: IDBValidKey[]) {
    if (keys.length === 0) {
      return;
    }

    const db = await this.getDb();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    for (const key of keys) {
      store.delete(key);
    }

    await this.wrapTransaction(transaction);
  }

  protected async clear(storeName: StoreName) {
    const db = await this.getDb();
    const transaction = db.transaction(storeName, "readwrite");

    await Promise.all([this.wrapRequest(transaction.objectStore(storeName).clear()), this.wrapTransaction(transaction)]);
  }

  private getDb() {
    if (typeof window === "undefined" || !window.indexedDB) {
      throw new Error("IndexedDB is only available in the browser.");
    }

    if (!this.dbPromise) {
      this.dbPromise = this.openDb();
    }

    return this.dbPromise;
  }

  private openDb() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains("bookmarks")) {
          const bookmarksStore = db.createObjectStore("bookmarks", { keyPath: "id" });
          bookmarksStore.createIndex("archived", "archived", { unique: false });
          bookmarksStore.createIndex("updatedAt", "updatedAt", { unique: false });
          bookmarksStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        if (!db.objectStoreNames.contains("tags")) {
          const tagsStore = db.createObjectStore("tags", { keyPath: "id" });
          tagsStore.createIndex("slug", "slug", { unique: false });
          tagsStore.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onerror = () => reject(request.error ?? new Error("Could not open IndexedDB."));
      request.onblocked = () => reject(new Error("IndexedDB upgrade is blocked by another open tab."));
    });
  }

  private wrapRequest<TResult>(request: IDBRequest<TResult>) {
    return new Promise<TResult>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
    });
  }

  private wrapTransaction(transaction: IDBTransaction) {
    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
      transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
    });
  }
}
