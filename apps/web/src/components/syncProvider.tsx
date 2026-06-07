// src/components/SyncProvider.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { startSyncListener, processSyncQueue } from '@/lib/syncManager'
import { getPendingCount } from '@/lib/offlineDb'
import { CheckCircle, CloudOff, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

type BannerState = 'hidden' | 'offline' | 'syncing' | 'synced'

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [banner,       setBanner]       = useState<BannerState>('hidden')
  const [syncedCount,  setSyncedCount]  = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const refreshPendingCount = useCallback(async () => {
    try {
      const n = await getPendingCount()
      setPendingCount(n)
    } catch {
    }
  }, [])

  useEffect(() => {
    if (!navigator.onLine) {
      setBanner('offline')
    }

    refreshPendingCount()

    const onOffline = () => {
      setBanner('offline')
      refreshPendingCount()
    }

    const onOnline = () => {
      setBanner('syncing')
      refreshPendingCount()
    }

    window.addEventListener('offline',           onOffline)
    window.addEventListener('online',            onOnline)
    window.addEventListener('indexeddb-changed', refreshPendingCount)

    const cleanupSync = startSyncListener((synced) => {
      setSyncedCount(synced)
      setBanner('synced')
      refreshPendingCount()
      setTimeout(() => setBanner('hidden'), 4000)
    })

    const runInitialSyncIfNeeded = async () => {
      if (!navigator.onLine) return
      try {
        const n = await getPendingCount()
        if (n > 0) {
          setBanner('syncing')
          const synced = await processSyncQueue()
          if (synced > 0) {
            setSyncedCount(synced)
            setBanner('synced')
            refreshPendingCount()
            setTimeout(() => setBanner('hidden'), 4000)
          } else {
            setBanner('hidden')
          }
        }
      } catch {
      }
    }

    runInitialSyncIfNeeded()

    return () => {
      window.removeEventListener('offline',           onOffline)
      window.removeEventListener('online',            onOnline)
      window.removeEventListener('indexeddb-changed', refreshPendingCount)
      cleanupSync()
    }
  }, [refreshPendingCount])

  return (
    <>
      {children}

      {banner !== 'hidden' && (
        <div
          className={cn(
            'fixed top-14 left-0 right-0 z-[60] flex items-center justify-center gap-2',
            'px-4 py-2 text-xs font-semibold backdrop-blur-sm border-b transition-all duration-300',
            banner === 'offline' && 'bg-amber-500/10  border-amber-500/20  text-amber-600  dark:text-amber-400',
            banner === 'syncing' && 'bg-blue-500/10   border-blue-500/20   text-blue-600   dark:text-blue-400',
            banner === 'synced'  && 'bg-green-500/10  border-green-500/20  text-green-600  dark:text-green-400',
          )}
        >
          {banner === 'offline' && (
            <>
              <CloudOff size={13} />
              You&apos;re offline — entries are saved locally and will sync when you reconnect
              {pendingCount > 0 && (
                <span className="ml-1 opacity-60">({pendingCount} pending)</span>
              )}
            </>
          )}

          {banner === 'syncing' && (
            <>
              <RefreshCw size={13} className="animate-spin" />
              Back online — syncing your saved entries…
              {pendingCount > 0 && (
                <span className="ml-1 opacity-60">({pendingCount} queued)</span>
              )}
            </>
          )}

          {banner === 'synced' && (
            <>
              <CheckCircle size={13} />
              {syncedCount} entr{syncedCount === 1 ? 'y' : 'ies'} synced successfully
            </>
          )}
        </div>
      )}
    </>
  )
}