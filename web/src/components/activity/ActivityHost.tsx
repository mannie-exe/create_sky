import { useEffect, useState, useSyncExternalStore } from 'react'
import { activity, refreshActivity, watchActivity } from '../../lib/activity'
import { requestJSON } from '../../lib/http'
import ActivityPanel from './ActivityPanel'
import Button from '../ui/Button'
import Disclosure from '../ui/Disclosure'

export default function ActivityHost({
  live = false,
  presentation = 'disclosure',
}: {
  live?: boolean
  presentation?: 'disclosure' | 'panel'
}) {
  const state = useSyncExternalStore(
    activity.subscribe,
    activity.getSnapshot,
    activity.getSnapshot,
  )
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (live) return watchActivity()
    activity.update({ connection: 'static' })
  }, [live])
  async function cancel(id: string) {
    try {
      await requestJSON('/__atlas/jobs/cancel', { id })
      await refreshActivity()
    } catch (error) {
      activity.notify(String(error), { tone: 'error' })
    }
  }
  const label =
    state.connection === 'offline'
      ? 'Activity · disconnected'
      : state.current
        ? `Activity · ${state.current.label}`
        : 'Activity'
  return (
    <>
      {presentation === 'panel' ? (
        <section className="content-stack" aria-label="Activity">
          <h2 data-text-role="section-title">Activity</h2>
          <ActivityPanel
            state={state}
            cancel={live ? cancel : undefined}
            retry={live ? () => void refreshActivity() : undefined}
          />
        </section>
      ) : (
        (live || state.notices.length > 0) && (
          <div className="activity-control">
            <Disclosure
              id="job-status"
              open={open}
              onToggle={(event) => setOpen(event.currentTarget.open)}
              summary={<span id="job-summary">{label}</span>}
            >
              <ActivityPanel
                state={state}
                cancel={live ? cancel : undefined}
                retry={live ? () => void refreshActivity() : undefined}
              />
            </Disclosure>
          </div>
        )
      )}
      <div className="toast-region" aria-label="Notifications">
        {state.toasts.map((notice) => (
          <div
            className="toast content-stack"
            data-space="control"
            key={notice.id}
            onMouseEnter={() => activity.pause(notice.id)}
            onMouseLeave={(event) => {
              if (!event.currentTarget.contains(document.activeElement))
                activity.resume(notice.id)
            }}
            onFocusCapture={() => activity.pause(notice.id)}
            onBlurCapture={(event) => {
              if (
                !event.currentTarget.contains(event.relatedTarget) &&
                !event.currentTarget.matches(':hover')
              )
                activity.resume(notice.id)
            }}
          >
            <p role={notice.tone === 'error' ? 'alert' : 'status'}>
              {notice.message}
            </p>
            <div className="action-row">
              <Button onClick={() => activity.dismiss(notice.id)}>
                Dismiss
              </Button>
              {notice.href && <a href={notice.href}>Open view</a>}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
