import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { getJobsForKeyword } from "../api/keywords"

export default function JobsDrawer({
  keywordId,
  keywordName,
  onClose,
}: {
  keywordId: string
  keywordName: string
  onClose: () => void
}) {
  const query = useQuery({
    queryKey: ["keyword-jobs", keywordId],
    queryFn: () => getJobsForKeyword(keywordId),
  })

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-lg p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Jobs with "{keywordName}"</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
        {query.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
        <ul className="space-y-2">
          {query.data?.map((job) => (
            <li key={job.id} className="border border-slate-200 rounded-md p-2">
              <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-slate-900 hover:underline">
                {job.company_name ?? "Untitled"}
              </Link>
              <p className="text-xs text-slate-500">{job.job_title ?? "—"}</p>
            </li>
          ))}
        </ul>
        {query.data?.length === 0 && <p className="text-sm text-slate-500">No jobs found.</p>}
      </div>
    </div>
  )
}
