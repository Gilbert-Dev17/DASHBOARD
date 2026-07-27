import {
    Card, CardHeader, CardContent, CardTitle,CardFooter
} from '@/components/ui/card'
import { PenBox } from 'lucide-react'
import { Textarea } from '../ui/textarea'
import { Notes } from '@/types/dashboard'
import { Button } from '../ui/button'
import { useMutation } from '@tanstack/react-query'


interface NotesProps {
    note: Notes | null;
}

export const NotesSection = ({ note }: NotesProps) => {

    console.log(note)
  return (
    <Card>
        <CardHeader>
            <CardTitle className='flex gap-2 items-center'>
                <PenBox size={16} />
                Notes
            </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
            <Textarea
                className='w-full min-h-40 p-4 text-sm leading-relaxed'
                placeholder='Journal something in here...'
                spellCheck={true}
                autoFocus
            />
            <div className='flex justify-end'>
                <Button className=''>Save</Button>
            </div>
        </CardContent>
    </Card>
  )
}