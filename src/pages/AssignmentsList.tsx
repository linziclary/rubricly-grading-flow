import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { SideNav } from '../components/SideNav'
import { Table } from '../components/Table'
import { Tag } from '../components/Tag'
import { assignment, formatDate, klass, pastAssignments, upcomingAssignments } from '../data/mock'
import { useGrading } from '../state/grading'

/** Simple placeholder list behind "All assignments" (not a designed screen). */
export default function AssignmentsList() {
  const navigate = useNavigate()
  const { stats } = useGrading()

  const rows = [
    ...upcomingAssignments.map((a) => ({ id: a.id, title: a.fullTitle, due: a.dueDate, state: 'upcoming' as const })),
    { id: assignment.id, title: assignment.fullTitle, due: assignment.dueDate, state: 'live' as const },
    ...pastAssignments.map((a) => ({ id: a.id, title: a.fullTitle, due: a.dueDate, state: 'done' as const })),
  ]

  return (
    <div className="flex min-h-screen">
      <SideNav active="assignments" />
      <main className="flex min-w-0 flex-1 flex-col gap-6 pb-10 pl-9 pr-[50px] pt-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-f2 font-semibold text-ink">My Assignments</h1>
          <p className="text-base text-n4">{klass.name} · Unit 9.1</p>
        </div>
        <Table
          rows={rows}
          rowKey={(r) => r.id}
          className="p-2!"
          columns={[
            { key: 'name', header: 'Assignment Name', width: 400, wrap: true, render: (r) => r.title },
            { key: 'due', header: 'Due Date', width: 200, render: (r) => formatDate(r.due, 'long') },
            {
              key: 'status',
              header: 'Status',
              width: 200,
              render: (r) =>
                r.state === 'upcoming' ? (
                  <Tag tone="neutral">Upcoming</Tag>
                ) : r.state === 'done' || stats.graded >= stats.submitted ? (
                  <Tag tone="success">All graded</Tag>
                ) : (
                  <Tag tone="warning">{`${stats.graded}/${stats.submitted} graded`}</Tag>
                ),
            },
            {
              key: 'action',
              header: '',
              width: 200,
              render: (r) =>
                r.state === 'live' ? (
                  <Button size="sm" onClick={() => navigate(`/assignments/${r.id}`)}>
                    Open
                  </Button>
                ) : null,
            },
          ]}
        />
      </main>
    </div>
  )
}
