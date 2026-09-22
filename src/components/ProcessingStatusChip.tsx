import type { ProcessingStatus } from "../api/types"

const LABELS: Record<ProcessingStatus, string> = {
  queued: "Queued",
  fetching: "Fetching",
  extracting: "Extracting",
  analyzing: "Analyzing",
  done: "Done",
  needs_manual_text: "Needs manual text",
  quota_wait: "Quota wait",
  failed: "Failed",
}

const STYLES: Record<ProcessingStatus, string> = {
  queued: "bg-slate-100 text-slate-700",
  fetching: "bg-black/10 text-black",
  extracting: "bg-black/10 text-black",
  analyzing: "bg-black/10 text-black",
  done: "bg-green-100 text-green-700",
  needs_manual_text: "bg-amber-100 text-amber-800",
  quota_wait: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-700",
}

export default function ProcessingStatusChip({ status }: { status: ProcessingStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
