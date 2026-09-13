import {create} from 'zustand'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface SyncStore {
    status: SyncStatus
    lastSynced: Date | null
    error: string | null

    setSyncing: () => void
    setSynced: () => void
    setError: (message: string) => void
    reset: () => void
}

export const useSyncStore = create<SyncStore>()((set) => ({
    status: 'idle',
    lastSynced: null,
    error: null,

    setSyncing: () => set({ status: 'syncing', error: null }),
    setSynced: () => set({ status: 'synced', lastSynced: new Date(), error: null }),
    setError: (message: string) => set({ status: 'error', error: message }),
    reset: () => set({ status: 'idle', lastSynced: null, error: null })
}))