# Rubricly — teacher grading prototype

A high-fidelity, front-end-only prototype of how a teacher grades a student's workbook against a 0–5 rubric, with optional AI help. Built from the Figma file `ntDqh2nyQIYFufImb9az6R` (section `26:3649`).

No backend or auth: mock data lives in `src/data/mock.ts`, and grading state is kept in React context and saved to `localStorage`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. Designed at 1440px wide and checked from 1280px to 1600px.

| Route | Screen |
|---|---|
| `/` | 01 Dashboard |
| `/assignments/9-1-3` | 02 Assignment roster (and 05 after submit) |
| `/assignments/9-1-3/grade/:studentId` | 03 Grading page (04 submit modal opens here) |
| `/assignments` | Placeholder list behind "All assignments" |
| `/components` | Base components (Dialect building blocks) |

**Reset demo:** click the avatar at the bottom of the side nav → **Reset demo**. This clears saved drafts and grades.

## Demo script

Start from a clean state (avatar → Reset demo). The path shows every state.

1. **Dashboard (`/`).** Point out "6/18 graded" on 9.1.3 and **To grade: 12**. Click **Continue grading**.
2. **Roster.** Summary: 18/20 submitted, 6 graded, 11 ready, average 3.5. Click the filter tags to show they really filter (e.g. **Graded · 6**), then **All · 20**. Open **View rubric**, then close it.
3. **Grade Maya.** Click **Resume grading** on Maya Chen (or **Start grading**). The top bar shows *Student 1 of 12 to grade*.
   - Nothing is selected: the AI suggestion is only a label (**✦ AI Suggested** on 3). **Submit grade** is disabled.
   - Click **View all reasoning** on the page‑1 label or on score 3 → side sheet with the AI's reasons and "Suggestion only — you choose the final score." Close it.
   - Use **Page 2** to jump to the second page (Mrs. Clary's comment pin) and **− / +** to zoom.
   - Click anywhere on the **3 – Satisfactory** card. It gets the orange border and tint. The footer shows *Saving draft…* then *✓ Draft saved automatically · time*.
   - Click **✦ Draft with AI**. The feedback types itself in, and the count updates. **↺ Undo AI draft** restores what was there.
4. **Submit.** Click **Submit grade** → the confirmation shows the score and the full comment. Click **Submit & next student**.
5. **Next student.** Aiden Brooks opens (*Student 1 of 11*) with the toast *✓ Grade submitted for Maya Chen · 3 – Satisfactory*.
6. **Back to roster.** Click the back arrow. Maya's row is highlighted as **Graded · 3 – Satisfactory**. Counts update: Graded 7, In progress 0, average 3.4. The toast offers **Undo** and **Grade next: Aiden Brooks**.
7. **Undo.** Click **Undo**. Maya returns to *In progress* with her draft intact, and every count reverts. Back on the dashboard, the 9.1.3 tag and **To grade** match.

Also try: **Save & exit**, then reload the page — the draft (score and feedback) is still there.

## Notes and decisions

- **AI never applies a score.** Drafts start empty, and the suggestion appears only as a label and a reasoning sheet.
- **Counts are derived.** Submitted, graded, ready, in progress, class average, "Student X of Y", the dashboard tag, the "To grade" metric and the chart bar for 9.1.3 are all calculated from the data. Unit history the prototype doesn't model (submission and on-time rates, check-ins, per-objective percentages) is mock data in `unitAnalytics`.
- **Figma fixes applied:** "Our Digital Habits" chart label; 9.1.3 shows 18/20 submitted; the page‑2 comment is by Mrs. Clary.
- **Submit modal** follows the current Figma (score + full comment; Keep editing / Save & exit / Submit & next student). If nobody is left to grade, the primary button becomes **Submit & back to roster**. The confirmation toast follows the teacher to the next screen for 20 seconds so Undo is always reachable.
- **Class average:** six whole-number scores can't average 3.4, so the seed averages 3.5. It drops to 3.4 after Maya's 3.
- **Feedback length:** the AI draft is 187 characters; Figma's "196" was placeholder text.
- **Visual-only controls:** Class dropdown, Edit rubric, Extend due date, View grades on past assignments, and nav items other than Dashboard and My Assignments.

## Project structure

```
src/
  components/   Dialect-style building blocks (Button, Tag, Table, Card, Radio, TextArea, Modal, Sheet, Toast, SideNav, WorkbookViewer, SubmitModal, RubricModal)
  data/mock.ts  Assignment, rubric (exact wording from Figma 1:1206), objectives, AI reasoning, 20 students
  state/        GradingProvider: per-student drafts and grades, derived stats, submit/undo, localStorage
  pages/        Dashboard, Roster, Grade, AssignmentsList, ComponentGallery
public/assets/  Logos, workbook pages and icons exported from Figma
```
