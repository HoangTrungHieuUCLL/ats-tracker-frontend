import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import DashboardFilterBar from "../components/DashboardFilterBar"
import JobsDrawer from "../components/JobsDrawer"
import KeywordTable from "../components/KeywordTable"
import MergeKeywordModal from "../components/MergeKeywordModal"
import TopKeywordsChart from "../components/TopKeywordsChart"
import { getDashboardKeywords, getDashboardSummary, type DashboardKeywordFilters } from "../api/dashboard"
import { mergeKeywords, updateKeyword } from "../api/keywords"
import type { KeywordCategory, KeywordDashboardItem } from "../api/types"

const CATEGORY_TABS: { value: KeywordCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hard_skill", label: "Hard skills" },
  { value: "tool", label: "Tools" },
  { value: "soft_skill", label: "Soft skills" },
  { value: "language", label: "Languages" },
  { value: "certification", label: "Certifications" },
  { value: "domain_knowledge", label: "Domain knowledge" },
  { value: "methodology", label: "Methodology" },
]

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardKeywordFilters>({ limit: 25 })
  const [category, setCategory] = useState<KeywordCategory | "all">("all")
  const [selected, setSelected] = useState<KeywordDashboardItem | null>(null)
  const [renaming, setRenaming] = useState<KeywordDashboardItem | null>(null)
  const [recategorizing, setRecategorizing] = useState<KeywordDashboardItem | null>(null)
  const [merging, setMerging] = useState<KeywordDashboardItem | null>(null)
  const queryClient = useQueryClient()

  const keywordFilters = { ...filters, category: category === "all" ? undefined : category }

  const keywordsQuery = useQuery({
    queryKey: ["dashboard-keywords", keywordFilters],
    queryFn: () => getDashboardKeywords(keywordFilters),
  })
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  })

  const renameMutation = useMutation({
    mutationFn: (name: string) => updateKeyword(renaming!.keyword_id, { canonical_name: name }),
    onSuccess: () => {
      setRenaming(null)
      queryClient.invalidateQueries({ queryKey: ["dashboard-keywords"] })
    },
  })
  const categoryMutation = useMutation({
    mutationFn: (cat: KeywordCategory) =>
      updateKeyword(recategorizing!.keyword_id, { category: cat }),
    onSuccess: () => {
      setRecategorizing(null)
      queryClient.invalidateQueries({ queryKey: ["dashboard-keywords"] })
    },
  })
  const mergeMutation = useMutation({
    mutationFn: (targetId: string) => mergeKeywords(merging!.keyword_id, targetId),
    onSuccess: () => {
      setMerging(null)
      queryClient.invalidateQueries({ queryKey: ["dashboard-keywords"] })
    },
  })

  const nJobs = keywordsQuery.data?.n_jobs ?? 0
  const summary = summaryQuery.data

  const deCount = summary?.by_language["de"] ?? 0
  const enCount = summary?.by_language["en"] ?? 0
  const langTotal = deCount + enCount

  return (
    <div>
      <DashboardFilterBar filters={filters} onChange={setFilters} />

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Jobs analyzed" value={Object.values(summary.by_application_status).reduce((a, b) => a + b, 0)} />
          <KpiCard
            label="Role family split"
            value={Object.entries(summary.by_role_family)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ") || "—"}
          />
          <KpiCard
            label="DE vs EN"
            value={langTotal > 0 ? `${Math.round((deCount / langTotal) * 100)}% DE` : "—"}
          />
          <KpiCard
            label="By application status"
            value={Object.entries(summary.by_application_status)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ") || "—"}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setCategory(tab.value)}
            className={`px-3 py-1.5 text-xs rounded-full border ${
              category === tab.value
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-300 text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {keywordsQuery.isLoading && <p className="text-sm text-slate-500">Loading…</p>}

      {keywordsQuery.data && (
        <>
          <p className="text-sm text-slate-600 mb-2">n = {nJobs} jobs</p>
          {nJobs < 30 && (
            <p className="text-xs text-amber-700 mb-3">
              Small sample: percentages are rough.
            </p>
          )}

          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Top keywords by share of jobs
            </h2>
            {keywordsQuery.data.items.length > 0 ? (
              <TopKeywordsChart items={keywordsQuery.data.items} nJobs={nJobs} />
            ) : (
              <p className="text-sm text-slate-500">No keywords match these filters yet.</p>
            )}
          </div>

          <KeywordTable
            items={keywordsQuery.data.items}
            onSelect={setSelected}
            onRename={setRenaming}
            onChangeCategory={setRecategorizing}
            onMerge={setMerging}
          />
        </>
      )}

      {selected && (
        <JobsDrawer
          keywordId={selected.keyword_id}
          keywordName={selected.canonical_name}
          onClose={() => setSelected(null)}
        />
      )}

      {renaming && (
        <RenamePrompt
          initial={renaming.canonical_name}
          onCancel={() => setRenaming(null)}
          onConfirm={(name) => renameMutation.mutate(name)}
          submitting={renameMutation.isPending}
        />
      )}

      {recategorizing && (
        <CategoryPrompt
          initial={recategorizing.category}
          onCancel={() => setRecategorizing(null)}
          onConfirm={(cat) => categoryMutation.mutate(cat)}
          submitting={categoryMutation.isPending}
        />
      )}

      {merging && keywordsQuery.data && (
        <MergeKeywordModal
          source={merging}
          candidates={keywordsQuery.data.items}
          onClose={() => setMerging(null)}
          onConfirm={(targetId) => mergeMutation.mutate(targetId)}
          submitting={mergeMutation.isPending}
        />
      )}
    </div>
  )
}

function RenamePrompt({
  initial,
  onCancel,
  onConfirm,
  submitting,
}: {
  initial: string
  onCancel: () => void
  onConfirm: (value: string) => void
  submitting: boolean
}) {
  const [value, setValue] = useState(initial)
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Rename keyword</h2>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm mb-3"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm rounded-md border border-slate-300">
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || value.trim().length === 0}
            onClick={() => onConfirm(value.trim())}
            className="px-3 py-1.5 text-sm rounded-md bg-slate-900 text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function CategoryPrompt({
  initial,
  onCancel,
  onConfirm,
  submitting,
}: {
  initial: KeywordCategory
  onCancel: () => void
  onConfirm: (value: KeywordCategory) => void
  submitting: boolean
}) {
  const [value, setValue] = useState<KeywordCategory>(initial)
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Change category</h2>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value as KeywordCategory)}
          className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm mb-3"
        >
          {CATEGORY_TABS.filter((t) => t.value !== "all").map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm rounded-md border border-slate-300">
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => onConfirm(value)}
            className="px-3 py-1.5 text-sm rounded-md bg-slate-900 text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
