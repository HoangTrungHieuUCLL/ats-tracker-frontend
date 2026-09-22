import { useState } from "react"
import type { KeywordDashboardItem } from "../api/types"
import { BTN_PRIMARY, BTN_SECONDARY, SELECT } from "../styles/ui"

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
      <div className="bg-white shadow-lg max-w-sm w-full p-5 border border-brand-dark rounded-sm">
        <h2 className="text-base font-black uppercase tracking-wide text-black mb-1">
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
            className={`w-full ${SELECT} mb-3`}
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
            className={BTN_SECONDARY}
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
            className={BTN_PRIMARY}
          >
            {submitting ? "Merging…" : "Merge"}
          </button>
        </div>
      </div>
    </div>
  )
}
