import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import Field from './Field'
type Props = Omit<
  ComponentPropsWithoutRef<'textarea'>,
  'children' | 'className'
> & {
  label: string
  hint?: ReactNode
  error?: string
  actions?: ReactNode
}
/** Source text presentation only; parsing, draft retention and applying remain caller-owned. */
export default function SourceEditor({
  id,
  label,
  hint,
  error,
  actions,
  'aria-describedby': describedBy,
  ...props
}: Props) {
  return (
    <div className="content-stack" data-space="control">
      <Field id={id} label={label} hint={hint} error={error}>
        {(attributes) => (
          <textarea
            {...attributes}
            spellCheck={false}
            {...props}
            aria-describedby={
              [attributes['aria-describedby'], describedBy]
                .filter(Boolean)
                .join(' ') || undefined
            }
            className="source-editor"
          />
        )}
      </Field>
      {actions && <div className="action-row">{actions}</div>}
    </div>
  )
}
