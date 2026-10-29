import type { ReactNode } from 'react'
export default function ViewTabs({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <nav className="view-tabs" aria-label={label}>
      {children}
    </nav>
  )
}
