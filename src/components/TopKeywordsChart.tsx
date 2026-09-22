import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { KeywordDashboardItem } from "../api/types"

export default function TopKeywordsChart({
  items,
  nJobs,
}: {
  items: KeywordDashboardItem[]
  nJobs: number
}) {
  const top25 = items.slice(0, 25)
  const denominator = Math.max(nJobs, 1)
  const data = top25
    .map((item) => ({
      name: item.canonical_name,
      "Must-have %": Math.round((item.must_have_count / denominator) * 1000) / 10,
      "Nice-to-have %": Math.round((item.nice_to_have_count / denominator) * 1000) / 10,
    }))
    .reverse()

  const height = Math.max(200, data.length * 28)

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 24, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" unit="%" />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Legend />
          <Bar dataKey="Must-have %" stackId="share" fill="#0f172a" />
          <Bar dataKey="Nice-to-have %" stackId="share" fill="#94a3b8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
