import type { ReactNode } from 'react'

/** List/editor composition only. Selection, drafts and saving stay with the caller. */
export default function Workbench({
  browser,
  children,
}: {
  browser: ReactNode
  children: ReactNode
}) {
  return (
    <div className="workbench">
      <aside className="workbench-browser content-stack">{browser}</aside>
      <div className="entry-editor">{children}</div>
    </div>
  )
}
