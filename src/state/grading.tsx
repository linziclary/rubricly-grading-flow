import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { isLate, students, type SeedStatus, type Student } from '../data/mock'

export type GradeStatus = SeedStatus

/** Per-student grading state. `draft*` is what the grading page edits; `graded*` is what was submitted. */
export type GradeRecord = {
  status: GradeStatus
  draftScore: number | null
  draftFeedback: string
  gradedScore: number | null
  gradedFeedback: string
  /** Epoch ms of the last draft change, shown as "Draft saved automatically · …". */
  savedAt: number | null
}

type State = Record<string, GradeRecord>

const STORAGE_KEY = 'rubricly:grading:v1'

function seed(): State {
  return Object.fromEntries(
    students.map((s) => [
      s.id,
      {
        status: s.status,
        // The AI suggestion is never pre-applied: drafts start empty.
        draftScore: s.status === 'graded' ? (s.score ?? null) : null,
        draftFeedback: '',
        gradedScore: s.status === 'graded' ? (s.score ?? null) : null,
        gradedFeedback: '',
        savedAt: null,
      } satisfies GradeRecord,
    ]),
  )
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as State
      // Merge onto the seed so new students added to mock data still appear.
      return { ...seed(), ...saved }
    }
  } catch {
    // Storage blocked or corrupt: fall back to the seed.
  }
  return seed()
}

type Action =
  | { type: 'draft'; id: string; patch: Partial<Pick<GradeRecord, 'draftScore' | 'draftFeedback'>> }
  | { type: 'submit'; id: string }
  | { type: 'restore'; id: string; record: GradeRecord }
  | { type: 'reset' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'draft': {
      const prev = state[action.id]
      if (!prev) return state
      return {
        ...state,
        [action.id]: {
          ...prev,
          ...action.patch,
          // Touching a ready submission starts it; graded work stays graded until resubmitted.
          status: prev.status === 'ready' ? 'in_progress' : prev.status,
          savedAt: Date.now(),
        },
      }
    }
    case 'submit': {
      const prev = state[action.id]
      if (!prev || prev.draftScore == null) return state
      return {
        ...state,
        [action.id]: {
          ...prev,
          status: 'graded',
          gradedScore: prev.draftScore,
          gradedFeedback: prev.draftFeedback,
          savedAt: Date.now(),
        },
      }
    }
    case 'restore':
      return { ...state, [action.id]: action.record }
    case 'reset':
      return seed()
  }
}

export type RosterRow = Student & GradeRecord & { late: boolean }

/** The most recent submission, kept in memory so the confirmation toast can offer Undo. */
export type LastSubmitted = { studentId: string; name: string; score: number; prev: GradeRecord; at: number }

const TOAST_MS = 20000

type GradingContextValue = {
  records: State
  rows: RosterRow[]
  stats: ReturnType<typeof computeStats>
  setDraft: (id: string, patch: Partial<Pick<GradeRecord, 'draftScore' | 'draftFeedback'>>) => void
  /** Submits the draft and remembers the previous record so the toast can undo it. */
  submit: (id: string) => void
  lastSubmitted: LastSubmitted | null
  undoLastSubmit: () => void
  resetDemo: () => void
  /** Next student still to grade after `afterId` in roster order (wraps), excluding `afterId`. */
  nextToGrade: (afterId: string) => RosterRow | undefined
}

const GradingContext = createContext<GradingContextValue | null>(null)

function computeStats(rows: RosterRow[]) {
  const count = (s: GradeStatus) => rows.filter((r) => r.status === s).length
  const graded = rows.filter((r) => r.status === 'graded' && r.gradedScore != null)
  const average = graded.length ? graded.reduce((sum, r) => sum + (r.gradedScore ?? 0), 0) / graded.length : null
  const queue = rows.filter((r) => r.status === 'ready' || r.status === 'in_progress')
  return {
    total: rows.length,
    submitted: rows.filter((r) => r.submittedAt != null).length,
    graded: count('graded'),
    ready: count('ready'),
    inProgress: count('in_progress'),
    notSubmitted: count('not_submitted'),
    /** Ready + in progress, in roster order. */
    queue,
    toGrade: queue.length,
    average,
  }
}

export function GradingProvider({ children }: { children: ReactNode }) {
  const [records, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    } catch {
      // Ignore: the demo still works in memory.
    }
  }, [records])

  const rows = useMemo(
    () => students.map((s) => ({ ...s, ...records[s.id], late: isLate(s) })),
    [records],
  )
  const stats = useMemo(() => computeStats(rows), [rows])

  const setDraft = useCallback<GradingContextValue['setDraft']>((id, patch) => dispatch({ type: 'draft', id, patch }), [])
  const [lastSubmitted, setLastSubmitted] = useState<LastSubmitted | null>(null)

  useEffect(() => {
    if (!lastSubmitted) return
    const t = window.setTimeout(() => setLastSubmitted(null), TOAST_MS)
    return () => window.clearTimeout(t)
  }, [lastSubmitted])

  const submit = useCallback<GradingContextValue['submit']>(
    (id) => {
      const before = records[id]
      const student = students.find((s) => s.id === id)
      if (!before || !student || before.draftScore == null) return
      dispatch({ type: 'submit', id })
      setLastSubmitted({ studentId: id, name: student.name, score: before.draftScore, prev: before, at: Date.now() })
    },
    [records],
  )
  const undoLastSubmit = useCallback(() => {
    if (!lastSubmitted) return
    dispatch({ type: 'restore', id: lastSubmitted.studentId, record: lastSubmitted.prev })
    setLastSubmitted(null)
  }, [lastSubmitted])
  const resetDemo = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    dispatch({ type: 'reset' })
    setLastSubmitted(null)
  }, [])

  const nextToGrade = useCallback<GradingContextValue['nextToGrade']>(
    (afterId) => {
      const start = rows.findIndex((r) => r.id === afterId)
      const ordered = [...rows.slice(start + 1), ...rows.slice(0, Math.max(start, 0))]
      return ordered.find((r) => r.id !== afterId && (r.status === 'ready' || r.status === 'in_progress'))
    },
    [rows],
  )

  const value = useMemo(
    () => ({ records, rows, stats, setDraft, submit, lastSubmitted, undoLastSubmit, resetDemo, nextToGrade }),
    [records, rows, stats, setDraft, submit, lastSubmitted, undoLastSubmit, resetDemo, nextToGrade],
  )
  return <GradingContext.Provider value={value}>{children}</GradingContext.Provider>
}

export function useGrading() {
  const ctx = useContext(GradingContext)
  if (!ctx) throw new Error('useGrading must be used inside <GradingProvider>')
  return ctx
}

