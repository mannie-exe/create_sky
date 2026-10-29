import type { ComponentPropsWithoutRef } from 'react'
import type { FeedbackTone } from '../../lib/ui'

type Props = ComponentPropsWithoutRef<'p'> & { tone?: FeedbackTone }
export default function Feedback({
  tone = 'neutral',
  role,
  className = '',
  ...props
}: Props) {
  return (
    <p
      {...props}
      className={`feedback ${className}`}
      data-tone={tone}
      role={role ?? (tone === 'error' ? 'alert' : undefined)}
    />
  )
}
