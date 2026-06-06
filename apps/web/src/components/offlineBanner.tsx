'use client'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine)
    window.addEventListener('offline', handleStatus)
    window.addEventListener('online', handleStatus)
    return () => {
      window.removeEventListener('offline', handleStatus)
      window.removeEventListener('online', handleStatus)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed top-14 left-0 right-0 z-40 bg-orange-500/10 border-b border-orange-500/20 text-orange-500 text-[10px] uppercase tracking-widest font-bold py-1.5 text-center backdrop-blur-sm animate-pulse">
      Working Offline — Data will sync on connection
    </div>
  )
}