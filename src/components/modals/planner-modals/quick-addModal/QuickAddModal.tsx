'use client'

import { useCallback, useEffect, useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { useGlobalShortcut } from '@/hooks/useGlobalShortcut'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { TASK_CATEGORIES, CATEGORY_LABELS, type TaskCategory } from '../../../../lib/constants/tasks'
import { parseTaskLines, sortParsedTasks, type ParsedTask } from '@/utils/parseTaskLines'
import { submitQuickAddTasks } from '@/lib/actions/quick-add'
import {
  Dialog, DialogContent, DialogDescription,
   DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Textarea } from '../../../ui/textarea'
import { Kbd, KbdGroup } from '../../../ui/kbd'
import { toast } from 'sonner'

export const QuickAddModal = () => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const targetDateStr = searchParams.get('date')

  const [showMenu, setShowMenu] = useState(false)
  const [menuFilter, setMenuFilter] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [atTokenStart, setAtTokenStart] = useState<number | null>(null)

  const { mutate: addTasks, isPending } = useMutation({
    mutationFn: (tasks: ParsedTask[]) => submitQuickAddTasks(tasks, targetDateStr || undefined),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
        setText('')
        setOpen(false)
      } else {
        toast.error(result.message)
      }
    },
    onError: (error) => {
      toast.error('Failed to add tasks: ' + error.message)
    }
  })

  const handleTrigger = useCallback(() => setOpen((prev) => !prev), [])
  useGlobalShortcut({ key: 'k', onTrigger: handleTrigger })

  const filteredCategories = TASK_CATEGORIES.filter(cat =>
    cat.toLowerCase().startsWith(menuFilter.toLowerCase())
  )

  // Scroll selected item into view when navigating with arrow keys
  useEffect(() => {
    if (!showMenu || !menuRef.current) return
    const selected = menuRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex, showMenu])

  // ── Calculate the popover position relative to the textarea ──
  const getMenuPosition = useCallback((currentText: string, cursorPos: number) => {
    const textarea = textareaRef.current
    if (!textarea) return { top: 0, left: 0 }

    const textBefore = currentText.substring(0, cursorPos)
    const lines = textBefore.split('\n')
    const lineIndex = lines.length - 1
    const currentLine = lines[lineIndex]

    const computed = getComputedStyle(textarea)
    const lineHeight = parseFloat(computed.lineHeight) || 20
    const paddingTop = parseFloat(computed.paddingTop)
    const paddingLeft = parseFloat(computed.paddingLeft)
    const fontSize = parseFloat(computed.fontSize)

    // Approximate character width for monospace font
    const charWidth = fontSize * 0.6

    const top = paddingTop + (lineIndex + 1) * lineHeight - textarea.scrollTop
    const left = paddingLeft + currentLine.length * charWidth

    return {
      top: Math.min(top, textarea.clientHeight - 20),
      left: Math.min(Math.max(left, 16), textarea.clientWidth - 200),
    }
  }, [])

  // ── Check for @-token at cursor position ──
  const checkAutocomplete = useCallback((currentText: string, cursorPos: number) => {
    const textBefore = currentText.substring(0, cursorPos)
    const match = textBefore.match(/@(\w*)$/)

    if (match) {
      setMenuFilter(match[1])
      setAtTokenStart(textBefore.length - match[0].length)
      setSelectedIndex(0)
      setShowMenu(true)
      setMenuPosition(getMenuPosition(currentText, cursorPos))
    } else {
      setShowMenu(false)
      setAtTokenStart(null)
    }
  }, [getMenuPosition])

  // ── Insert a selected category into the text ──
  const insertCategory = useCallback((category: TaskCategory) => {
    const textarea = textareaRef.current
    if (!textarea || atTokenStart === null) return

    const cursorPos = textarea.selectionStart
    const before = text.substring(0, atTokenStart)
    const after = text.substring(cursorPos)
    const newText = `${before}@${category} ${after}`
    const newCursorPos = atTokenStart + category.length + 2 // @ + category + space

    setText(newText)
    setShowMenu(false)
    setAtTokenStart(null)

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    })
  }, [atTokenStart, text])

  // ── Handlers ──

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    const cursorPos = e.target.selectionStart
    setText(newText)
    checkAutocomplete(newText, cursorPos)
  }

  const handleClick = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    checkAutocomplete(text, textarea.selectionStart)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget

    // ── Autocomplete navigation (highest priority) ──
    if (showMenu && filteredCategories.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % filteredCategories.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + filteredCategories.length) % filteredCategories.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertCategory(filteredCategories[selectedIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowMenu(false)
        return
      }
    }

    // ── Tab → indent for subtask ──
    if (e.key === 'Tab' && !showMenu) {
      e.preventDefault()
      const start = textarea.selectionStart
      const lineStart = text.lastIndexOf('\n', start - 1) + 1
      const lineText = text.substring(lineStart, start)

      if (!lineText.startsWith('  ')) {
        const newText = text.substring(0, lineStart) + '  ' + text.substring(lineStart)
        setText(newText)
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start + 2, start + 2)
        })
      }
    }

    // ── Backspace on empty indent → un-indent back to task level ──
    if (e.key === 'Backspace') {
      const start = textarea.selectionStart
      const lineStart = text.lastIndexOf('\n', start - 1) + 1
      const lineText = text.substring(lineStart, start)

      if (lineText === '  ') {
        e.preventDefault()
        const newText = text.substring(0, lineStart) + text.substring(lineStart + 2)
        setText(newText)
        requestAnimationFrame(() => {
          textarea.setSelectionRange(lineStart, lineStart)
        })
      }
    }

    // ── Cmd + Enter → submit ──
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const parsed = sortParsedTasks(parseTaskLines(text))

    if (parsed.length === 0) {
      toast.error('Add at least one task.')
      return
    }

    const missing = parsed.filter(t => !t.name || !t.category)

    if (missing.length > 0) {
      toast.error('Each task needs a name and @category.')
      return
    }

    // Dispatch optimistic event so AgendaSection picks up tasks instantly
    window.dispatchEvent(new CustomEvent('optimistic-tasks', { detail: parsed }))

    addTasks(parsed)
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) { setShowMenu(false); setText('') } }}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="rounded-md transition-all duration-300 hover:scale-105"
          aria-label="Quick add tasks"
        >
          <Plus size={18} strokeWidth={2.5} aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold">Quick Add</DialogTitle>
          <DialogDescription>
            One task per line. Use{' '}
            <Kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">@</Kbd>{' '}
            for category, add time at the end. Press{' '}
            <Kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Tab</Kbd>{' '}
            to indent a subtask.
          </DialogDescription>
        </DialogHeader>

        {/* ── Textarea with inline autocomplete ── */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            placeholder={`Buy groceries @errands 10:00\n  Get milk\n  Get bread\nFinish report @work 3:00pm\nWalk the dog @pets`}
            className="w-full min-h-50 max-h-80 p-4 rounded-lg border bg-transparent text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/40"
            spellCheck={false}
            autoFocus
          />

          {/* Autocomplete Popover */}
          {showMenu && filteredCategories.length > 0 && (
            <div
              ref={menuRef}
              className="absolute z-50 w-40 max-h-64 overflow-y-auto rounded-lg border bg-popover p-2 shadow-lg animate-in fade-in-0 zoom-in-95 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
            >
              {filteredCategories.map((cat, i) => (
                <Button
                  key={cat}
                  type="button"
                  variant={'ghost'}
                  data-index={i}
                  className={`w-full text-sm font-medium ${
                    i === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                  onMouseDown={(e) => { e.preventDefault(); insertCategory(cat) }}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  {CATEGORY_LABELS[cat]}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between">
          <KbdGroup className="text-xs text-muted-foreground">
            <Kbd >⌘</Kbd>
            {' + '}
            <Kbd >Enter</Kbd>
            {' to submit'}
          </KbdGroup>
          <Button onClick={handleSubmit} disabled={!text.trim() || isPending}>
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner />
                Adding...
              </span>
            ) : (
              'Add tasks'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}