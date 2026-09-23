import { api } from "./client"
import type {
  BatchResultItem,
  JobDetail,
  JobListResponse,
  JobNote,
  JobUpdatePayload,
} from "./types"

export interface JobFilters {
  processing_status?: string
  application_status?: string
  role_family?: string
  employment_type?: string
  language?: string
  q?: string
  sort_by?: string
  sort_dir?: string
  limit?: number
  offset?: number
}

export function submitJobUrls(urls: string[]): Promise<BatchResultItem[]> {
  return api.post<BatchResultItem[]>("/jobs/batch", { urls })
}

export function listJobs(filters: JobFilters): Promise<JobListResponse> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value))
  }
  const query = params.toString()
  return api.get<JobListResponse>(`/jobs${query ? `?${query}` : ""}`)
}

export function getJob(id: string): Promise<JobDetail> {
  return api.get<JobDetail>(`/jobs/${id}`)
}

export function updateJob(id: string, payload: JobUpdatePayload): Promise<JobDetail> {
  return api.patch<JobDetail>(`/jobs/${id}`, payload)
}

export function deleteJob(id: string): Promise<void> {
  return api.delete<void>(`/jobs/${id}`)
}

export function submitManualText(id: string, text: string): Promise<JobDetail> {
  return api.put<JobDetail>(`/jobs/${id}/manual-text`, { text })
}

export function retryJob(id: string): Promise<JobDetail> {
  return api.post<JobDetail>(`/jobs/${id}/retry`)
}

export function reanalyzeJob(id: string): Promise<JobDetail> {
  return api.post<JobDetail>(`/jobs/${id}/reanalyze`)
}

export function analyzeJob(id: string): Promise<JobDetail> {
  return api.post<JobDetail>(`/jobs/${id}/analyze`)
}

export function addNote(jobId: string, body: string): Promise<JobNote> {
  return api.post<JobNote>(`/jobs/${jobId}/notes`, { body })
}

export function updateNote(noteId: string, body: string): Promise<JobNote> {
  return api.patch<JobNote>(`/notes/${noteId}`, { body })
}

export function deleteNote(noteId: string): Promise<void> {
  return api.delete<void>(`/notes/${noteId}`)
}

export const NON_FINAL_STATUSES = new Set([
  "queued",
  "fetching",
  "extracting",
  "analyzing",
  "quota_wait",
])

export function hasNonFinalJobs(response: JobListResponse | undefined): boolean {
  if (!response) return false
  return response.items.some((job) => NON_FINAL_STATUSES.has(job.processing_status))
}
