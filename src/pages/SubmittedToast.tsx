import { Button } from '../components/Button'
import { Toast } from '../components/Toast'
import { scoreLabel } from '../data/mock'
import { useGrading } from '../state/grading'

type SubmittedToastProps = {
  /** Show "Grade next: [name]" (roster only). */
  onGradeNext?: (studentId: string) => void
}

/**
 * Confirmation for the most recent submission ("05 · Roster after submit").
 * It follows the teacher across screens until Undo, a newer submit, or the timeout.
 */
export function SubmittedToast({ onGradeNext }: SubmittedToastProps) {
  const { lastSubmitted, undoLastSubmit, nextToGrade } = useGrading()
  if (!lastSubmitted) return null
  const next = onGradeNext ? nextToGrade(lastSubmitted.studentId) : undefined

  return (
    <Toast
      key={lastSubmitted.at}
      floating
      message={`✓  Grade submitted for ${lastSubmitted.name} · ${scoreLabel(lastSubmitted.score)}`}
      actions={
        <>
          <Button size="sm" variant="borderless" tone="neutral" onClick={undoLastSubmit}>
            Undo
          </Button>
          {next && onGradeNext && (
            <Button size="sm" className="whitespace-pre" onClick={() => onGradeNext(next.id)}>
              {`Grade next: ${next.name}  ›`}
            </Button>
          )}
        </>
      }
    />
  )
}
