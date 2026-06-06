import { createVoucher } from '@/actions/vouchers';
import { createReceiptPayment } from '@/actions/receiptPayment';
import { getDB } from '@/lib/db';

const ACTION_MAP: any = {
  'SALES': createVoucher,
  'PURCHASE': createVoucher,
  'JOURNAL': createVoucher,
  'CONTRA': createVoucher,
  'RECEIPT': createReceiptPayment,
  'PAYMENT': createReceiptPayment,
};

export async function processSyncQueue() {
  const db = await getDB();

  // 1. Get all items (this finishes the read transaction immediately)
  const pending = await db.getAll('pendingActions');

  for (const item of pending) {
    const action = ACTION_MAP[item.type];
    if (action) {
      try {
        // 2. Perform network request outside of any transaction
        const result = await action(item.data);
        
        // 3. If successful, open a NEW transaction to delete
        if (result.success) {
          await db.delete('pendingActions', item.id);
          console.log("Successfully synced and deleted item:", item.id);
        } else {
          console.error("Server rejected item:", item.id, result.error);
        }
      } catch (err) {
        console.error("Network error processing item:", item.id, err);
      }
    }
  }
}