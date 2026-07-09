'use client'

import { useCallback, useState } from 'react'
import { useGlobalShortcut } from '@/hooks/useGlobalShortcut'
import { DefaultValues, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { CATEGORY_LABELS } from '../modals/add-planner/constants'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '../ui/label'
import {
  Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger,
} from "@/components/ui/popover"
import {
  Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export const QuickAddModal = () => {
  const [ open, setOpen ] = useState(false);
  const handleTrigger = useCallback(() => setOpen((prev) => !prev), []);
  useGlobalShortcut({ key: 'k', onTrigger: handleTrigger });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className=" rounded-full transition-all duration-300 hover:scale-105"
          aria-label="Open planner"
        >
          <Plus size={18} strokeWidth={2.5} aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">

        <DialogHeader>
          <DialogTitle className='font-bold'>Plan your day</DialogTitle>
          <DialogDescription>
            Add one or more tasks. Each needs a name, category, and time.
          </DialogDescription>
        </DialogHeader>

        <Label className='font-bold tracking-widest uppercase'>one task per line, then enter for subtask: Buy groceries @errands 10:00</Label>
        <Textarea placeholder='Buy groceries @errands 10:00' ></Textarea>

        <DialogFooter>
          <Button className='w-full'>
            Add task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function parseTask(line: string) {
  const regex =
    /^(.*?)\s*(?:@([a-zA-Z-]+))?\s*(?:([01]?\d|2[0-3]):([0-5]\d))?$/;

  const match = line.trim().match(regex);

  if (!match) return null;

  return {
    task_name: match[1].trim(),
    category: match[2] ?? null,
    time:
      match[3] && match[4]
        ? `${match[3].padStart(2, "0")}:${match[4]}`
        : null,
  };
}