import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import ApplicationStatusSelect from "../components/ApplicationStatusSelect"
import ManualTextModal from "../components/ManualTextModal"
import ProcessingStatusChip from "../components/ProcessingStatusChip"
import {
  hasNonFinalJobs,
  listJobs,
  retryJob,
  submitJobUrls,
  submitManualText,
  updateJob,
  type JobFilters,
} from "../api/jobs"
import type { ApplicationStatus, BatchResultItem, JobListItem } from "../api/types"

const MAX_URLS = 10

function parseUrls(text: string): string[] {
  return text
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function formatMunichTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function AddUrlsPanel({ onAccepted }: { onAccepted: () => void }) {
  const [text, setText] = useState("")
  const [results, setResults] = useState<BatchResultItem[] | null>(null)

  const tokens = useMemo(() => parseUrls(text), [text])
  const uniqueTokens = useMemo(() => Array.from(new Set(tokens)), [tokens])
  const invalidTokens = useMemo(() => tokens.filter((t) => !isValidHttpUrl(t)), [tokens])
  const overLimit = uniqueTokens.length > MAX_URLS

  const mutation = useMutation({
    mutationFn: submitJobUrls,
    onSuccess: (data) => {
      setResults(data);
      const accepted = new Set(
        data.filter((r) => r.result === "accepted").map((r) => r.url),
      )
      setText(tokens.filter((t) => !accepted.has(t)).join("\n"))
      onAccepted()
    },
  })

  function handleSubmit() {
    if (uniqueTokens.length === 0 || overLimit) return
    mutation.mutate(uniqueTokens)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-900">Add job URLs</h2>
        <span className={`text-xs ${overLimit ? "text-red-600" : "text-slate-500"}`}>
          {uniqueTokens.length} / {MAX_URLS}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Paste up to 10 job posting URLs, one per line…"
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      {invalidTokens.length > 0 && (
        <ul className="mt-2 text-xs text-red-600 space-y-0.5">
          {invalidTokens.map((t) => (
            <li key={t}>Not a valid URL: {t}</li>
          ))}
        </ul>
      )}
      {overLimit && <p className="mt-2 text-xs text-red-600">Maximum {MAX_URLS} URLs per batch.</p>}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            mutation.isPending ||
            uniqueTokens.length === 0 ||
            overLimit ||
            invalidTokens.length > 0
          }
          className="px-3 py-1.5 text-sm rounded-md bg-slate-900 text-white disabled:opacity-50"
        >
          {mutation.isPending ? "Submitting…" : "Submit"}
        </button>
      </div>
      {results && (
        <ul className="mt-3 text-sm space-y-1">
          {results.map((r) => (
            <li key={r.url} className="flex items-center gap-2">
              {r.result === "accepted" && <span className="text-green-700">Accepted</span>}
              {r.result === "duplicate" && (
                <span className="text-amber-700">
                  Duplicate —{" "}
                  <Link to={`/jobs/${r.job_id}`} className="underline">
                    view existing job
                  </Link>
                </span>
              )}
              {r.result === "invalid" && <span className="text-red-600">Invalid: {r.reason}</span>}
              <span className="text-slate-400 truncate">{r.url}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FiltersBar({
  filters,
  onChange,
}: {
  filters: JobFilters
  onChange: (filters: JobFilters) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <input
        type="search"
        placeholder="Search company or title…"
        value={filters.q ?? ""}
        onChange={(e) => onChange({ ...filters, q: e.target.value })}
        className="border border-slate-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-[180px]"
      />
      <select
        value={filters.application_status ?? ""}
        onChange={(e) => onChange({ ...filters, application_status: e.target.value || undefined })}
        className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
      >
        <option value="">All application statuses</option>
        {["saved", "applied", "interviewing", "offer", "rejected", "withdrawn", "closed"].map(
          (s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ),
        )}
      </select>
      <select
        value={filters.role_family ?? ""}
        onChange={(e) => onChange({ ...filters, role_family: e.target.value || undefined })}
        className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
      >
        <option value="">All role families</option>
        {["data_analyst", "data_engineer", "ai_engineer", "other"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={filters.employment_type ?? ""}
        onChange={(e) => onChange({ ...filters, employment_type: e.target.value || undefined })}
        className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
      >
        <option value="">All employment types</option>
        {["full_time", "part_time", "internship", "working_student", "trainee", "contract"].map(
          (s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ),
        )}
      </select>
      <select
        value={filters.language ?? ""}
        onChange={(e) => onChange({ ...filters, language: e.target.value || undefined })}
        className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
      >
        <option value="">All languages</option>
        <option value="de">DE</option>
        <option value="en">EN</option>
        <option value="other">Other</option>
      </select>
      <select
        value={filters.processing_status ?? ""}
        onChange={(e) => onChange({ ...filters, processing_status: e.target.value || undefined })}
        className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
      >
        <option value="">All processing statuses</option>
        {[
          "queued",
          "fetching",
          "extracting",
          "analyzing",
          "done",
          "needs_manual_text",
          "quota_wait",
          "failed",
        ].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  )
}

function JobRowActions({ job }: { job: JobListItem }) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const retryMutation = useMutation({
    mutationFn: () => retryJob(job.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  })

  const manualTextMutation = useMutation({
    mutationFn: (text: string) => submitManualText(job.id, text),
    onSuccess: () => {
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })

  if (job.processing_status === "needs_manual_text") {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-xs text-blue-700 underline"
        >
          Paste job text
        </button>
        {modalOpen && (
          <ManualTextModal
            reason={job.processing_error}
            submitting={manualTextMutation.isPending}
            error={
              manualTextMutation.isError
                ? "Text is too short (minimum 150 words)."
                : null
            }
            onSubmit={(text) => manualTextMutation.mutate(text)}
            onClose={() => setModalOpen(false)}
          />
        )}
      </>
    )
  }

  if (job.processing_status === "failed") {
    return (
      <div className="text-xs">
        <p className="text-red-600 truncate max-w-[200px]" title={job.processing_error ?? ""}>
          {job.processing_error}
        </p>
        <button
          type="button"
          onClick={() => retryMutation.mutate()}
          disabled={retryMutation.isPending}
          className="text-blue-700 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (job.processing_status === "quota_wait") {
    return (
      <p className="text-xs text-amber-700">
        Waiting for Gemini quota
        {job.next_attempt_at && `, resumes at ${formatMunichTime(job.next_attempt_at)}`}
      </p>
    )
  }

  return null
}

function JobRow({ job }: { job: JobListItem }) {
  const queryClient = useQueryClient()
  const statusMutation = useMutation({
    mutationFn: (application_status: ApplicationStatus) =>
      updateJob(job.id, { application_status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  })

  return (
    <>
      <td className="px-3 py-2">
        <Link to={`/jobs/${job.id}`} className="font-medium text-slate-900 hover:underline">
          {job.company_name ?? "—"}
        </Link>
      </td>
      <td className="px-3 py-2">{job.job_title ?? "—"}</td>
      <td className="px-3 py-2 text-slate-500">{job.role_family ?? "—"}</td>
      <td className="px-3 py-2 text-slate-500">
        {job.employment_type ?? "—"} {job.seniority ? `· ${job.seniority}` : ""}
      </td>
      <td className="px-3 py-2 text-slate-500">{job.language?.toUpperCase() ?? "—"}</td>
      <td className="px-3 py-2 text-slate-500">{job.location ?? "—"}</td>
      <td className="px-3 py-2">
        <ApplicationStatusSelect
          value={job.application_status}
          disabled={statusMutation.isPending}
          onChange={(value) => statusMutation.mutate(value)}
        />
      </td>
      <td className="px-3 py-2">
        <ProcessingStatusChip status={job.processing_status} />
        <div className="mt-1">
          <JobRowActions job={job} />
        </div>
      </td>
      <td className="px-3 py-2 text-slate-500">{job.application_deadline ?? "—"}</td>
      <td className="px-3 py-2 text-slate-500">
        {new Date(job.created_at).toLocaleDateString()}
      </td>
    </>
  )
}

function JobCard({ job }: { job: JobListItem }) {
  const queryClient = useQueryClient()
  const statusMutation = useMutation({
    mutationFn: (application_status: ApplicationStatus) =>
      updateJob(job.id, { application_status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  })

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-start justify-between">
        <Link to={`/jobs/${job.id}`} className="font-medium text-slate-900 hover:underline">
          {job.company_name ?? "Untitled"}
        </Link>
        <ProcessingStatusChip status={job.processing_status} />
      </div>
      <p className="text-sm text-slate-600">{job.job_title ?? "—"}</p>
      <p className="text-xs text-slate-500 mt-1">
        {job.role_family ?? "—"} · {job.employment_type ?? "—"} · {job.location ?? "—"}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <ApplicationStatusSelect
          value={job.application_status}
          disabled={statusMutation.isPending}
          onChange={(value) => statusMutation.mutate(value)}
        />
        <JobRowActions job={job} />
      </div>
    </div>
  )
}

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({ sort_by: "created_at", sort_dir: "desc" })
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => listJobs(filters),
    refetchInterval: (q) => (hasNonFinalJobs(q.state.data) ? 5000 : false),
  })

  return (
    <div>
      <AddUrlsPanel onAccepted={() => queryClient.invalidateQueries({ queryKey: ["jobs"] })} />
      <FiltersBar filters={filters} onChange={setFilters} />

      {query.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {query.isError && <p className="text-sm text-red-600">Could not load jobs.</p>}

      {query.data && query.data.items.length === 0 && (
        <p className="text-sm text-slate-500">No jobs yet. Add a URL above to get started.</p>
      )}

      {query.data && query.data.items.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto bg-white border border-slate-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase">
                <tr>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Role family</th>
                  <th className="px-3 py-2">Type / seniority</th>
                  <th className="px-3 py-2">Lang</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Application status</th>
                  <th className="px-3 py-2">Processing</th>
                  <th className="px-3 py-2">Deadline</th>
                  <th className="px-3 py-2">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data.items.map((job) => (
                  <tr key={job.id}>
                    <JobRow job={job} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {query.data.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
