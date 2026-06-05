'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TerminologyMode } from '@/lib/dictionary'

interface PreferencesState {
  terminologyMode: TerminologyMode
  setTerminologyMode: (mode: TerminologyMode) => void
  toggleTerminologyMode: () => void

  theme: 'dark' | 'light' | 'system'
  setTheme: (theme: 'dark' | 'light' | 'system') => void

  isNavExpanded: boolean
  toggleNav: () => void

  displayCurrency: string
  setDisplayCurrency: (currency: string) => void
  
  // Hydration tracking
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      terminologyMode: 'standard',
      setTerminologyMode: (mode) => set({ terminologyMode: mode }),
      toggleTerminologyMode: () =>
        set({ terminologyMode: get().terminologyMode === 'standard' ? 'simple' : 'standard' }),

      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      isNavExpanded: false,
      toggleNav: () => set({ isNavExpanded: !get().isNavExpanded }),

      displayCurrency: 'INR',
      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'ledzer-preferences',
      onRehydrateStorage: () => (state) => {
        // This fires after Zustand has successfully read the cookie on the client
        state?.setHasHydrated(true)
      },
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return {
          getItem: (name) => {
            const cookies = document.cookie.split(';')
            const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`))
            if (!cookie) return null
            try {
              return decodeURIComponent(cookie.split('=').slice(1).join('='))
            } catch {
              return null
            }
          },
          setItem: (name, value) => {
            document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=31536000;SameSite=Lax`
          },
          removeItem: (name) => {
            document.cookie = `${name}=;path=/;max-age=0`
          },
        }
      }),
    }
  )
)

// Safe selector hooks that wait for hydration
export const useTerminology = () => {
  const mode = usePreferencesStore((s) => s.terminologyMode)
  const hydrated = usePreferencesStore((s) => s._hasHydrated)
  return hydrated ? mode : 'standard' // Always return default on server
}

export const useTheme = () => {
  const theme = usePreferencesStore((s) => s.theme)
  const hydrated = usePreferencesStore((s) => s._hasHydrated)
  return hydrated ? theme : 'dark' // Always return default on server
}