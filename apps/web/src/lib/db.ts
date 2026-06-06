// src/lib/db.ts
import { openDB } from 'idb';

const DB_NAME = 'LedzerOfflineDB';
const STORE_NAME = 'pendingActions';

export async function getDB() {
  return openDB(DB_NAME, 2, { // Bumped version to 2 to force upgrade
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}