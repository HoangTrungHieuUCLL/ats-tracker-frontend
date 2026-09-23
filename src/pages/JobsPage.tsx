import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
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
import { BTN_ICON, BTN_ICON_PRIMARY, BTN_PRIMARY, BTN_TEXT, INPUT, INPUT_ERROR, SELECT } from "../styles/ui"

const MAX_URLS = 10

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

let rowIdCounter = 0
function nextRowId() {
  rowIdCounter += 1
  return rowIdCounter
}

function AddUrlsPanel({ onAccepted }: { onAccepted: () => void }) {
  const [rows, setRows] = useState<{ id: number; value: string }[]>([
    { id: nextRowId(), value: "" },
  ])
  const [results, setResults] = useState<BatchResultItem[] | null>(null)

  const filledValues = rows.map((r) => r.value.trim()).filter(Boolean)
  const uniqueValues = Array.from(new Set(filledValues))
  const duplicateInInput = filledValues.length !== uniqueValues.length
  const invalidValues = filledValues.filter((v) => !isValidHttpUrl(v))

  const mutation = useMutation({
    mutationFn: submitJobUrls,
    onSuccess: (data) => {
      setResults(data)
      const accepted = new Set(data.filter((r) => r.result === "accepted").map((r) => r.url))
      const remaining = rows.filter((r) => !accepted.has(r.value.trim()))
      setRows(remaining.length > 0 ? remaining : [{ id: nextRowId(), value: "" }])
      onAccepted()
    },
  })

  function updateRow(id: number, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)))
  }

  function addRow() {
    if (rows.length >= MAX_URLS) return
    setRows((prev) => [...prev, { id: nextRowId(), value: "" }])
  }

  function removeRow(id: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }

  function handleSubmit() {
    if (uniqueValues.length === 0 || invalidValues.length > 0 || duplicateInInput) return
    mutation.mutate(uniqueValues)
  }

  return (
    <div className="bg-white border border-brand rounded-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-black">Add job URLs</h2>
        <span className="text-xs text-slate-500">
          {rows.length} / {MAX_URLS}
        </span>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const trimmed = row.value.trim()
          const invalid = trimmed.length > 0 && !isValidHttpUrl(trimmed)
          return (
            <div key={row.id} className="flex items-center gap-2">
              <input
                type="text"
                value={row.value}
                onChange={(e) => updateRow(row.id, e.target.value)}
                placeholder="https://…"
                className={`flex-1 min-w-0 ${invalid ? INPUT_ERROR : INPUT}`}
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                title="Remove"
                className={BTN_ICON}
              >
                −
              </button>
              {row === rows[rows.length - 1] && (
                <button
                  type="button"
                  onClick={addRow}
                  disabled={rows.length >= MAX_URLS}
                  title="Add another URL"
                  className={BTN_ICON_PRIMARY}
                >
                  +
                </button>
              )}
            </div>
          )
        })}
      </div>

      {duplicateInInput && (
        <p className="mt-2 text-xs text-red-600">Remove duplicate URLs before submitting.</p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            mutation.isPending ||
            uniqueValues.length === 0 ||
            invalidValues.length > 0 ||
            duplicateInInput
          }
          className={BTN_PRIMARY}
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
    <div className="bg-white border border-brand rounded-sm p-4">
      <h2 className="text-sm font-black uppercase tracking-wide text-black mb-3">Filters</h2>
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Search company or title…"
          value={filters.q ?? ""}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          className={`${INPUT} flex-1 min-w-[180px]`}
        />
        <select
          value={filters.application_status ?? ""}
          onChange={(e) =>
            onChange({ ...filters, application_status: e.target.value || undefined })
          }
          className={SELECT}
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
          className={SELECT}
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
          className={SELECT}
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
          className={SELECT}
        >
          <option value="">All languages</option>
          <option value="de">DE</option>
          <option value="en">EN</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filters.processing_status ?? ""}
          onChange={(e) =>
            onChange({ ...filters, processing_status: e.target.value || undefined })
          }
          className={SELECT}
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
          className={`text-xs ${BTN_TEXT}`}
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
          className={BTN_TEXT}
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
      <td className="px-2 py-1.5">
        <Link to={`/jobs/${job.id}`} className="font-medium text-black hover:underline">
          {job.company_name ?? "—"}
        </Link>{" "}
        <a
          href={job.source_url}
          target="_blank"
          rel="noreferrer"
          title="Visit original posting"
          className="text-brand hover:text-brand-dark"
        >
          ↗
        </a>
      </td>
      <td className="px-2 py-1.5 max-w-[180px] truncate" title={job.job_title ?? undefined}>
        {job.job_title ?? "—"}
      </td>
      <td className="px-2 py-1.5 text-slate-500 text-xs leading-tight">
        <div>{job.role_family ?? "—"}</div>
        <div>
          {job.employment_type ?? "—"} {job.seniority ? `· ${job.seniority}` : ""}
        </div>
      </td>
      <td className="px-2 py-1.5 text-slate-500">
        {job.location ?? "—"} {job.language && `(${job.language.toUpperCase()})`}
      </td>
      <td className="px-2 py-1.5">
        <ApplicationStatusSelect
          value={job.application_status}
          disabled={statusMutation.isPending}
          onChange={(value) => statusMutation.mutate(value)}
        />
      </td>
      <td className="px-2 py-1.5">
        <ProcessingStatusChip status={job.processing_status} />
        <div className="mt-1">
          <JobRowActions job={job} />
        </div>
      </td>
      <td className="px-2 py-1.5 text-slate-500 text-xs leading-tight">
        <div>{job.application_deadline ? `Due ${job.application_deadline}` : ""}</div>
        <div>Added {new Date(job.created_at).toLocaleDateString()}</div>
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
    <div className="bg-white border border-brand rounded-sm p-3">
      <div className="flex items-start justify-between">
        <div>
          <Link to={`/jobs/${job.id}`} className="font-medium text-black hover:underline">
            {job.company_name ?? "Untitled"}
          </Link>{" "}
          <a
            href={job.source_url}
            target="_blank"
            rel="noreferrer"
            title="Visit original posting"
            className="text-brand hover:text-brand-dark"
          >
            ↗
          </a>
        </div>
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
    <div className="space-y-4">
      <AddUrlsPanel onAccepted={() => queryClient.invalidateQueries({ queryKey: ["jobs"] })} />
      <FiltersBar filters={filters} onChange={setFilters} />

      <div>
        {query.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {query.isError && <p className="text-sm text-red-600">Could not load jobs.</p>}

        {query.data && query.data.items.length === 0 && (
          <p className="text-sm text-slate-500">No jobs yet. Add a URL to get started.</p>
        )}

        {query.data && query.data.items.length > 0 && (
          <>
            <div className="hidden md:block overflow-x-auto bg-white border border-brand rounded-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-brand text-left text-xs font-bold text-white uppercase tracking-wide">
                  <tr>
                    <th className="px-2 py-2">Company</th>
                    <th className="px-2 py-2">Title</th>
                    <th className="px-2 py-2">Role</th>
                    <th className="px-2 py-2">Location</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Processing</th>
                    <th className="px-2 py-2">Dates</th>
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
    </div>
  )
}
