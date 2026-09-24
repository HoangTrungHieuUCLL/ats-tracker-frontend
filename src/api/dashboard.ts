import { api } from "./client"
import type { DashboardKeywordsResponse, DashboardSummaryResponse } from "./types"

export interface DashboardKeywordFilters {
  role_family?: string
  language?: string
  seniority?: string
  employment_type?: string
  application_status?: string
  importance?: string
  category?: string
  limit?: number
}

export function getDashboardKeywords(
  filters: DashboardKeywordFilters,
): Promise<DashboardKeywordsResponse> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value))
  }
  const query = params.toString()
  return api.get<DashboardKeywordsResponse>(`/dashboard/keywords${query ? `?${query}` : ""}`)
}

export function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  return api.get<DashboardSummaryResponse>("/dashboard/summary")
}
