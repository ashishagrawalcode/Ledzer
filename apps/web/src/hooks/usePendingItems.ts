import { useState, useEffect } from 'react';
import { openDB } from 'idb';

export function usePendingItems() {
  const [pending, setPending] = useState<any[]>([]);

  const refresh = async () => {
    const db = await openDB('LedzerOfflineDB', 1);
    const all = await db.getAll('pendingActions');
    setPending(all);
  };

  useEffect(() => {
    refresh();
    // Listen for sync events to update the list
    window.addEventListener('online', refresh);
    return () => window.removeEventListener('online', refresh);
  }, []);

  return pending;
}