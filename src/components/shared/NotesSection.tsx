import { Notes } from '@/types/dashboard'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { useMutation } from '@tanstack/react-query'

import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { upsertDailyNote } from '@/lib/actions/daily-notes'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Save } from 'lucide-react'

interface NotesProps {
    note: Notes | null;
    dateStr: string;
    isExpanded: boolean;
    onExpand: () => void;
}

const UpdateNotesSchema = z.object({
    content: z.string().nullable()
})

type UpdateDailyNotes = z.infer<typeof UpdateNotesSchema>

export const NotesSection = ({ note, dateStr, isExpanded, onExpand }: NotesProps) => {

  const router = useRouter()
  const [optimisticContent, setOptimisticContent] = useState(note?.content || '')

  const { handleSubmit, control, reset, formState: { isDirty } } = useForm<UpdateDailyNotes>({
      resolver: zodResolver(UpdateNotesSchema) as any,
      defaultValues: {
          content: note?.content || ''
      }
  })

  const [prevNote, setPrevNote] = useState(note)
  if (note !== prevNote) {
    setPrevNote(note)
    reset({ content: note?.content || '' })
    setOptimisticContent(note?.content || '')
  }

  const { mutate: saveNote, isPending } = useMutation({
      mutationFn: async (data: UpdateDailyNotes) => {
          const result = await upsertDailyNote(dateStr, data.content || '')
          if (!result.success) throw new Error(result.message)
          return result
      },
      onSuccess: () => {
          toast.success("Note saved successfully")
          reset(undefined, { keepValues: true })
          router.refresh()
      },
      onError: (error: Error) => {
          toast.error(error.message || "Failed to save note")
          setOptimisticContent(note?.content || '')
      }
  })

  const onSubmit = (data: UpdateDailyNotes) => {
      setOptimisticContent(data.content || '')
      saveNote(data)
  }

if (!isExpanded) {
  const hasContent = !!optimisticContent.trim()
  return (
    <div
      onClick={onExpand}
      className="shrink-0 group cursor-pointer rounded-md border border-border bg-card hover:bg-secondary/40 transition-colors overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Daily Journal
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 group-hover:text-foreground/60 transition-colors">
          Edit →
        </span>
      </div>

      {/* Preview content */}
      <div className="px-4 py-3">
        <p className={`text-xs leading-relaxed line-clamp-2 font-mono ${hasContent ? 'text-foreground/60' : 'text-muted-foreground/40 italic'}`}>
          {optimisticContent || 'No entry for this date.'}
        </p>
      </div>
    </div>
  )
}

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 h-full">
      <div className="flex flex-col flex-1 h-full min-h-0 rounded-md border border-border bg-card overflow-hidden">

        {/* Header */}
        <div className="shrink-0 flex items-end justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Daily Journal
            </span>
            <span className="text-base font-medium tracking-tight text-foreground">
              {dateStr ? format(parseISO(dateStr), 'EEEE, MMMM do') : 'Notes'}
            </span>
          </div>

          <Button
            type="submit"
            disabled={isPending || !isDirty}
            variant="ghost"
            size="sm"
            className="text-xs uppercase tracking-widest font-semibold text-muted-foreground hover:text-foreground gap-2 disabled:opacity-30"
          >
            <Save className="w-3 h-3" />
            {isPending
                ? <span className='flex items-center gap-4'>Save <Spinner /></span>
                : 'Save'}
          </Button>
        </div>

        {/* Textarea — full height, flush, no border */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 relative">
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <textarea
                {...field}
                value={field.value || ''}
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
        <div className="shrink-0 flex items-center justify-between px-5 py-2 border-t border-border">
          <span className={`text-[10px] uppercase tracking-widest ${isDirty ? 'text-destructive' : 'text-muted-foreground/50'}`}>
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
        </div>

      </div>
    </form>
  )
}