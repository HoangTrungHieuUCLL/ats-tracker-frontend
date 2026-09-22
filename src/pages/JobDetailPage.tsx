import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ApplicationStatusSelect from "../components/ApplicationStatusSelect"
import KeywordsPanel from "../components/KeywordsPanel"
import NotesPanel from "../components/NotesPanel"
import ProcessingStatusChip from "../components/ProcessingStatusChip"
import { deleteJob, getJob, reanalyzeJob, updateJob } from "../api/jobs"
import type { ApplicationStatus, JobUpdatePayload } from "../api/types"

const EDITABLE_FIELDS: { key: keyof JobUpdatePayload; label: string }[] = [
  { key: "company_name", label: "Company" },
  { key: "job_title", label: "Job title" },
  { key: "location", label: "Location" },
  { key: "role_family", label: "Role family" },
  { key: "seniority", label: "Seniority" },
  { key: "employment_type", label: "Employment type" },
  { key: "remote_policy", label: "Remote policy" },
  { key: "application_deadline", label: "Application deadline" },
]

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [rawTextOpen, setRawTextOpen] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})

  const query = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id!),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: JobUpdatePayload) => updateJob(id!, payload),
    onSuccess: () => {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ["job", id] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })

  const reanalyzeMutation = useMutation({
    mutationFn: () => reanalyzeJob(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job", id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteJob(id!),
    onSuccess: () => navigate("/jobs"),
  })

  if (query.isLoading) return <p className="text-sm text-slate-500">Loading…</p>
  if (query.isError || !query.data) return <p className="text-sm text-red-600">Job not found.</p>

  const job = query.data
  const isEdited = (field: string) => job.manually_edited_fields.includes(field)

  function startEditing() {
    setDraft({
      company_name: job.company_name ?? "",
      job_title: job.job_title ?? "",
      location: job.location ?? "",
      role_family: job.role_family ?? "",
      seniority: job.seniority ?? "",
      employment_type: job.employment_type ?? "",
      remote_policy: job.remote_policy ?? "",
      application_deadline: job.application_deadline ?? "",
    })
    setEditing(true)
  }

  function saveEditing() {
    const payload: JobUpdatePayload = {}
    for (const { key } of EDITABLE_FIELDS) {
      const value = draft[key]
      ;(payload as Record<string, string | null>)[key] = value === "" ? null : value
    }
    updateMutation.mutate(payload)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold text-black">{job.job_title ?? "Untitled"}</h1>
            <p className="text-sm text-slate-600">
              {job.company_name ?? "—"} {job.location ? `· ${job.location}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProcessingStatusChip status={job.processing_status} />
            <a
              href={job.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-red-600 underline"
            >
              Original posting
            </a>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ApplicationStatusSelect
            value={job.application_status}
            onChange={(value: ApplicationStatus) =>
              updateMutation.mutate({
                application_status: value,
                interview_round: value === "interviewing" ? (job.interview_round ?? 1) : job.interview_round,
              })
            }
          />
          {job.application_status === "interviewing" && (
            <label className="text-sm text-slate-600 flex items-center gap-1">
              Round
              <input
                type="number"
                min={1}
                defaultValue={job.interview_round ?? 1}
                onBlur={(e) =>
                  updateMutation.mutate({ interview_round: Number(e.target.value) || 1 })
                }
                className="w-16 border border-slate-300 rounded-md px-1 py-0.5 text-sm"
              />
            </label>
          )}
        </div>

        {job.status_history.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Status history</h3>
            <ul className="text-xs text-slate-500 space-y-0.5">
              {job.status_history.map((h) => (
                <li key={h.id}>
                  {new Date(h.changed_at).toLocaleString()}: {h.from_status ?? "—"} → {h.to_status}
                  {h.interview_round ? ` (round ${h.interview_round})` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-black">Details</h2>
          {!editing ? (
            <button type="button" onClick={startEditing} className="text-xs text-red-600 underline">
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveEditing}
                disabled={updateMutation.isPending}
                className="text-xs text-red-600 underline"
              >
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-xs text-slate-500">
                Cancel
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-2 gap-3">
            {EDITABLE_FIELDS.map(({ key, label }) => (
              <label key={key} className="text-xs text-slate-600">
                {label}
                <input
                  value={draft[key] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="mt-0.5 w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
                />
              </label>
            ))}
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {EDITABLE_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <dt className="text-xs text-slate-500">
                  {label}
                  {isEdited(key) && (
                    <span className="ml-1 text-slate-400" title="Manually edited">
                      ✎
                    </span>
                  )}
                </dt>
                <dd className="text-slate-800">
                  {(job as unknown as Record<string, string | null>)[key] ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {job.summary && (
          <p className="mt-4 text-sm text-slate-700 border-t border-slate-100 pt-3">{job.summary}</p>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-black mb-3">Keywords</h2>
        <KeywordsPanel keywords={job.keywords} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-black mb-3">Notes</h2>
        <NotesPanel jobId={job.id} notes={job.notes} />
      </div>

      {job.raw_text && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <button
            type="button"
            onClick={() => setRawTextOpen((v) => !v)}
            className="text-sm font-semibold text-black"
          >
            {rawTextOpen ? "▾" : "▸"} Raw job text
          </button>
          {rawTextOpen && (
            <pre className="mt-3 text-xs text-slate-600 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {job.raw_text}
            </pre>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reanalyzeMutation.mutate()}
          disabled={reanalyzeMutation.isPending || !job.raw_text}
          className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-50"
        >
          Re-analyze
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Delete this job permanently?")) deleteMutation.mutate()
          }}
          disabled={deleteMutation.isPending}
          className="px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
