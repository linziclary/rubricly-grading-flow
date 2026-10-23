import { useState, type ReactNode } from 'react'
import { Button, type ButtonTone, type ButtonVariant } from '../components/Button'
import { Card, StatCard } from '../components/Card'
import { Modal } from '../components/Modal'
import { Radio } from '../components/Radio'
import { SideNav } from '../components/SideNav'
import { Table } from '../components/Table'
import { Tag, type TagTone } from '../components/Tag'
import { TextArea } from '../components/TextArea'
import { Toast } from '../components/Toast'

const tones: ButtonTone[] = ['primary', 'neutral', 'success', 'warning']
const variants: ButtonVariant[] = ['filled', 'ghost', 'borderless']
const tagTones: TagTone[] = ['neutral', 'info', 'success', 'warning', 'error']

type Row = { name: string; submitted: string; status: ReactNode; score: string; action: ReactNode }
const rows: Row[] = [
  { name: 'Maya Chen', submitted: 'Jan 29, 2025', status: <Tag tone="warning">In progress</Tag>, score: '—', action: <Button size="sm">Resume grading</Button> },
  { name: 'Aiden Brooks', submitted: 'Jan 28, 2025', status: <Tag tone="info">Ready to grade</Tag>, score: '—', action: <Button size="sm">Grade</Button> },
  { name: 'Jordan Ellis', submitted: 'Jan 27, 2025', status: <Tag tone="success">Graded</Tag>, score: '4 – Good', action: <Button size="sm" variant="ghost" tone="neutral">Revise</Button> },
]

export default function ComponentGallery() {
  const [radio, setRadio] = useState('a')
  const [text, setText] = useState('Maya, you named a really specific habit — gaming while you watch TV.')
  const [modal, setModal] = useState(false)

  return (
    <div className="flex min-h-screen">
      <SideNav active="dashboard" />
      <SideNav collapsed active="dashboard" />
      <main className="flex min-w-0 flex-1 flex-col gap-10 px-9 py-10">
        <header>
          <h1 className="text-f1 font-semibold">Base components</h1>
          <p className="text-base text-n4">Dialect building blocks for the Rubricly prototype. Both nav variants are shown on the left.</p>
        </header>

        <Section title="Button">
          {(['md', 'sm'] as const).map((size) => (
            <div key={size} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-n5">{size}</p>
              {variants.map((v) => (
                <div key={v} className="flex flex-wrap items-center gap-3">
                  <span className="w-24 text-sm text-n4">{v}</span>
                  {tones.map((t) => (
                    <Button key={t} variant={v} tone={t} size={size}>
                      {t}
                    </Button>
                  ))}
                  <Button variant={v} size={size} disabled>
                    disabled
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </Section>

        <Section title="Tag">
          {(['inverted', 'filled', 'plain'] as const).map((v) => (
            <div key={v} className="flex flex-wrap items-center gap-2">
              <span className="w-24 text-sm text-n4">{v}</span>
              {tagTones.map((t) => (
                <Tag key={t} tone={t} variant={v}>
                  {t}
                </Tag>
              ))}
            </div>
          ))}
        </Section>

        <Section title="Card">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <StatCard value="18 / 20" label="Submitted" />
                <StatCard value="6" label="Graded" />
              </div>
            </div>
            <Card tone="accent" className="flex items-start gap-6">
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-f6 font-semibold">Lesson objectives</p>
                <ul className="text-sm leading-[1.4]">
                  <li>• Interpret the “why” behind their digital habits</li>
                  <li>• Critique how their digital habits impact their lives</li>
                </ul>
              </div>
              <Button variant="ghost" tone="warning" size="sm">
                View rubric
              </Button>
            </Card>
          </div>
        </Section>

        <Section title="Table">
          <Table
            rows={rows}
            rowKey={(r) => r.name}
            columns={[
              { key: 'name', header: 'Student', width: 291, wrap: true, render: (r) => r.name },
              { key: 'submitted', header: 'Submitted', width: 200, render: (r) => r.submitted },
              { key: 'status', header: 'Status', width: 220, render: (r) => r.status },
              { key: 'score', header: 'Score', width: 180, render: (r) => r.score },
              { key: 'action', header: '', width: 200, render: (r) => r.action },
            ]}
          />
        </Section>

        <Section title="Radio and TextArea">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <Radio name="demo" value="a" label="Option A" checked={radio === 'a'} onChange={setRadio} />
              <Radio name="demo" value="b" label="Option B" checked={radio === 'b'} onChange={setRadio} />
            </div>
            <TextArea label="Comment" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} />
          </div>
        </Section>

        <Section title="Modal and Toast">
          <div className="flex flex-col items-start gap-6">
            <Button onClick={() => setModal(true)}>Open modal</Button>
            <Toast
              message="✓  Grade submitted for Maya Chen · 3 – Satisfactory"
              actions={
                <>
                  <Button variant="borderless" tone="neutral" size="sm">
                    Undo
                  </Button>
                  <Button size="sm">Grade next: Aiden Brooks  ›</Button>
                </>
              }
            />
          </div>
        </Section>
      </main>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Submit grade for Maya Chen?"
        actions={
          <>
            <Button variant="borderless" tone="neutral" onClick={() => setModal(false)}>
              Keep editing
            </Button>
            <Button variant="ghost">Submit &amp; back to roster</Button>
            <Button>Submit &amp; next student</Button>
          </>
        }
      >
        <p className="text-sm leading-[1.4] text-n3">
          Maya will see her score and your feedback in her workbook. You can still revise it later from the roster.
        </p>
      </Modal>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-f5 font-semibold">{title}</h2>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-6">{children}</div>
    </section>
  )
}
