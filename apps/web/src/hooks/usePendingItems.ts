// src/hooks/usePendingItems.ts
import { useState, useEffect, useCallback } from 'react';
import { getOfflineDB } from '@/lib/offlineDb'; // Use consolidated DB

export function usePendingItems() {
  const [pending, setPending] = useState<any[]>([]);

  const refresh = useCallback(async () => {
    try {
      const db = await getOfflineDB();
      const all = await db.getAll('pendingActions');
      setPending(all);
    } catch (error) {
      console.error("Failed to fetch pending items:", error);
    }
  }, []);

  useEffect(() => {
    refresh();
    
    window.addEventListener('online', refresh);
    window.addEventListener('indexeddb-changed', refresh);

    return () => {
      window.removeEventListener('online', refresh);
      window.removeEventListener('indexeddb-changed', refresh);
    };
  }, [refresh]);

  return pending;
}