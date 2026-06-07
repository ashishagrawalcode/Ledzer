// src/lib/syncManager.ts
import { createVoucher } from '@/actions/vouchers';
import { createReceiptPayment } from '@/actions/receiptPayment';
import { getOfflineDB, deleteAction } from '@/lib/offlineDb';
import { createInvoice } from '@/actions/invoice';
import { createParty } from '@/actions/parties';
import { createLedger } from '@/actions/ledgers';
import { createProduct, deleteProduct, updateProduct } from '@/actions/inventory';

const ACTION_MAP: any = {
  'SALES': createVoucher,
  'PURCHASE': createVoucher,
  'JOURNAL': createVoucher,
  'CONTRA': createVoucher,
  'RECEIPT': createReceiptPayment,
  'PAYMENT': createReceiptPayment,
  'INVOICE': createInvoice,
  'PARTY': createParty,
  'LEDGER': createLedger,
  'PRODUCT_CREATE': createProduct,
  'PRODUCT_UPDATE': (data: any) => updateProduct(data.id, data.payload),
  'PRODUCT_DELETE': (data: any) => deleteProduct(data.id),
};

let isSyncing = false;

export async function processSyncQueue() {
  if (isSyncing) {
    console.log("Sync already in progress, skipping loop...");
    return;
  }
  
  isSyncing = true;

  try {
    const db = await getOfflineDB();
    const pending = await db.getAll('pendingActions');

    if (pending.length === 0) return;

    console.log(`Starting sync for ${pending.length} items...`);

    for (const item of pending) {
      const action = ACTION_MAP[item.type];
      
      if (!action) {
        console.warn(`Unknown action type: ${item.type}. Deleting to prevent jam.`);
        await deleteAction(item.id);
        continue;
      }

      try {
        const result = await action(item.data);
        
        if (result && !result.error) {
          await deleteAction(item.id);
          console.log(`✅ Synced and deleted: ${item.type} (${item.id})`);
        } else {
          console.error(`❌ Server rejected ${item.type}:`, result);
        }
      } catch (err) {
        console.error(`⚠️ Network error on ${item.type}:`, err);
        break; 
      }
    }
  } finally {
    isSyncing = false;
  }
}

export function startSyncListener(onSynced: (count: number) => void) {
  const handleOnline = async () => {
    const db = await getOfflineDB();
    const count = await db.count('pendingActions');
    if (count > 0) {
      await processSyncQueue();
      onSynced(count);
    }
  };
  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}