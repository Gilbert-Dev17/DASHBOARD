'use client'

import { Notes } from '@/types/dashboard'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { useMutation, useQuery } from '@tanstack/react-query'

import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { upsertDailyNote } from '@/lib/actions/daily-notes'
import { getDailyNotes } from '@/app/(main)/schedule/action'
import { useState, useRef, useCallback, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Save, FileText } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerHeader, DrawerFooter } from '@/components/ui/drawer'
import { Empty, EmptyContent, EmptyMedia, EmptyDescription } from '@/components/ui/empty'
import { AUTOSAVE_DELAY } from '@/lib/constants/options'

interface NotesProps {
    note?: Notes | null;
    dateStr: string;
    userId: string;
}

const UpdateNotesSchema = z.object({
    content: z.string().nullable()
})

type UpdateDailyNotes = z.infer<typeof UpdateNotesSchema>

export const NotesSection = ({ note, dateStr, userId }: NotesProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const { data: fetchedNote, isLoading } = useQuery({
    queryKey: ['dailyNote', userId, dateStr],
    queryFn: async () => {
      if (!dateStr) return null;
      const res = await getDailyNotes(userId, dateStr)
      return res || null
    },
    enabled: !!dateStr,
    initialData: note !== undefined ? note : undefined
  })

  const currentNote = fetchedNote

  const [optimisticContent, setOptimisticContent] = useState(currentNote?.content || '')

  const { handleSubmit, control, reset, getValues, formState: { isDirty } } = useForm<UpdateDailyNotes>({
      resolver: zodResolver(UpdateNotesSchema) as any,
      defaultValues: {
          content: currentNote?.content || ''
      }
  })

  useEffect(() => {
    if (!isDirty) {
      reset({ content: currentNote?.content || '' })
      setOptimisticContent(currentNote?.content || '')
    }
  }, [currentNote, isDirty, reset])

  const { mutate: saveNote, isPending } = useMutation({
      mutationFn: async (data: UpdateDailyNotes) => {
          const result = await upsertDailyNote(dateStr, data.content || '')
          if (!result.success) throw new Error(result.message)
          return result
      },
      onSuccess: (_result, variables) => {
          toast.success("Note saved successfully")
          if (getValues('content') === variables.content) {
            reset({ content: variables.content })
          }
      },
      onError: (error: Error) => {
          toast.error(error.message || "Failed to save note")
          setOptimisticContent(currentNote?.content || '')
      }
  })

  const isPendingRef = useRef(isPending)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerAutoSave = useCallback(() => {
    if (isPendingRef.current) {
      debounceRef.current = setTimeout(triggerAutoSave, AUTOSAVE_DELAY)
      return
    }
    handleSubmit((data) => {
      setOptimisticContent(data.content || '')
      saveNote(data)
    })()
  }, [handleSubmit, saveNote])

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(triggerAutoSave, AUTOSAVE_DELAY)
  }, [triggerAutoSave])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      const currentValues = getValues()
      if (isDirty && !isPendingRef.current) {
        setOptimisticContent(currentValues.content || '')
        saveNote(currentValues)
      }
    }
  }, [getValues, isDirty, saveNote])

  const onSubmit = (data: UpdateDailyNotes) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      setOptimisticContent(data.content || '')
      saveNote(data)
  }

  const hasContent = !!optimisticContent.trim()

  const previewUi = (
    <button
      type="button"
      className="w-full text-left shrink-0 group cursor-pointer rounded-md border border-border bg-card hover:bg-secondary/40 transition-colors overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Daily Journal
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/50 group-hover:text-foreground/60 transition-colors">
          Edit →
        </span>
      </div>

      <div className="px-4 py-3">
        {isLoading ? (
          <div className="py-6 flex justify-center">
            <Spinner className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : hasContent ? (
          <p className="text-xs leading-relaxed line-clamp-2 font-mono text-foreground/60">
            {optimisticContent}
          </p>
        ) : (
          <Empty className="py-6 border-none">
            <EmptyContent className="max-w-xs mx-auto">
              <EmptyMedia variant="icon" className="mb-0 [&_svg]:size-4">
                <FileText aria-hidden="true" />
              </EmptyMedia>
              <EmptyDescription className="mt-2 text-xs">
                No entry for this date.
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </button>
  )

  const editorUi = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 h-full min-h-0 bg-background">
      {/* Header */}
      <div className="shrink-0 flex items-end justify-between px-5 pt-5 pb-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Daily Journal
          </span>
          <span className="text-base font-medium tracking-tight text-foreground">
            {dateStr ? format(parseISO(dateStr), 'EEEE, MMMM do') : 'Notes'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <DrawerClose render={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
          } />

          <Button
            type="submit"
            disabled={isPending || !isDirty}
            variant="ghost"
            size="sm"
            className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground gap-2 disabled:opacity-30"
          >
            <Save className="w-3 h-3" />
            {isPending
                ? <span className='flex items-center gap-4'>Save <Spinner /></span>
                : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <textarea
              {...field}
              value={field.value || ''}
              onChange={(e) => {
                field.onChange(e)
                scheduleSave()
              }}
              aria-label={`Daily journal entry for ${dateStr ? format(parseISO(dateStr), 'EEEE, MMMM do') : 'today'}`}
              className="absolute inset-0 w-full h-full resize-none px-5 py-4 text-sm bg-transparent text-foreground/80 placeholder:text-muted-foreground/30 outline-none font-mono"
              placeholder="Capture your thoughts, plans, or reflections for the day..."
              spellCheck={true}
              autoFocus
              style={{ lineHeight: '1.25' }}
            />
          )}
        />
      </div>

      {/* Footer meta */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
        <span className={`font-mono text-[11px] uppercase tracking-wider transition-colors ${
          isPending
            ? 'text-muted-foreground'
            : isDirty
              ? 'text-destructive'
              : 'text-muted-foreground/50'
        }`}>
          {isPending ? <span className='flex gap-4 items-center'>Saving <Spinner /></span> : isDirty ? <span>Unsaved changes</span> : <span>All changes saved</span>}
        </span>
      </div>
    </form>
  )

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange} swipeDirection="right">
      <DrawerTrigger render={previewUi} />
      <DrawerContent className="w-full sm:w-115 rounded-md">
        {editorUi}
      </DrawerContent>
    </Drawer>
  )
}