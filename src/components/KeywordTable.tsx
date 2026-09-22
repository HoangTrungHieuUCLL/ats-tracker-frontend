import type { KeywordCategory, KeywordDashboardItem } from "../api/types"

const CATEGORY_LABELS: Record<KeywordCategory, string> = {
  hard_skill: "Hard skill",
  tool: "Tool",
  soft_skill: "Soft skill",
  certification: "Certification",
  language: "Language",
  domain_knowledge: "Domain knowledge",
  methodology: "Methodology",
}

function groupSurfaceForms(item: KeywordDashboardItem) {
  const groups: Record<string, { text: string; count: number }[]> = { de: [], en: [], other: [] }
  for (const sf of item.surface_forms) {
    const key = sf.language ?? "other"
    ;(groups[key] ?? groups.other).push({ text: sf.text, count: sf.count })
  }
  return groups
}

function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {})
}

export default function KeywordTable({
  items,
  onSelect,
  onRename,
  onChangeCategory,
  onMerge,
}: {
  items: KeywordDashboardItem[]
  onSelect: (item: KeywordDashboardItem) => void
  onRename: (item: KeywordDashboardItem) => void
  onChangeCategory: (item: KeywordDashboardItem) => void
  onMerge: (item: KeywordDashboardItem) => void
}) {
  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase">
          <tr>
            <th className="px-3 py-2">Keyword</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Share</th>
            <th className="px-3 py-2">Must-have %</th>
            <th className="px-3 py-2">Exact phrases</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const groups = groupSurfaceForms(item)
            const mustHavePct = Math.round((item.must_have_count / Math.max(item.job_count, 1)) * 100)
            return (
              <tr key={item.keyword_id} className="hover:bg-slate-50">
                <td
                  className="px-3 py-2 font-medium text-slate-900 cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  {item.canonical_name}
                </td>
                <td className="px-3 py-2 text-slate-500">{CATEGORY_LABELS[item.category]}</td>
                <td className="px-3 py-2 text-slate-700">{Math.round(item.share * 100)}%</td>
                <td className="px-3 py-2 text-slate-700">{mustHavePct}%</td>
                <td className="px-3 py-2">
                  {(["de", "en", "other"] as const).map(
                    (lang) =>
                      groups[lang].length > 0 && (
                        <div key={lang} className="mb-1">
                          <span className="text-xs text-slate-400 uppercase mr-1">{lang}</span>
                          {groups[lang].map((sf) => (
                            <span
                              key={sf.text}
                              className="inline-flex items-center gap-1 mr-2 text-xs text-slate-600"
                            >
                              "{sf.text}" ({sf.count})
                              <button
                                type="button"
                                onClick={() => copyToClipboard(sf.text)}
                                title="Copy"
                                className="text-slate-400 hover:text-slate-700"
                              >
                                ⧉
                              </button>
                            </span>
                          ))}
                        </div>
                      ),
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onRename(item)}
                    className="text-xs text-blue-700 underline mr-2"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeCategory(item)}
                    className="text-xs text-blue-700 underline mr-2"
                  >
                    Category
                  </button>
                  <button
                    type="button"
                    onClick={() => onMerge(item)}
                    className="text-xs text-blue-700 underline"
                  >
                    Merge into…
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
