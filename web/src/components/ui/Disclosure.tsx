import type { ComponentPropsWithoutRef, ReactNode } from 'react'
type Props = Omit<ComponentPropsWithoutRef<'details'>, 'children'> & {
  summary: ReactNode
  children: ReactNode
  spacing?: 'control' | 'section'
}
/** Native disclosure behavior; the body, never details itself, owns flow layout. */
export default function Disclosure({
  summary,
  children,
  spacing,
  className = '',
  ...props
}: Props) {
  return (
    <details {...props} className={`disclosure ${className}`}>
      <summary>{summary}</summary>
      <div className="content-stack" data-space={spacing}>
        {children}
      </div>
    </details>
  )
}
