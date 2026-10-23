import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { SideNav } from '../components/SideNav'
import { Table, type Column } from '../components/Table'
import { Tag, type TagTone } from '../components/Tag'
import { cx } from '../components/cx'
import {
  assignment,
  formatDate,
  klass,
  pastAssignments,
  students,
  teacher,
  unitAnalytics,
  upcomingAssignments,
} from '../data/mock'
import { useGrading } from '../state/grading'

type AssignmentRow = {
  id: string
  title: string
  submitted: number
  total: number
  graded: number
  dueDate: string
  live: boolean
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { stats } = useGrading()

  const average = stats.average != null ? Math.round(stats.average * 10) / 10 : null
  const fullyGraded = stats.graded >= stats.submitted

  const recent: AssignmentRow[] = [
    {
      id: assignment.id,
      title: assignment.fullTitle,
      submitted: stats.submitted,
      total: stats.total,
      graded: stats.graded,
      dueDate: assignment.dueDate,
      live: true,
    },
    ...pastAssignments.map((a) => ({
      id: a.id,
      title: a.fullTitle,
      submitted: a.submitted,
      total: a.total,
      graded: a.submitted,
      dueDate: a.dueDate,
      live: false,
    })),
  ]

  const columns: Column<AssignmentRow>[] = [
    { key: 'name', header: 'Assignment Name', width: 241, wrap: true, render: (r) => r.title },
    { key: 'class', header: 'Assigned to', width: 170, render: () => klass.name },
    { key: 'submitted', header: 'Submitted', width: 150, render: (r) => `${r.submitted}/${r.total} students` },
    {
      key: 'grading',
      header: 'Grading',
      width: 190,
      render: (r) =>
        r.graded < r.submitted ? (
          <Tag tone="warning">{`${r.graded}/${r.submitted} graded`}</Tag>
        ) : (
          <Tag tone="success">All graded</Tag>
        ),
    },
    { key: 'due', header: 'Due Date', width: 170, render: (r) => formatDate(r.dueDate, 'long') },
    {
      key: 'action',
      header: '',
      width: 200,
      render: (r) =>
        r.live && r.graded < r.submitted ? (
          <Button size="sm" onClick={() => navigate(`/assignments/${r.id}`)}>
            Continue grading
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            tone="neutral"
            onClick={r.live ? () => navigate(`/assignments/${r.id}`) : undefined}
          >
            View grades
          </Button>
        ),
    },
  ]

  // Bar chart: one bar per assignment in the unit, 32px per rubric point (Figma scale).
  const bars = [
    ...[...pastAssignments].reverse().map((a, i) => ({
      label: a.shortTitle,
      value: a.average as number | null,
      note: '',
      opacity: i === 0 ? 0.8 : 0.9,
    })),
    {
      label: assignment.shortTitle,
      value: average,
      note: fullyGraded ? '' : '*',
      opacity: fullyGraded ? 1 : 0.2,
    },
    ...upcomingAssignments.map((a) => ({ label: a.shortTitle, value: null, note: '', opacity: 1 })),
  ]

  const nameOf = (id: string) => students.find((s) => s.id === id)?.name ?? id

  return (
    <div className="flex min-h-screen">
      <SideNav active="dashboard" />
      <main className="flex min-w-0 flex-1 flex-col gap-8 pb-10 pl-9 pr-[50px] pt-10">
        {/* Header */}
        <header className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-f1 font-semibold text-ink">Good morning, {teacher.name}</h1>
            <p className="whitespace-pre text-base text-n4">{`${klass.name}  ·  ${stats.total} students`}</p>
          </div>
          <Button variant="ghost" tone="success" aria-haspopup="listbox" className="whitespace-pre">
            {`Class: ${klass.name}  ▾`}
          </Button>
        </header>

        {/* Recent Assignments */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-section font-semibold text-ink">Recent Assignments</h2>
            <Button size="sm" variant="ghost" tone="neutral" className="whitespace-pre" onClick={() => navigate('/assignments')}>
              {'All assignments  ›'}
            </Button>
          </div>
          <Table columns={columns} rows={recent} rowKey={(r) => r.id} className="p-2!" />
        </section>

        {/* Student Progress */}
        <section className="flex flex-col gap-4">
          <h2 className="text-section font-semibold text-ink">Student Progress</h2>
          <div className="flex items-stretch gap-4">
            <MetricCard
              label="Submission rate"
              value={`${unitAnalytics.submissionRate.value}%`}
              fill={unitAnalytics.submissionRate.value / 100}
              delta={unitAnalytics.submissionRate.delta}
              trend={unitAnalytics.submissionRate.trend}
            />
            <MetricCard
              label="On-time rate"
              value={`${unitAnalytics.onTimeRate.value}%`}
              fill={unitAnalytics.onTimeRate.value / 100}
              delta={unitAnalytics.onTimeRate.delta}
              trend={unitAnalytics.onTimeRate.trend}
            />
            <MetricCard
              label="Average score"
              value={average != null ? `${average.toFixed(1)} / 5` : '—'}
              fill={(average ?? 0) / 5}
              delta={unitAnalytics.averageDelta.delta}
              trend={unitAnalytics.averageDelta.trend}
            />
            <MetricCard
              label="To grade"
              value={String(stats.toGrade)}
              note={stats.toGrade > 0 ? `Oldest waiting ${unitAnalytics.oldestWaitingDays} days` : 'All caught up'}
            />
          </div>

          <div className="flex items-stretch gap-4">
            <Card className="flex min-w-0 flex-1 flex-col gap-4 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-f5 font-semibold text-ink">Average score by assignment</h3>
                <p className="whitespace-nowrap text-xs text-n4">Out of 5 · Unit 9.1</p>
              </div>
              {/* Bars and labels are separate rows so wrapped labels never shift the bar baseline. */}
              <div role="img" aria-label={chartLabel(bars)} className="flex flex-col gap-1">
                <div className="flex items-end gap-4">
                  {bars.map((b) => (
                    <div key={b.label} className="flex min-w-0 flex-1 flex-col gap-1">
                      {b.value != null ? (
                        <p className="text-f6 font-normal tracking-normal text-black">
                          {b.value.toFixed(1)}
                          {b.note}
                        </p>
                      ) : (
                        <p className="text-sm font-semibold leading-[1.4] text-ink">—</p>
                      )}
                      <div
                        className={cx('w-full rounded-t', b.value == null && 'bg-n8')}
                        style={
                          b.value != null
                            ? { height: b.value * 32, backgroundColor: `rgb(232 108 0 / ${b.opacity})` }
                            : { height: 6 }
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-4">
                  {bars.map((b) => (
                    <p key={b.label} className="min-w-0 flex-1 text-xs font-semibold text-black">
                      {b.label}
                    </p>
                  ))}
                </div>
              </div>
              {!fullyGraded && (
                <p className="text-xs text-n4">
                  * {stats.graded} of {stats.submitted} submissions graded so far
                </p>
              )}
            </Card>

            <Card className="flex min-w-[360px] shrink basis-[520px] flex-col gap-2 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-f5 font-semibold text-ink">Students to check in on</h3>
                <p className="text-xs leading-[1.4] text-n4">{unitAnalytics.checkIns.length} flagged</p>
              </div>
              <ul>
                {unitAnalytics.checkIns.map((c) => (
                  <li key={c.studentId} className="flex items-center gap-3 border-t border-border py-2.5">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="text-base text-ink">{nameOf(c.studentId)}</p>
                      <p className="text-xs text-n4">{c.note}</p>
                    </div>
                    <Tag tone={c.tone}>{c.tag}</Tag>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Learning Objective Trends */}
        <section className="flex flex-col gap-4">
          <h2 className="text-section font-semibold text-ink">Learning Objective Trends</h2>
          <Card className="flex flex-col gap-3.5 p-5">
            {unitAnalytics.objectives.map((o) => {
              const style = OBJECTIVE_STATUS[o.status]
              const meta =
                o.average == null
                  ? 'Not yet assessed'
                  : o.live
                    ? `${o.average.toFixed(1)} avg · ${stats.graded}/${stats.submitted} graded`
                    : `${o.average.toFixed(1)} avg`
              return (
                <div key={o.text} className="flex items-center gap-5 py-1.5">
                  <div className="flex min-w-[260px] shrink basis-[470px] flex-col">
                    <p className="text-base text-ink">{o.text}</p>
                    <p className="text-xs text-n4">Assessed in {o.assessedIn}</p>
                  </div>
                  <div
                    role="img"
                    aria-label={o.percent != null ? `${o.percent}% of students meeting this objective` : 'Not yet assessed'}
                    className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-[5px] bg-track"
                  >
                    <div
                      className={cx('h-full rounded-[5px]', style.bar)}
                      style={{ width: o.percent != null ? `${o.percent}%` : 2 }}
                    />
                  </div>
                  <p className="w-40 shrink-0 text-xs text-n4">{meta}</p>
                  <div className="flex w-[120px] shrink-0 justify-end">
                    <Tag tone={style.tone}>{style.label}</Tag>
                  </div>
                </div>
              )
            })}
          </Card>
        </section>
      </main>
    </div>
  )
}

const OBJECTIVE_STATUS: Record<
  (typeof unitAnalytics.objectives)[number]['status'],
  { label: string; tone: TagTone; bar: string }
> = {
  on_track: { label: 'On track', tone: 'success', bar: 'bg-trend-up' },
  in_progress: { label: 'In progress', tone: 'warning', bar: 'bg-primary' },
  needs_support: { label: 'Needs support', tone: 'error', bar: 'bg-trend-down' },
  upcoming: { label: 'Upcoming', tone: 'neutral', bar: 'bg-n4' },
}

function MetricCard({
  label,
  value,
  fill,
  delta,
  trend,
  note,
}: {
  label: string
  value: string
  fill?: number
  delta?: string
  trend?: 'up' | 'down'
  note?: string
}) {
  return (
    <Card className="flex min-w-0 flex-1 flex-col gap-1.5 p-5">
      <p className="text-base text-n4">{label}</p>
      <p className="text-f3 font-semibold text-ink">{value}</p>
      {fill != null && (
        <div className="h-2 w-full overflow-hidden rounded bg-track">
          <div className="h-full rounded bg-primary" style={{ width: `${Math.min(1, fill) * 100}%` }} />
        </div>
      )}
      {delta && (
        <p className={cx('text-xs font-semibold', trend === 'down' ? 'text-trend-down' : 'text-trend-up')}>{delta}</p>
      )}
      {note && <p className="text-xs font-semibold text-n4">{note}</p>}
    </Card>
  )
}

function chartLabel(bars: { label: string; value: number | null }[]) {
  return (
    'Average score by assignment: ' +
    bars.map((b) => `${b.label} ${b.value != null ? b.value.toFixed(1) : 'not yet assessed'}`).join(', ')
  )
}
