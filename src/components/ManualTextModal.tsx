import { useState } from "react"

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
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Paste job text</h2>
        {reason && <p className="text-sm text-slate-500 mb-3">Reason: {reason}</p>}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          placeholder="Paste the full job posting text here (minimum 150 words)…"
        />
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || text.trim().length === 0}
            onClick={() => onSubmit(text)}
            className="px-3 py-1.5 text-sm rounded-md bg-slate-900 text-white disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  )
}
