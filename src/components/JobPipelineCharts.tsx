import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { DashboardSummaryResponse } from "../api/types"

const STATUS_COLORS: Record<string, string> = {
  saved: "#94A3B8",
  applied: "#2541D6",
  interviewing: "#5B74E8",
  offer: "#16A34A",
  rejected: "#DC2626",
  withdrawn: "#F59E0B",
  closed: "#334155",
}

export default function JobPipelineCharts({ summary }: { summary: DashboardSummaryResponse }) {
  const statusData = Object.entries(summary.by_application_status)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }))

  const weekData = summary.applications_per_week.map((w) => ({
    week: w.week,
    Applications: w.count,
  }))

  return (
    <div className="space-y-4">
      {summary.missed_deadline_count > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-sm px-3 py-2 text-sm text-amber-800">
          <span className="font-bold">{summary.missed_deadline_count}</span> saved job
          {summary.missed_deadline_count === 1 ? "" : "s"} past its application deadline —
          still sitting as "saved".
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-brand rounded-sm p-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-black mb-2">
            Jobs by status
          </h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94A3B8"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No jobs yet.</p>
          )}
        </div>

        <div className="bg-white border border-brand rounded-sm p-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-black mb-2">
            Applications submitted per week
          </h3>
          {weekData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weekData} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Applications" fill="#2541D6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No applications submitted yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
