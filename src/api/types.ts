export type ProcessingStatus =
  | "queued"
  | "fetching"
  | "extracting"
  | "analyzing"
  | "done"
  | "needs_review"
  | "needs_manual_text"
  | "quota_wait"
  | "failed"

export type ExtractionMethod = "json_ld" | "ats_api" | "readability" | "manual"
export type Language = "de" | "en" | "other"
export type RoleFamily = "data_analyst" | "data_engineer" | "ai_engineer" | "other"
export type Seniority = "intern" | "working_student" | "entry" | "mid" | "senior" | "unknown"
export type EmploymentType =
  | "full_time"
  | "part_time"
  | "internship"
  | "working_student"
  | "trainee"
  | "contract"
  | "unknown"
export type RemotePolicy = "onsite" | "hybrid" | "remote" | "unknown"
export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "closed"
export type KeywordCategory =
  | "hard_skill"
  | "tool"
  | "soft_skill"
  | "certification"
  | "language"
  | "domain_knowledge"
  | "methodology"
export type Importance = "must_have" | "nice_to_have" | "unclear"

export interface BatchResultItem {
  url: string
  result: "accepted" | "duplicate" | "invalid"
  job_id: string | null
  reason: string | null
}

export interface JobListItem {
  id: string
  source_url: string
  company_name: string | null
  job_title: string | null
  role_family: RoleFamily | null
  employment_type: EmploymentType | null
  seniority: Seniority | null
  language: Language | null
  location: string | null
  application_status: ApplicationStatus
  priority: number | null
  processing_status: ProcessingStatus
  processing_error: string | null
  next_attempt_at: string | null
  application_deadline: string | null
  created_at: string
}

export interface JobListResponse {
  items: JobListItem[]
  total: number
}

export interface JobNote {
  id: string
  body: string
  created_at: string
  updated_at: string
}

export interface JobStatusHistoryEntry {
  id: string
  from_status: ApplicationStatus | null
  to_status: ApplicationStatus
  interview_round: number | null
  changed_at: string
}

export interface JobKeywordDetail {
  keyword_id: string
  canonical_name: string
  category: KeywordCategory
  surface_form: string
  importance: Importance
  evidence_found: boolean
}

export interface JobDetail {
  id: string
  source_url: string
  normalized_url: string
  domain: string
  processing_status: ProcessingStatus
  processing_error: string | null
  extraction_method: ExtractionMethod | null
  attempts: number
  raw_text: string | null
  company_name: string | null
  job_title: string | null
  location: string | null
  language: Language | null
  role_family: RoleFamily | null
  seniority: Seniority | null
  employment_type: EmploymentType | null
  remote_policy: RemotePolicy | null
  years_experience_min: number | null
  salary_text: string | null
  application_deadline: string | null
  posted_date: string | null
  summary: string | null
  application_status: ApplicationStatus
  priority: number | null
  interview_round: number | null
  manually_edited_fields: string[]
  llm_model: string | null
  prompt_version: string | null
  analyzed_at: string | null
  created_at: string
  updated_at: string
  notes: JobNote[]
  status_history: JobStatusHistoryEntry[]
  keywords: JobKeywordDetail[]
}

export interface JobUpdatePayload {
  application_status?: ApplicationStatus
  priority?: number | null
  interview_round?: number | null
  company_name?: string | null
  job_title?: string | null
  location?: string | null
  role_family?: RoleFamily | null
  seniority?: Seniority | null
  employment_type?: EmploymentType | null
  remote_policy?: RemotePolicy | null
  application_deadline?: string | null
}

export interface SystemStatus {
  queue_counts: Partial<Record<ProcessingStatus, number>>
  quota: { daily_quota_reached: boolean; resumes_at: string | null }
  llm_model: string
  prompt_version: string
}

export interface SurfaceForm {
  text: string
  language: Language | null
  count: number
}

export interface KeywordDashboardItem {
  keyword_id: string
  canonical_name: string
  category: KeywordCategory
  job_count: number
  share: number
  must_have_count: number
  nice_to_have_count: number
  surface_forms: SurfaceForm[]
}

export interface DashboardKeywordsResponse {
  n_jobs: number
  items: KeywordDashboardItem[]
}

export interface DashboardSummaryResponse {
  by_application_status: Record<string, number>
  by_role_family: Record<string, number>
  by_language: Record<string, number>
  by_employment_type: Record<string, number>
  jobs_per_week: { week: string; count: number }[]
  applications_per_week: { week: string; count: number }[]
  missed_deadline_count: number
}
