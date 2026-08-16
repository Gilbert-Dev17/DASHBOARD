import { Notes } from '@/types/dashboard'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { useMutation } from '@tanstack/react-query'

import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { upsertDailyNote } from '@/lib/actions/daily-notes'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Save, FileText } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerHeader, DrawerFooter } from '@/components/ui/drawer'
import { Empty, EmptyContent, EmptyMedia, EmptyDescription } from '@/components/ui/empty'

interface NotesProps {
    note: Notes | null;
    dateStr: string;
}

const UpdateNotesSchema = z.object({
    content: z.string().nullable()
})

type UpdateDailyNotes = z.infer<typeof UpdateNotesSchema>

export const NotesSection = ({ note, dateStr }: NotesProps) => {
  const [isOpen, setIsOpen] = useState(false)

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

  const hasContent = !!optimisticContent.trim()

  const previewUi = (
    <button
      type="button"
      className="w-full text-left shrink-0 group cursor-pointer rounded-md border border-border bg-card hover:bg-secondary/40 transition-colors overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Daily Journal
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/50 group-hover:text-foreground/60 transition-colors">
          Edit →
        </span>
      </div>

      {/* Preview content */}
      <div className="px-4 py-3">
        {hasContent ? (
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

      {/* Textarea — full height, flush, no border */}
      <div className="flex-1 min-h-0 relative">
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
      <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
        <span className={`font-mono text-[11px] uppercase tracking-wider ${isDirty ? 'text-destructive' : 'text-muted-foreground/50'}`}>
          {isDirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
      </div>
    </form>
  )

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} swipeDirection="right">
      <DrawerTrigger render={previewUi} />
      <DrawerContent className="w-full sm:w-115 rounded-md">
        {editorUi}
      </DrawerContent>
    </Drawer>
  )
}