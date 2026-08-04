'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type SyncStatus = 'idle' | 'syncing' | 'error'

interface SyncStatusContextType {
  syncStatus: SyncStatus
  setSyncStatus: (status: SyncStatus) => void
  lastSyncedAt: Date | null
  setLastSyncedAt: (date: Date | null) => void
}

const SyncStatusContext = createContext<SyncStatusContextType | undefined>(undefined)

export function SyncStatusProvider({ children }: { children: ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  return (
    <SyncStatusContext.Provider value={{ syncStatus, setSyncStatus, lastSyncedAt, setLastSyncedAt }}>
      {children}
    </SyncStatusContext.Provider>
  )
}

export function useSyncStatus() {
  const context = useContext(SyncStatusContext)
  if (context === undefined) {
    throw new Error('useSyncStatus must be used within a SyncStatusProvider')
  }
  return context
}
