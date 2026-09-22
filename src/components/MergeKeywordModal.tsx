import { useState } from "react"
import type { KeywordDashboardItem } from "../api/types"

export default function MergeKeywordModal({
  source,
  candidates,
  onConfirm,
  onClose,
  submitting,
}: {
  source: KeywordDashboardItem
  candidates: KeywordDashboardItem[]
  onConfirm: (targetId: string) => void
  onClose: () => void
  submitting: boolean
}) {
  const options = candidates.filter((c) => c.keyword_id !== source.keyword_id)
  const [targetId, setTargetId] = useState(options[0]?.keyword_id ?? "")

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          Merge "{source.canonical_name}" into…
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          This moves all jobs onto the target keyword and cannot be undone.
        </p>
        {options.length === 0 ? (
          <p className="text-sm text-slate-500">No other keywords to merge into.</p>
        ) : (
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm mb-3"
          >
            {options.map((o) => (
              <option key={o.keyword_id} value={o.keyword_id}>
                {o.canonical_name}
              </option>
            ))}
          </select>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || !targetId}
            onClick={() => {
              if (confirm(`Merge "${source.canonical_name}" into the selected keyword?`)) {
                onConfirm(targetId)
              }
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-slate-900 text-white disabled:opacity-50"
          >
            {submitting ? "Merging…" : "Merge"}
          </button>
        </div>
      </div>
    </div>
  )
}
