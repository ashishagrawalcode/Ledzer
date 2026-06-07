// src/lib/syncManager.ts
import { createVoucher }                        from '@/actions/vouchers'
import { createReceiptPayment }                 from '@/actions/receiptPayment'
import { getOfflineDB, deleteAction, incrementRetries } from '@/lib/offlineDb'
import { createInvoice }                        from '@/actions/invoice'
import { createParty }                          from '@/actions/parties'
import { createLedger }                         from '@/actions/ledgers'
import { createProduct, deleteProduct, updateProduct } from '@/actions/inventory'

const MAX_RETRIES = 3

type ActionFn = (data: any) => Promise<{ success?: boolean; error?: string; id?: string; [key: string]: any }>

const ACTION_MAP: Record<string, ActionFn> = {
  SALES:          createVoucher,
  PURCHASE:       createVoucher,
  JOURNAL:        createVoucher,
  CONTRA:         createVoucher,
  RECEIPT:        createReceiptPayment,
  PAYMENT:        createReceiptPayment,
  INVOICE:        createInvoice,
  PARTY:          createParty,
  LEDGER:         createLedger,
  PRODUCT_CREATE: createProduct,
  PRODUCT_UPDATE: (data: { id: string; payload: any }) => {
    if (!data?.id) return Promise.resolve({ error: 'Missing product id for update.' })
    return updateProduct(data.id, data.payload)
  },
  PRODUCT_DELETE: (data: { id: string }) => {
    if (!data?.id) return Promise.resolve({ error: 'Missing product id for delete.' })
    return deleteProduct(data.id)
  },
}

let isSyncing = false

export async function processSyncQueue(): Promise<number> {
  if (isSyncing) {
    console.log('[Sync] Already in progress — skipping.')
    return 0
  }

  isSyncing = true
  let syncedCount = 0

  try {
    const db = await getOfflineDB()
    const pending = await db.getAll('pendingActions')

    if (pending.length === 0) return 0

    console.log(`[Sync] Starting sync for ${pending.length} item(s)…`)

    for (const item of pending) {
      const action = ACTION_MAP[item.type]

      if (!action) {
        console.warn(`[Sync] Unknown action type "${item.type}" — removing to unblock queue.`)
        await deleteAction(item.id!)
        continue
      }

      if (item.retries >= MAX_RETRIES) {
        console.error(`[Sync] "${item.type}" (id ${item.id}) exceeded max retries. Dropping.`)
        await deleteAction(item.id!)
        continue
      }

      try {
        const result = await action(item.data)

        if (result && !result.error) {
          await deleteAction(item.id!)
          syncedCount++
          console.log(`[Sync] ✅ Synced: ${item.type} (idb id: ${item.id})`)
        } else {
          console.error(`[Sync] ❌ Server rejected "${item.type}":`, result?.error)
          await incrementRetries(item.id!, item.retries)
        }
      } catch (networkErr) {
        console.warn(`[Sync] 🔌 Network error on "${item.type}" — pausing sync:`, networkErr)
        break
      }
    }

    console.log(`[Sync] Done. ${syncedCount} item(s) synced.`)
    return syncedCount
  } finally {
    isSyncing = false
  }
}

export function startSyncListener(onSynced: (count: number) => void): () => void {
  const handleOnline = async () => {
    try {
      const db = await getOfflineDB()
      const count = await db.count('pendingActions')
      if (count === 0) return

      const synced = await processSyncQueue()
      if (synced > 0) {
        onSynced(synced)
      }
    } catch (err) {
      console.error('[Sync] startSyncListener error:', err)
    }
  }

  window.addEventListener('online', handleOnline)
  return () => window.removeEventListener('online', handleOnline)
}