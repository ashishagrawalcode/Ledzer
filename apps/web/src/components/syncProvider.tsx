// src/components/SyncProvider.tsx
'use client'
import { useEffect } from 'react'
import { processSyncQueue } from '@/lib/syncManager'
import { toast } from 'sonner'

export function SyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleOnline = async () => {
      toast.loading("Reconnected! Syncing offline data...", { id: 'sync-toast' });
      await processSyncQueue();
      toast.success("All offline data synced!", { id: 'sync-toast' });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return <>{children}</>;
}