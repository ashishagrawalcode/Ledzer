// src/hooks/useOfflineAction.ts
'use client'

import { useState, useCallback, useRef } from 'react'
import { enqueueAction } from '@/lib/offlineDb'

type ActionFn<T> = (data: T) => Promise<{ success?: boolean; error?: string; [key: string]: any }>

interface UseOfflineActionOptions {
  onSuccess?: () => void
  onError?:   (err: string) => void
  onQueued?:  () => void
}

interface OfflineResult {
  success: boolean
  queued?: boolean
  error?:  string
  [key: string]: any
}

export function useOfflineAction<T>(
  actionType: string,
  serverAction: ActionFn<T>,
  options: UseOfflineActionOptions = {}
) {
  const [isPending, setIsPending] = useState(false)
  const [isQueued,  setIsQueued]  = useState(false)

  const actionTypeRef    = useRef(actionType)
  const serverActionRef  = useRef(serverAction)
  const onSuccessRef     = useRef(options.onSuccess)
  const onErrorRef       = useRef(options.onError)
  const onQueuedRef      = useRef(options.onQueued)

  actionTypeRef.current   = actionType
  serverActionRef.current = serverAction
  onSuccessRef.current    = options.onSuccess
  onErrorRef.current      = options.onError
  onQueuedRef.current     = options.onQueued

  const execute = useCallback(async (data: T): Promise<OfflineResult> => {
    setIsPending(true)
    setIsQueued(false)

    try {
      // ── Offline path ──────────────────────────────────────────────────────
      if (typeof window !== 'undefined' && !navigator.onLine) {
        await enqueueAction(actionTypeRef.current, data)
        setIsQueued(true)
        onQueuedRef.current?.()
        return { success: true, queued: true }
      }

      // ── Online path ───────────────────────────────────────────────────────
      const result = await serverActionRef.current(data)

      if (result?.success || result?.id || result?.ledgerId) {
        onSuccessRef.current?.()
        return { success: true, ...result }
      } else {
        const errMsg = result?.error ?? 'Something went wrong.'
        onErrorRef.current?.(errMsg)
        return { success: false, error: errMsg }
      }
    } catch (err) {
      console.warn('[useOfflineAction] Network error — queuing for retry:', err)
      await enqueueAction(actionTypeRef.current, data)
      setIsQueued(true)
      onQueuedRef.current?.()
      return { success: true, queued: true }
    } finally {
      setIsPending(false)
    }
  }, [])

  return { execute, isPending, isQueued }
}