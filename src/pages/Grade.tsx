import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { RadioDot } from '../components/Radio'
import { Sheet } from '../components/Sheet'
import { SideNav } from '../components/SideNav'
import { SubmitModal } from '../components/SubmitModal'
import { TextArea } from '../components/TextArea'
import { cx } from '../components/cx'
import { WorkbookViewer } from '../components/WorkbookViewer'
import { assignment, firstName, formatDate, rubric, scoreLabel } from '../data/mock'
import { useGrading, type GradeRecord } from '../state/grading'
import { gradePath, StatusTag } from './Roster'
import { SubmittedToast } from './SubmittedToast'

const ROSTER = `/assignments/${assignment.id}`
const FEEDBACK_MAX = 1000

export default function GradePage() {
  const { studentId = '' } = useParams()
  const { rows } = useGrading()
  const student = rows.find((r) => r.id === studentId)
  if (!student || student.status === 'not_submitted') return <Navigate to={ROSTER} replace />
  // Key by student so per-student UI state (typing, undo buffer, sheets) resets on navigation.
  return <GradeView key={student.id} studentId={student.id} />
}

function GradeView({ studentId }: { studentId: string }) {
  const navigate = useNavigate()
  const { rows, stats, records, setDraft, submit, nextToGrade } = useGrading()
  const student = rows.find((r) => r.id === studentId)!
  const record = records[studentId]
  const first = firstName(student.name)

  const [reasoningOpen, setReasoningOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [undoText, setUndoText] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const typingTimer = useRef<number | null>(null)
  const saveTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (typingTimer.current) window.clearInterval(typingTimer.current)
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    },
    [],
  )

  // "Draft saved automatically" settles ~1s after the last change.
  const markChanged = useCallback(() => {
    setSaving(true)
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => setSaving(false), 1000)
  }, [])

  const update = (patch: Partial<Pick<GradeRecord, 'draftScore' | 'draftFeedback'>>) => {
    setDraft(studentId, patch)
    markChanged()
  }

  // Queue position: the student's place among those still to grade.
  const queueIndex = stats.queue.findIndex((r) => r.id === studentId)
  const navList = queueIndex >= 0 ? stats.queue : rows.filter((r) => r.id === studentId || stats.queue.includes(r))
  const navIndex = navList.findIndex((r) => r.id === studentId)
  const prev = navList[navIndex - 1]
  const next = navList[navIndex + 1]
  const nextAfterSubmit = nextToGrade(studentId)

  const draftWithAI = () => {
    const target = assignment.ai.draftFeedback(first)
    setUndoText(record.draftFeedback)
    setDrafting(true)
    let i = 0
    if (typingTimer.current) window.clearInterval(typingTimer.current)
    typingTimer.current = window.setInterval(() => {
      i = Math.min(target.length, i + 4)
      setDraft(studentId, { draftFeedback: target.slice(0, i) })
      if (i >= target.length) {
        window.clearInterval(typingTimer.current!)
        typingTimer.current = null
        setDrafting(false)
        markChanged()
      }
    }, 16)
  }

  const undoDraft = () => {
    if (undoText == null) return
    update({ draftFeedback: undoText })
    setUndoText(null)
  }

  // Submit & next student; when nobody is left to grade, land on the roster instead.
  const submitAndNext = () => {
    if (record.draftScore == null) return
    submit(studentId)
    setSubmitOpen(false)
    navigate(nextAfterSubmit ? gradePath(nextAfterSubmit.id) : ROSTER)
  }

  const savedTime = record.savedAt
    ? new Date(record.savedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div className="flex h-screen overflow-hidden">
      <SideNav collapsed active="dashboard" />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-24 shrink-0 items-center justify-between gap-6 border-b border-border bg-white px-6">
          <div className="flex min-w-0 items-center gap-6">
            <button
              type="button"
              aria-label="Back to roster"
              onClick={() => navigate(ROSTER)}
              className="rounded p-0.5 hover:bg-black/5"
            >
              <Icon name="arrow-back" color="bg-n5" />
            </button>
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="truncate text-f3 font-semibold text-ink">{student.name}</h1>
              <p className="text-base text-n4">Submitted {student.submittedAt ? formatDate(student.submittedAt) : '—'}</p>
            </div>
            <StatusTag row={student} />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <p className="whitespace-nowrap text-base text-n4">
              {queueIndex >= 0 ? `Student ${queueIndex + 1} of ${stats.toGrade} to grade` : `${stats.toGrade} left to grade`}
            </p>
            <Button
              variant="ghost"
              tone="success"
              disabled={!prev}
              onClick={() => prev && navigate(gradePath(prev.id))}
              className="whitespace-pre"
            >
              {'‹  Previous'}
            </Button>
            <Button tone="success" disabled={!next} onClick={() => next && navigate(gradePath(next.id))} className="whitespace-pre">
              {'Next student  ›'}
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <WorkbookViewer onViewReasoning={() => setReasoningOpen(true)} />

          {/* Rubric panel */}
          <aside
            aria-label="Rubric"
            className="flex h-full w-[clamp(540px,41.8%,640px)] shrink-0 flex-col border-l border-border bg-white"
          >
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-7 py-6">
              <h2 className="text-f4 font-semibold text-ink">{assignment.fullTitle}</h2>

              <Card tone="accent" className="flex flex-col gap-2 text-ink">
                <h3 className="text-f6 font-semibold">Lesson objectives</h3>
                <ul className="text-sm leading-[1.4]">
                  {assignment.objectives.map((o) => (
                    <li key={o}>• {o}</li>
                  ))}
                </ul>
              </Card>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-5">
                  <h3 id="score-heading" className="flex-1 text-f5 font-semibold text-ink">
                    Select a score
                  </h3>
                  {/* Visual only in the prototype. */}
                  <Button size="sm" variant="ghost" tone="neutral">
                    Edit rubric
                  </Button>
                </div>
                <div role="radiogroup" aria-labelledby="score-heading" className="flex flex-col gap-2">
                  {rubric.levels.map((level) => {
                    const selected = record.draftScore === level.score
                    const suggested = level.score === assignment.ai.suggestedScore
                    return (
                      <label
                        key={level.score}
                        className={cx(
                          'flex cursor-pointer items-center gap-3 rounded-md transition-colors',
                          selected
                            ? 'border-2 border-primary bg-primary-tint p-[11px]'
                            : 'border border-border bg-white p-3 hover:border-n6 hover:bg-surface-muted/50',
                          'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary',
                        )}
                      >
                        <input
                          type="radio"
                          name="score"
                          value={level.score}
                          checked={selected}
                          onChange={() => update({ draftScore: level.score })}
                          className="sr-only"
                        />
                        <RadioDot checked={selected} />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="flex items-center gap-2">
                            <span className="whitespace-nowrap text-base font-semibold text-ink">
                              {level.score} – {level.label}
                            </span>
                            {suggested && (
                              <>
                                <span className="flex-1 text-xs font-semibold text-primary">✦ AI Suggested</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    // Keep the label from selecting this score.
                                    e.preventDefault()
                                    setReasoningOpen(true)
                                  }}
                                  className="whitespace-nowrap text-sm font-semibold text-primary hover:underline"
                                >
                                  View all reasoning
                                </button>
                              </>
                            )}
                          </span>
                          <span className="text-xs leading-[1.4] text-n3">{level.short}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-f5 font-semibold text-ink">Feedback for {first} (visible to student)</h3>
                  {undoText != null && !drafting ? (
                    <Button size="sm" variant="borderless" tone="neutral" onClick={undoDraft}>
                      ↺ Undo AI draft
                    </Button>
                  ) : (
                    <Button size="sm" variant="borderless" onClick={draftWithAI} disabled={drafting}>
                      {drafting ? '✦ Drafting…' : '✦ Draft with AI'}
                    </Button>
                  )}
                </div>
                <TextArea
                  label="Comment"
                  value={record.draftFeedback}
                  maxLength={FEEDBACK_MAX}
                  readOnly={drafting}
                  aria-busy={drafting}
                  placeholder={`Write feedback for ${first}…`}
                  onChange={(e) => {
                    setUndoText(null)
                    update({ draftFeedback: e.target.value })
                  }}
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 border-t border-border bg-white px-7 py-4">
              <p className="min-w-0 flex-1 truncate text-xs leading-[1.4] text-n4" aria-live="polite">
                {saving || drafting
                  ? 'Saving draft…'
                  : savedTime
                    ? `✓ Draft saved automatically · ${savedTime}`
                    : 'Drafts save automatically'}
              </p>
              <Button variant="ghost" onClick={() => navigate(ROSTER)}>
                Save &amp; exit
              </Button>
              <Button
                disabled={record.draftScore == null || drafting}
                title={record.draftScore == null ? 'Select a score first' : undefined}
                onClick={() => setSubmitOpen(true)}
              >
                Submit grade
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <Sheet
        open={reasoningOpen}
        onClose={() => setReasoningOpen(false)}
        title={`Why the AI suggested ${scoreLabel(assignment.ai.suggestedScore)}`}
      >
        <ul className="flex flex-col gap-3">
          {assignment.ai.reasons.map((r) => (
            <li key={r} className="flex gap-3 text-base text-ink">
              <span aria-hidden className="text-primary">
                ✦
              </span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="rounded-md bg-primary-tint px-4 py-3 text-sm font-semibold leading-[1.4] text-warning">
          Suggestion only — you choose the final score.
        </p>
      </Sheet>

      {record.draftScore != null && (
        <SubmitModal
          open={submitOpen}
          onClose={() => setSubmitOpen(false)}
          studentName={student.name}
          possessive={student.possessive ?? 'their'}
          score={record.draftScore}
          feedback={record.draftFeedback}
          hasNext={!!nextAfterSubmit}
          onSaveExit={() => navigate(ROSTER)}
          onSubmitNext={submitAndNext}
        />
      )}

      <SubmittedToast />
    </div>
  )
}
