import { useState } from 'react';
import { toast } from 'sonner';
import { getDB } from '@/lib/db';

export function useOfflineAction() {
  const [isSyncing, setIsSyncing] = useState(false);

  const execute = async (type: string, data: any, serverAction: Function) => {
    try {
      setIsSyncing(true);
      const result = await serverAction(data);
      setIsSyncing(false);
      return result;
    } catch (err: any) {
      setIsSyncing(false);
      
      // Check for connection failure
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        const db = await getDB();
        await db.add('pendingActions', { type, data, timestamp: Date.now() });
        
        toast.info("Connection unstable. Action queued for sync!");
        return { success: true, offline: true };
      }

      return { error: err.message || "Failed to process action" };
    }
  };

  return { execute, isSyncing };
}