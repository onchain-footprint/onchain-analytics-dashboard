if (typeof window !== "undefined") {
  if (!globalThis.indexedDB) {
    globalThis.indexedDB = window.indexedDB;
  }
  if (!globalThis.IDBKeyRange) {
    globalThis.IDBKeyRange = window.IDBKeyRange;
  }
}
