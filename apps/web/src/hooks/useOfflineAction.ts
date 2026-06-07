// src/hooks/useOfflineAction.ts

'use client'

import { useState, useCallback } from 'react'
import { enqueueAction } from '@/lib/offlineDb'

type ActionFn<T> = (data: T) => Promise<{ success?: boolean; error?: string; [key: string]: any }>

interface UseOfflineActionOptions {
  /** Revalidate these paths after a successful online save */
  onSuccess?: () => void
  onError?: (err: string) => void
  onQueued?: () => void    // called when saved to offline queue
}

interface OfflineResult {
  success: boolean
  queued?: boolean
  error?: string
  id?: string
  [key: string]: any
}

export function useOfflineAction<T>(
  actionType: string,
  serverAction: ActionFn<T>,
  options: UseOfflineActionOptions = {}
) {
  const [isPending, setIsPending] = useState(false)
  const [isQueued,  setIsQueued]  = useState(false)

  const execute = useCallback(async (data: T): Promise<OfflineResult> => {
    setIsPending(true)
    setIsQueued(false)

    try {
      // ── Offline path ────────────────────────────────────────────────────
      if (!navigator.onLine) {
        await enqueueAction(actionType, data)
        setIsQueued(true)
        options.onQueued?.()
        return { success: true, queued: true }
      }

      // ── Online path ─────────────────────────────────────────────────────
      const result = await serverAction(data)

      if (result?.success || result?.id || result?.ledgerId) {
        options.onSuccess?.()
        // FIX: You MUST spread the result here so the form gets the ID!
        return { success: true, ...result }
      } else {
        const errMsg = result?.error ?? 'Something went wrong.'
        options.onError?.(errMsg)
        return { success: false, error: errMsg }
      }
    } catch (err) {
      // Network failed mid-request — queue it
      console.warn('[useOfflineAction] Network error — queueing for retry:', err)
      await enqueueAction(actionType, data)
      setIsQueued(true)
      options.onQueued?.()
      return { success: true, queued: true }
    } finally {
      setIsPending(false)
    }
  }, [actionType, serverAction, options])

  return { execute, isPending, isQueued }
}