'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeaderTitle } from '@/components/Shared/HeaderTitle'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  desc?: string
  showBackButton?: boolean
  backAction?: () => void
  children?: React.ReactNode
}

export function PageHeader({
  title,
  desc = "",
  showBackButton = true,
  backAction,
  children
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backAction) {
      backAction()
    } else {
      router.back()
    }
  }

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 mb-6">
      <div className="flex flex-row items-center gap-2">
        {showBackButton && (
          <Button
            variant="link"
            size="icon"
            className="group h-8 px-2 text-muted-foreground hover:text-foreground w-fit"
            onClick={handleBack}
          >
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
          </Button>
        )}
        <HeaderTitle title={title} desc={desc} />
      </div>

      {children}
    </header>
  )
}
