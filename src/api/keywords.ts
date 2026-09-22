import { api } from "./client"
import type { JobListItem, KeywordCategory } from "./types"

export function getJobsForKeyword(keywordId: string): Promise<JobListItem[]> {
  return api.get<JobListItem[]>(`/keywords/${keywordId}/jobs`)
}

export function updateKeyword(
  keywordId: string,
  payload: { canonical_name?: string; category?: KeywordCategory },
): Promise<unknown> {
  return api.patch(`/keywords/${keywordId}`, payload)
}

export function mergeKeywords(sourceId: string, targetId: string): Promise<unknown> {
  return api.post("/keywords/merge", {
    source_keyword_id: sourceId,
    target_keyword_id: targetId,
  })
}
