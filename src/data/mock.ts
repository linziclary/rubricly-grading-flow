// Single source of mock data for the prototype. Everything the UI counts or averages
// is derived from these records (see src/state/grading.tsx); nothing is hard-coded in screens.

export const teacher = { name: 'Mrs. Clary' }

export const klass = { id: 'advisory-1', name: 'Advisory 1' }

export type RubricLevel = { score: number; label: string; short: string; description: string }

/** Rubric wording from Figma node 1:1206 ("Rubric for Workbook Page Assignment"). */
export const rubric = {
  title: 'Rubric for Workbook Page Assignment',
  levels: [
    {
      score: 5,
      label: 'Excellent',
      description:
        'Fully meets the lesson objectives. The response is accurate, complete, and clearly explained in the student’s own words.',
      short: 'Fully meets the lesson objectives. Accurate, complete, and clearly explained in the student’s own words.',
    },
    {
      score: 4,
      label: 'Good',
      description: 'Mostly meets the lesson objectives with minor gaps or slight lack of clarity.',
      short: 'Mostly meets the lesson objectives with minor gaps or slight lack of clarity.',
    },
    {
      score: 3,
      label: 'Satisfactory',
      description:
        'Partially meets the lesson objectives. Understanding or explanation is incomplete or somewhat unclear.',
      short: 'Partially meets the lesson objectives. Understanding or explanation is incomplete or somewhat unclear.',
    },
    {
      score: 2,
      label: 'Limited',
      description:
        'Minimally meets the lesson objectives. Significant gaps in understanding and/or unclear explanation.',
      short: 'Minimally meets the lesson objectives. Significant gaps in understanding and/or unclear explanation.',
    },
    {
      score: 1,
      label: 'Insufficient',
      description:
        'Does not meaningfully meet the lesson objectives. Explanation is very unclear or largely incomplete.',
      short: 'Does not meaningfully meet the lesson objectives. Explanation is very unclear or largely incomplete.',
    },
    {
      score: 0,
      label: 'No Evidence',
      description: 'Response is missing, off-topic, or shows no evidence of meeting the lesson objectives.',
      short: 'Response is missing, off-topic, or shows no evidence of meeting the lesson objectives.',
    },
  ] satisfies RubricLevel[],
}

export function scoreLabel(score: number) {
  const level = rubric.levels.find((l) => l.score === score)
  return level ? `${level.score} – ${level.label}` : String(score)
}

/** The assignment being graded in the demo. */
export const assignment = {
  id: '9-1-3',
  code: '9.1.3.',
  title: 'Our Digital Habits',
  fullTitle: '9.1.3. Our Digital Habits',
  shortTitle: 'Our Digital Habits',
  classId: klass.id,
  dueDate: '2025-01-30',
  pages: ['/assets/workbook-page-1.png', '/assets/workbook-page-2.png'],
  /** Short form shown on the roster and grading page. */
  objectives: [
    'Interpret the “why” behind their digital habits',
    'Critique how their digital habits impact their lives',
  ],
  /** Full wording from the rubric reference (1:1206). */
  objectivesLong: [
    'Students will be able to interpret the “Why” behind their digital habits.',
    'Students will be able to critique how their digital habits impact their lives.',
  ],
  /** The submission is the same workbook for every student, so the AI read is shared too. */
  ai: {
    suggestedScore: 3,
    evidenceLabel: '6 selected (asked for 1–2)',
    reasons: [
      'Named a personal habit in their own words (“I play games on my phone whenever I watch TV”), which partly meets objective 1.',
      'Selected 6 statements and 3 core needs when the prompt asked for 1–2 of each.',
      'Their change goals don’t explain the impact on their life, so objective 2 is only partly met.',
    ],
    draftFeedback: (firstName: string) =>
      `${firstName}, you named a really specific habit — gaming while you watch TV. For next time, pick one or two habits and explain why you do them and how they affect your sleep or time with friends.`,
  },
  /** Teacher comments pinned on the workbook pages. */
  pageComments: [
    {
      page: 2,
      author: teacher.name,
      text: 'Great goal! What would “more present” look like for you?',
      x: 400,
      y: 506,
    },
  ],
}

export type SeedStatus = 'not_submitted' | 'ready' | 'in_progress' | 'graded'

export type Student = {
  id: string
  name: string
  submittedAt: string | null
  status: SeedStatus
  score?: number
  /** Possessive pronoun used in the submit modal copy. Only Maya's is given in Figma; others default to "their". */
  possessive?: string
}

/** Roster order matches Figma (02 · Assignment page); it is also the grading queue order. */
export const students: Student[] = [
  { id: 'maya-chen', name: 'Maya Chen', submittedAt: '2025-01-29', status: 'in_progress', possessive: 'her' },
  { id: 'aiden-brooks', name: 'Aiden Brooks', submittedAt: '2025-01-28', status: 'ready' },
  { id: 'sofia-ramirez', name: 'Sofia Ramirez', submittedAt: '2025-01-31', status: 'ready' },
  { id: 'jordan-ellis', name: 'Jordan Ellis', submittedAt: '2025-01-27', status: 'graded', score: 4 },
  { id: 'priya-patel', name: 'Priya Patel', submittedAt: '2025-01-29', status: 'graded', score: 3 },
  { id: 'liam-oconnor', name: 'Liam O’Connor', submittedAt: null, status: 'not_submitted' },
  { id: 'noah-williams', name: 'Noah Williams', submittedAt: '2025-01-30', status: 'ready' },
  { id: 'ethan-park', name: 'Ethan Park', submittedAt: '2025-01-28', status: 'graded', score: 2 },
  { id: 'ava-thompson', name: 'Ava Thompson', submittedAt: '2025-01-28', status: 'ready' },
  { id: 'lucas-nguyen', name: 'Lucas Nguyen', submittedAt: '2025-01-27', status: 'graded', score: 4 },
  { id: 'chloe-martin', name: 'Chloe Martin', submittedAt: '2025-01-29', status: 'ready' },
  { id: 'mateo-garcia', name: 'Mateo Garcia', submittedAt: '2025-01-30', status: 'ready' },
  { id: 'zoe-robinson', name: 'Zoe Robinson', submittedAt: '2025-01-28', status: 'graded', score: 4 },
  { id: 'owen-mitchell', name: 'Owen Mitchell', submittedAt: '2025-01-29', status: 'ready' },
  { id: 'isabella-rossi', name: 'Isabella Rossi', submittedAt: '2025-01-30', status: 'ready' },
  { id: 'elijah-johnson', name: 'Elijah Johnson', submittedAt: null, status: 'not_submitted' },
  { id: 'harper-lee', name: 'Harper Lee', submittedAt: '2025-01-29', status: 'graded', score: 4 },
  { id: 'gabriel-silva', name: 'Gabriel Silva', submittedAt: '2025-01-29', status: 'ready' },
  { id: 'lily-anderson', name: 'Lily Anderson', submittedAt: '2025-01-30', status: 'ready' },
  { id: 'caleb-wright', name: 'Caleb Wright', submittedAt: '2025-01-28', status: 'ready' },
]

export function isLate(s: Student) {
  return s.submittedAt != null && s.submittedAt > assignment.dueDate
}

export function firstName(name: string) {
  return name.split(' ')[0]
}

/** Earlier and upcoming assignments in Unit 9.1 (already-closed history, not regraded in the demo). */
export const pastAssignments = [
  { id: '9-1-2', fullTitle: '9.1.2. Strengths Inventory', shortTitle: 'Strengths Inventory', dueDate: '2025-01-23', submitted: 20, total: 20, average: 3.2 },
  { id: '9-1-1', fullTitle: '9.1.1. Who Am I?', shortTitle: 'Who Am I?', dueDate: '2025-01-16', submitted: 19, total: 20, average: 3.1 },
]

export const upcomingAssignments = [{ id: '9-1-4', fullTitle: '9.1.4. Growth Goals', shortTitle: 'Growth Goals', dueDate: '2025-02-06' }]

/**
 * Unit-level analytics that depend on history the prototype doesn't model
 * (attendance across units, per-objective sub-scores). Values come from the Figma dashboard.
 */
export const unitAnalytics = {
  submissionRate: { value: 92, delta: '▲ 4% vs. last unit', trend: 'up' as const },
  onTimeRate: { value: 85, delta: '▼ 3 late this week', trend: 'down' as const },
  averageDelta: { delta: '▲ 0.3 vs. last unit', trend: 'up' as const },
  oldestWaitingDays: 3,
  checkIns: [
    { studentId: 'liam-oconnor', note: '2 missing assignments this unit', tag: 'Missing', tone: 'error' as const },
    { studentId: 'sofia-ramirez', note: '3 late submissions in a row', tag: 'Late', tone: 'warning' as const },
    { studentId: 'ethan-park', note: 'Score dropped from 4 to 2', tag: 'Score drop', tone: 'info' as const },
  ],
  objectives: [
    { text: 'Identify personal strengths and how to use them', assessedIn: '9.1.1, 9.1.2', percent: 82, average: 3.8, status: 'on_track' as const, live: false },
    { text: 'Interpret the “why” behind their digital habits', assessedIn: '9.1.3', percent: 61, average: 3.2, status: 'in_progress' as const, live: true },
    { text: 'Critique how their digital habits impact their lives', assessedIn: '9.1.3', percent: 44, average: 2.9, status: 'needs_support' as const, live: true },
    { text: 'Set a realistic personal growth goal', assessedIn: '9.1.4', percent: null, average: null, status: 'upcoming' as const, live: false },
  ],
}

export function formatDate(iso: string, style: 'short' | 'long' = 'short') {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: style === 'short' ? 'short' : 'long', day: 'numeric', year: 'numeric' })
}
