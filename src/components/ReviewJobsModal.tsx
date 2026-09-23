import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query"
import { analyzeJob, getJob, NON_FINAL_STATUSES } from "../api/jobs"
import type { JobDetail } from "../api/types"
import ProcessingStatusChip from "./ProcessingStatusChip"
import { BTN_ICON, BTN_PRIMARY, BTN_SECONDARY } from "../styles/ui"

function ReviewRow({ job }: { job: JobDetail }) {
  const queryClient = useQueryClient()
  const analyzeMutation = useMutation({
    mutationFn: () => analyzeJob(job.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", job.id] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })

  return (
    <div className="border border-brand rounded-sm p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-black truncate">
            {job.company_name ?? "—"} {job.job_title ? `· ${job.job_title}` : ""}
          </p>
          <a
            href={job.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-brand hover:text-brand-dark truncate block"
          >
            {job.source_url}
          </a>
        </div>
        <ProcessingStatusChip status={job.processing_status} />
      </div>

      {job.processing_status === "needs_review" && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
            Extracted content that will be sent to the LLM
          </p>
          <pre className="max-h-48 overflow-auto bg-slate-50 border border-slate-200 rounded-sm p-2 text-xs whitespace-pre-wrap font-mono">
            {job.raw_text}
          </pre>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
              className={BTN_PRIMARY}
            >
              {analyzeMutation.isPending ? "Sending…" : "Analyse"}
            </button>
            {analyzeMutation.isError && (
              <span className="text-xs text-red-600">Could not start analysis.</span>
            )}
          </div>
        </div>
      )}

      {job.processing_status === "needs_manual_text" && (
        <p className="mt-2 text-xs text-amber-700">
          Could not extract text automatically — paste it manually from the Jobs list.
        </p>
      )}

      {job.processing_status === "failed" && (
        <p className="mt-2 text-xs text-red-600">{job.processing_error}</p>
      )}
    </div>
  )
}

export default function ReviewJobsModal({
  jobIds,
  onClose,
}: {
  jobIds: string[]
  onClose: () => void
}) {
  const queries = useQueries({
    queries: jobIds.map((id) => ({
      queryKey: ["job", id],
      queryFn: () => getJob(id),
      refetchInterval: (q: { state: { data?: JobDetail } }) => {
        const status = q.state.data?.processing_status
        return status && NON_FINAL_STATUSES.has(status) ? 2000 : false
      },
    })),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-lg p-5 border border-brand-dark rounded-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black uppercase tracking-wide text-black">
            Processing {jobIds.length > 1 ? `${jobIds.length} jobs` : "job"}
          </h2>
          <button type="button" onClick={onClose} title="Close" className={`${BTN_ICON} w-7 h-7`}>
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {queries.map((q, i) =>
            q.data ? (
              <ReviewRow key={jobIds[i]} job={q.data} />
            ) : (
              <div key={jobIds[i]} className="text-sm text-slate-500">
                Loading…
              </div>
            ),
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
