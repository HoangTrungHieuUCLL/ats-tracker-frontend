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
import { BTN_PRIMARY, BTN_SECONDARY, INPUT, SELECT } from "../styles/ui"

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

function KpiCard({
  label,
  value,
  breakdown,
}: {
  label: string
  value: string | number
  breakdown?: [string, number][]
}) {
  return (
    <div className="bg-white border border-brand rounded-sm px-3 py-2">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">
        {label}
      </p>
      {breakdown && breakdown.length > 0 ? (
        <ul className="text-xs text-black leading-tight">
          {breakdown.map(([k, v]) => (
            <li key={k} className="flex justify-between gap-2">
              <span className="truncate">{k}</span>
              <span className="font-bold shrink-0">{v}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lg font-black text-black truncate">{value}</p>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardKeywordFilters>({ limit: 10 })
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

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 mb-6 items-start">
        {summary && (
          <div className="space-y-2">
            <KpiCard
              label="Jobs analyzed"
              value={Object.values(summary.by_application_status).reduce((a, b) => a + b, 0)}
            />
            <KpiCard
              label="Role family split"
              value=""
              breakdown={Object.entries(summary.by_role_family) as [string, number][]}
            />
            <KpiCard
              label="DE vs EN"
              value={langTotal > 0 ? `${Math.round((deCount / langTotal) * 100)}% DE` : "—"}
            />
            <KpiCard
              label="By application status"
              value=""
              breakdown={Object.entries(summary.by_application_status) as [string, number][]}
            />
          </div>
        )}

        {keywordsQuery.data && (
          <div className="bg-white border border-brand rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black uppercase tracking-wide text-black">
                Top keywords by share of jobs
              </h2>
              <p className="text-xs text-slate-500">
                n = {nJobs} jobs{nJobs < 30 && " · small sample, percentages are rough"}
              </p>
            </div>
            {keywordsQuery.data.items.length > 0 ? (
              <TopKeywordsChart items={keywordsQuery.data.items} nJobs={nJobs} />
            ) : (
              <p className="text-sm text-slate-500">No keywords match these filters yet.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setCategory(tab.value)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full border ${
              category === tab.value
                ? "bg-brand text-white border-brand"
                : "border-brand text-brand hover:bg-brand hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {keywordsQuery.isLoading && <p className="text-sm text-slate-500">Loading…</p>}

      {keywordsQuery.data && (
        <>
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
      <div className="bg-white shadow-lg max-w-sm w-full p-5 border border-brand-dark rounded-sm">
        <h2 className="text-base font-black uppercase tracking-wide text-black mb-3">Rename keyword</h2>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`w-full ${INPUT} mb-3`}
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={BTN_SECONDARY}>
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || value.trim().length === 0}
            onClick={() => onConfirm(value.trim())}
            className={BTN_PRIMARY}
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
      <div className="bg-white shadow-lg max-w-sm w-full p-5 border border-brand-dark rounded-sm">
        <h2 className="text-base font-black uppercase tracking-wide text-black mb-3">Change category</h2>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value as KeywordCategory)}
          className={`w-full ${SELECT} mb-3`}
        >
          {CATEGORY_TABS.filter((t) => t.value !== "all").map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={BTN_SECONDARY}>
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => onConfirm(value)}
            className={BTN_PRIMARY}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
