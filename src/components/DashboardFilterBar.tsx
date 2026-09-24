import { SELECT } from "../styles/ui"
import type { DashboardKeywordFilters } from "../api/dashboard"

export default function DashboardFilterBar({
  filters,
  onChange,
}: {
  filters: DashboardKeywordFilters
  onChange: (filters: DashboardKeywordFilters) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <select
        value={filters.role_family ?? ""}
        onChange={(e) => onChange({ ...filters, role_family: e.target.value || undefined })}
        className={`${SELECT} col-span-1 w-full`}
      >
        <option value="">All role families</option>
        {["data_analyst", "data_engineer", "ai_engineer", "other"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={filters.language ?? ""}
        onChange={(e) => onChange({ ...filters, language: e.target.value || undefined })}
        className={`${SELECT} col-span-1 w-full`}
      >
        <option value="">All languages</option>
        <option value="de">DE</option>
        <option value="en">EN</option>
        <option value="other">Other</option>
      </select>
      <select
        value={filters.seniority ?? ""}
        onChange={(e) => onChange({ ...filters, seniority: e.target.value || undefined })}
        className={`${SELECT} col-span-1 w-full`}
      >
        <option value="">All seniority</option>
        {["intern", "working_student", "entry", "mid", "senior"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={filters.employment_type ?? ""}
        onChange={(e) => onChange({ ...filters, employment_type: e.target.value || undefined })}
        className={`${SELECT} col-span-1 w-full`}
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
        value={filters.application_status ?? ""}
        onChange={(e) => onChange({ ...filters, application_status: e.target.value || undefined })}
        className={`${SELECT} col-span-1 w-full`}
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
        value={filters.importance ?? ""}
        onChange={(e) => onChange({ ...filters, importance: e.target.value || undefined })}
        className={`${SELECT} col-span-1 w-full`}
      >
        <option value="">All importance</option>
        <option value="must_have">Must-have only</option>
      </select>
      <select
        value={filters.limit ?? 200}
        onChange={(e) => onChange({ ...filters, limit: Number(e.target.value) })}
        className={`${SELECT} col-span-3 w-full`}
      >
        {[25, 50, 100, 200].map((n) => (
          <option key={n} value={n}>
            Top {n} keywords
          </option>
        ))}
      </select>
    </div>
  )
}
