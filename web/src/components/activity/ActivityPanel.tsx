import Button from '../ui/Button'
import Disclosure from '../ui/Disclosure'
import Feedback from '../ui/Feedback'
import type { ActivityState, Operation } from '../../lib/activity'

const labels = {
  running: 'Running',
  succeeded: 'Finished',
  failed: 'Failed',
  cancelled: 'Cancelled',
}
function Result({ operation }: { operation: Operation }) {
  return (
    <li className="activity-result content-stack" data-space="control">
      <div className="section-heading">
        <strong>{operation.label}</strong>
        <span data-tone={operation.state === 'failed' ? 'error' : undefined}>
          {labels[operation.state]}
        </span>
      </div>
      <p>{operation.message}</p>
      <div className="action-row scope">
        <time dateTime={operation.finishedAt ?? operation.startedAt}>
          {new Date(
            operation.finishedAt ?? operation.startedAt,
          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
        <a href={operation.href}>Open view</a>
      </div>
    </li>
  )
}
export default function ActivityPanel({
  state,
  cancel,
  retry,
}: {
  state: ActivityState
  cancel?: (id: string) => void
  retry?: () => void
}) {
  const current = state.current
  return (
    <div className="activity-panel content-stack">
      {state.connection === 'offline' && (
        <Feedback tone="error">
          Workspace unavailable. Last known results are shown; a running
          action’s outcome is not yet known.
        </Feedback>
      )}
      {state.connection === 'offline' && retry && (
        <div className="action-row">
          <Button onClick={retry}>Reconnect</Button>
        </div>
      )}
      {state.connection === 'connecting' && <p>Connecting to workspace…</p>}
      {current && (
        <section
          className="content-stack"
          data-space="control"
          aria-label="Current operation"
        >
          <strong>{current.label}</strong>
          <p>
            {state.connection === 'offline' ? 'Last seen running' : 'Running'}
            {current.job ? ` · ${current.job.name}` : ''}
          </p>
          {current.job?.diagnostic && (
            <Disclosure summary={<>Diagnostics</>}>
              <pre id="job-diagnostic">{current.job.diagnostic}</pre>
            </Disclosure>
          )}
          {current.job?.cancellable && cancel && (
            <div className="action-row">
              <Button
                id="cancel-job"
                disabled={state.connection === 'offline'}
                onClick={() => cancel(current.job!.id)}
              >
                Cancel job
              </Button>
            </div>
          )}
        </section>
      )}
      {!current && !state.history.length && <p>No recent operations.</p>}
      {!!state.history.length && (
        <ol className="activity-results">
          {state.history.map((operation) => (
            <Result key={operation.id} operation={operation} />
          ))}
        </ol>
      )}
      {!!state.notices.filter(
        (notice) =>
          !state.history.some((operation) => operation.id === notice.id),
      ).length && (
        <Disclosure summary={<>Other messages</>}>
          {state.notices
            .filter(
              (notice) =>
                !state.history.some((operation) => operation.id === notice.id),
            )
            .map((notice) => (
              <Feedback key={notice.id} tone={notice.tone} role="note">
                {notice.message}
              </Feedback>
            ))}
        </Disclosure>
      )}
      <p className="scope">
        Recent operations last for this workspace server session. Messages last
        for this page session.
      </p>
    </div>
  )
}
