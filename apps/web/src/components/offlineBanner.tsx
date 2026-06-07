'use client'

import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    const goOffline = () => setIsOffline(true)
    const goOnline  = () => setIsOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed top-14 left-0 right-0 z-40 bg-orange-500/10 border-b border-orange-500/20 text-orange-500 text-[10px] uppercase tracking-widest font-bold py-1.5 text-center backdrop-blur-sm animate-pulse">
      Working Offline — Data will sync on connection
    </div>
  )
}