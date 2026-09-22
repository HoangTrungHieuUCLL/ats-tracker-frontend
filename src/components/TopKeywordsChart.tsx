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

const MAX_HEIGHT = 300
const MAX_BARS = 10

export default function TopKeywordsChart({
  items,
  nJobs,
}: {
  items: KeywordDashboardItem[]
  nJobs: number
}) {
  const denominator = Math.max(nJobs, 1)
  // items already arrive sorted by job_count desc — only the chart (the
  // compact "landing" view) caps how many bars it shows. The keyword table
  // below it still lists every item the query returned.
  const data = items
    .slice(0, MAX_BARS)
    .map((item) => ({
      name: item.canonical_name,
      "Must-have %": Math.round((item.must_have_count / denominator) * 1000) / 10,
      "Nice-to-have %": Math.round((item.nice_to_have_count / denominator) * 1000) / 10,
    }))
    .reverse()

  const naturalHeight = Math.max(160, data.length * 28)
  const height = Math.min(naturalHeight, MAX_HEIGHT)

  return (
    <div style={{ width: "100%", height: MAX_HEIGHT, overflowY: naturalHeight > MAX_HEIGHT ? "auto" : "visible" }}>
      <div style={{ width: "100%", height: naturalHeight > MAX_HEIGHT ? naturalHeight : height }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 24, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" unit="%" />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend />
            <Bar dataKey="Must-have %" stackId="share" fill="#152A7A" />
            <Bar dataKey="Nice-to-have %" stackId="share" fill="#5B74E8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
