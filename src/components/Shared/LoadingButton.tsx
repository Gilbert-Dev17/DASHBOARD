import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
  /** Replaces children while loading, e.g. "Adding". */
  loadingText?: React.ReactNode
  /** Leading icon. The spinner takes its place while loading. */
  icon?: React.ReactNode
}

/** The one button that shows a spinner while pending: `<button><spinner/>{title}</button>`. */
export function LoadingButton({ loading = false, loadingText, icon, children, disabled, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading ? <Spinner /> : icon}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}
