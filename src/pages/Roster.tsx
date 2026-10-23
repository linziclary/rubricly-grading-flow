import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card, StatCard } from '../components/Card'
import { RubricModal } from '../components/RubricModal'
import { SideNav } from '../components/SideNav'
import { Table, type Column } from '../components/Table'
import { Tag, type TagTone } from '../components/Tag'
import { assignment, formatDate, klass, scoreLabel } from '../data/mock'
import { useGrading, type GradeStatus, type RosterRow } from '../state/grading'
import { SubmittedToast } from './SubmittedToast'

type Filter = 'all' | GradeStatus

const FILTERS: { key: Filter; label: string; tone: TagTone }[] = [
  { key: 'all', label: 'All', tone: 'neutral' },
  { key: 'ready', label: 'Ready to grade', tone: 'info' },
  { key: 'in_progress', label: 'In progress', tone: 'warning' },
  { key: 'graded', label: 'Graded', tone: 'success' },
  { key: 'not_submitted', label: 'Not submitted', tone: 'neutral' },
]

export const gradePath = (studentId: string) => `/assignments/${assignment.id}/grade/${studentId}`

export default function Roster() {
  const navigate = useNavigate()
  const { rows, stats, lastSubmitted } = useGrading()
  const [filter, setFilter] = useState<Filter>('all')
  const [rubricOpen, setRubricOpen] = useState(false)

  const counts: Record<Filter, number> = {
    all: stats.total,
    ready: stats.ready,
    in_progress: stats.inProgress,
    graded: stats.graded,
    not_submitted: stats.notSubmitted,
  }
  const visible = filter === 'all' ? rows : rows.filter((r) => r.status === filter)
  const next = stats.queue[0]

  const columns: Column<RosterRow>[] = [
    { key: 'name', header: 'Student', width: 469, wrap: true, render: (r) => r.name },
    { key: 'submitted', header: 'Submitted', width: 200, render: (r) => (r.submittedAt ? formatDate(r.submittedAt) : '—') },
    { key: 'status', header: 'Status', width: 220, render: (r) => <StatusTag row={r} /> },
    { key: 'score', header: 'Score', width: 180, render: (r) => (r.gradedScore != null && r.status === 'graded' ? scoreLabel(r.gradedScore) : '—') },
    {
      key: 'action',
      header: <span className="sr-only">Action</span>,
      width: 200,
      render: (r) => {
        switch (r.status) {
          case 'in_progress':
            return (
              <Button size="sm" onClick={() => navigate(gradePath(r.id))}>
                Resume grading
              </Button>
            )
          case 'ready':
            return (
              <Button size="sm" onClick={() => navigate(gradePath(r.id))}>
                Grade
              </Button>
            )
          case 'graded':
            return (
              <Button size="sm" variant="ghost" tone="success" onClick={() => navigate(gradePath(r.id))}>
                Revise
              </Button>
            )
          case 'not_submitted':
            // Visual only in the prototype.
            return (
              <Button size="sm" variant="ghost">
                Extend due date
              </Button>
            )
        }
      },
    },
  ]

  return (
    <div className="flex min-h-screen">
      <SideNav collapsed active="dashboard" />
      <main className="flex min-w-0 flex-1 flex-col gap-6 py-8 pl-8 pr-10">
        <nav aria-label="Breadcrumb" className="whitespace-pre text-base font-semibold text-n4">
          <Link to="/assignments" className="hover:text-ink hover:underline">
            Assignments
          </Link>
          {'  /  '}
          <span aria-current="page">{assignment.fullTitle}</span>
        </nav>

        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-f1 font-semibold text-ink">{assignment.fullTitle}</h1>
            <p className="whitespace-pre text-base text-n4">
              {`${klass.name}  ·  Due ${formatDate(assignment.dueDate, 'long')}  ·  Workbook pages 1–${assignment.pages.length}`}
            </p>
          </div>
          <Button tone="success" disabled={!next} onClick={() => next && navigate(gradePath(next.id))}>
            Start grading
          </Button>
        </div>

        <div className="flex items-stretch gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex gap-2">
              <StatCard value={`${stats.submitted} / ${stats.total}`} label="Submitted" />
              <StatCard value={String(stats.graded)} label="Graded" />
            </div>
            <div className="flex gap-2">
              <StatCard value={String(stats.ready)} label="Ready to grade" />
              <StatCard value={stats.average != null ? stats.average.toFixed(1) : '—'} label="Class average" />
            </div>
          </div>
          <Card tone="accent" className="flex min-w-0 flex-1 items-start gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-2 text-ink">
              <h2 className="text-f6 font-semibold">Lesson objectives</h2>
              <ul className="text-sm leading-[1.4]">
                {assignment.objectives.map((o) => (
                  <li key={o}>• {o}</li>
                ))}
              </ul>
            </div>
            <Button size="sm" variant="ghost" tone="warning" onClick={() => setRubricOpen(true)}>
              View rubric
            </Button>
          </Card>
        </div>

        <div role="group" aria-label="Filter students" className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <Tag
              key={f.key}
              tone={f.tone}
              variant={filter === f.key ? 'filled' : 'outlined'}
              pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {`${f.label} · ${counts[f.key]}`}
            </Tag>
          ))}
        </div>

        <Table
          columns={columns}
          rows={visible}
          rowKey={(r) => r.id}
          empty="No students match this filter."
          highlightKey={lastSubmitted?.studentId}
        />
      </main>

      <RubricModal open={rubricOpen} onClose={() => setRubricOpen(false)} />
      <SubmittedToast onGradeNext={(id) => navigate(gradePath(id))} />
    </div>
  )
}

export function StatusTag({ row }: { row: Pick<RosterRow, 'status' | 'late'> }) {
  switch (row.status) {
    case 'in_progress':
      return <Tag tone="warning">In progress</Tag>
    case 'ready':
      return row.late ? <Tag tone="error">Late · Ready</Tag> : <Tag tone="info">Ready to grade</Tag>
    case 'graded':
      return <Tag tone="success">Graded</Tag>
    case 'not_submitted':
      return <Tag tone="neutral">Not submitted</Tag>
  }
}
