import { useState } from "react"
import { BTN_PRIMARY, BTN_SECONDARY, INPUT } from "../styles/ui"

export default function ManualTextModal({
  reason,
  onSubmit,
  onClose,
  submitting,
  error,
}: {
  reason: string | null
  onSubmit: (text: string) => void
  onClose: () => void
  submitting: boolean
  error: string | null
}) {
  const [text, setText] = useState("")

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white shadow-lg max-w-lg w-full p-5 border border-brand-dark rounded-sm">
        <h2 className="text-base font-black uppercase tracking-wide text-black mb-1">Paste job text</h2>
        {reason && <p className="text-sm text-slate-500 mb-3">Reason: {reason}</p>}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className={`w-full ${INPUT} mb-2`}
          placeholder="Paste the full job posting text here (minimum 150 words)…"
        />
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className={BTN_SECONDARY}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || text.trim().length === 0}
            onClick={() => onSubmit(text)}
            className={BTN_PRIMARY}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  )
}
