'use client'

import { useEffect } from 'react'

interface UseGlobalShortcutOptions {
  /** Key to listen for, case-insensitive (e.g. 'k', 'Escape') */
  key: string
  /** Callback fired when the shortcut is triggered */
  onTrigger: () => void
  /** Require Cmd (Mac) / Ctrl (Windows) to be held. Default: true */
  requireMeta?: boolean
  /** Disable the listener without unmounting the hook. Default: true */
  enabled?: boolean
}

/**
 * Registers a global keydown listener for a Cmd+K / Ctrl+K style shortcut.
 * Prevents the browser's default behavior (address bar focus, bookmark
 * search, etc.) when the shortcut fires.
 */
export function useGlobalShortcut({
  key,
  onTrigger,
  requireMeta = true,
  enabled = true,
}: UseGlobalShortcutOptions): void {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      if (!event.key || !key) return
      
      const isModifierPressed = event.metaKey || event.ctrlKey
      const isTargetKey = event.key.toLowerCase() === key.toLowerCase()

      if (requireMeta && !isModifierPressed) return
      if (!isTargetKey) return

      event.preventDefault()
      onTrigger()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, onTrigger, requireMeta, enabled])
}