import { firstName, scoreLabel } from '../data/mock'
import { Button } from './Button'
import { Modal } from './Modal'

type SubmitModalProps = {
  open: boolean
  onClose: () => void
  studentName: string
  possessive: string
  score: number
  feedback: string
  hasNext: boolean
  onSaveExit: () => void
  onSubmitNext: () => void
}

/** "04 · Submit confirmation" (current Figma): score + full comment, filled from the grading state. */
export function SubmitModal({
  open,
  onClose,
  studentName,
  possessive,
  score,
  feedback,
  hasNext,
  onSaveExit,
  onSubmitNext,
}: SubmitModalProps) {
  const comment = feedback.trim()
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Submit grade for ${studentName}?`}
      actions={
        <>
          <Button variant="borderless" tone="neutral" onClick={onClose}>
            Keep editing
          </Button>
          <Button variant="ghost" onClick={onSaveExit}>
            Save &amp; exit
          </Button>
          <Button onClick={onSubmitNext}>{hasNext ? 'Submit & next student' : 'Submit & back to roster'}</Button>
        </>
      }
    >
      <p className="text-base text-n3">
        {firstName(studentName)} will see {possessive} score and your feedback in {possessive} workbook.
      </p>
      <dl className="flex flex-col gap-2 rounded bg-surface-muted px-4 py-3 text-base">
        <div className="flex items-start gap-2">
          <dt className="w-20 shrink-0 text-n4">Score:</dt>
          <dd className="font-semibold text-ink">{scoreLabel(score)}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="w-20 shrink-0 text-n4">Comment:</dt>
          <dd className={comment ? 'min-w-0 flex-1 whitespace-pre-wrap text-black/80' : 'flex-1 text-n5'}>
            {comment || 'No comment'}
          </dd>
        </div>
      </dl>
    </Modal>
  )
}
