// src/lib/offlineDb.ts
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME    = 'LedzerOfflineDB'
const DB_VERSION = 3
const STORE      = 'pendingActions'

export interface PendingAction {
  id?:       number
  type:      string
  data:      unknown
  createdAt: number
  retries:   number
}

let _db: IDBPDatabase | null = null

export async function getOfflineDB() {
  if (typeof window === 'undefined') {
    throw new Error('[OfflineDB] Cannot use IndexedDB on the server.')
  }

  if (_db) return _db

  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    },
    blocked() {
      console.warn('[OfflineDB] Upgrade blocked by another tab. Please close other tabs.')
    },
    blocking() {
      _db?.close()
      _db = null
    },
  })

  return _db
}

function notifyUI() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('indexeddb-changed'))
  }
}

export async function enqueueAction(type: string, data: unknown): Promise<void> {
  const db = await getOfflineDB()
  const action: PendingAction = {
    type,
    data,
    createdAt: Date.now(),
    retries:   0,
  }
  await db.add(STORE, action)
  console.log(`[OfflineDB] Queued action: ${type}`)
  notifyUI()
}

export async function getPendingActions(): Promise<PendingAction[]> {
  const db = await getOfflineDB()
  return db.getAll(STORE)
}

export async function deleteAction(id: number): Promise<void> {
  const db = await getOfflineDB()
  await db.delete(STORE, id)
  notifyUI()
}

export async function incrementRetries(id: number, currentRetries: number): Promise<void> {
  const db = await getOfflineDB()
  const item = await db.get(STORE, id)
  if (item) {
    await db.put(STORE, { ...item, retries: currentRetries + 1 })
  }
}

export async function getPendingCount(): Promise<number> {
  if (typeof window === 'undefined') return 0
  const db = await getOfflineDB()
  return db.count(STORE)
}