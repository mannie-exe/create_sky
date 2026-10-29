import { useId, type ReactNode } from 'react'
import { fieldControl } from '../../lib/fields'
import Feedback from './Feedback'

type Props = {
  layout?: 'stacked' | 'inline'
  id?: string
  label: ReactNode
  hint?: ReactNode
  error?: string
  className?: string
  children: (attributes: ReturnType<typeof fieldControl>) => ReactNode
}
/** The caller owns the control and validation; this owns its accessible relationships. */
export default function Field({
  id,
  layout = 'stacked',
  label,
  hint,
  error,
  children,
  className = '',
}: Props) {
  const generated = useId()
  const control = fieldControl(id || generated, {
    hint: Boolean(hint),
    error: Boolean(error),
  })
  return (
    <div className={`field ${className}`} data-layout={layout}>
      <label htmlFor={control.id}>{label}</label>
      {children(control)}
      {hint && (
        <p id={`${control.id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <Feedback id={`${control.id}-error`} tone="error">
          {error}
        </Feedback>
      )}
    </div>
  )
}
