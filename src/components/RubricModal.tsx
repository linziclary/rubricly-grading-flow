import { assignment, rubric } from '../data/mock'
import { Button } from './Button'
import { Modal } from './Modal'

/** Rubric reference (Figma 1:1206) shown in Dialect styling. */
export function RubricModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={rubric.title}
      width={720}
      actions={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <table className="w-full border-collapse overflow-hidden rounded text-sm leading-[1.4] text-ink">
        <thead>
          <tr className="bg-surface-muted text-left">
            <th scope="col" className="w-44 border border-border px-3 py-2 font-semibold">
              Score
            </th>
            <th scope="col" className="border border-border px-3 py-2 font-semibold">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rubric.levels.map((l) => (
            <tr key={l.score}>
              <th scope="row" className="border border-border px-3 py-2 text-left align-top font-semibold">
                {l.score} – {l.label}
              </th>
              <td className="border border-border px-3 py-2 text-n3">{l.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col gap-2">
        <h3 className="text-f6 font-semibold text-ink">Lesson Objectives for {assignment.fullTitle}</h3>
        <ul className="list-disc pl-5 text-sm leading-[1.4] text-ink">
          {assignment.objectivesLong.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
