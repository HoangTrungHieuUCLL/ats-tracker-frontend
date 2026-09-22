import type { JobKeywordDetail, KeywordCategory } from "../api/types"

const CATEGORY_LABELS: Record<KeywordCategory, string> = {
  hard_skill: "Hard skills",
  tool: "Tools",
  soft_skill: "Soft skills",
  certification: "Certifications",
  language: "Languages",
  domain_knowledge: "Domain knowledge",
  methodology: "Methodology",
}

const CATEGORY_ORDER: KeywordCategory[] = [
  "hard_skill",
  "tool",
  "soft_skill",
  "language",
  "certification",
  "domain_knowledge",
  "methodology",
]

export default function KeywordsPanel({ keywords }: { keywords: JobKeywordDetail[] }) {
  if (keywords.length === 0) {
    return <p className="text-sm text-slate-500">No keywords extracted yet.</p>
  }

  const byCategory = new Map<KeywordCategory, JobKeywordDetail[]>()
  for (const kw of keywords) {
    const list = byCategory.get(kw.category) ?? []
    list.push(kw)
    byCategory.set(kw.category, list)
  }

  return (
    <div className="space-y-4">
      {CATEGORY_ORDER.filter((cat) => byCategory.has(cat)).map((cat) => (
        <div key={cat}>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            {CATEGORY_LABELS[cat]}
          </h3>
          <div className="flex flex-wrap gap-2">
            {byCategory.get(cat)!.map((kw) => (
              <span
                key={`${kw.keyword_id}-${kw.surface_form}`}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium border ${
                  kw.importance === "must_have"
                    ? "border-brand bg-brand text-white"
                    : kw.importance === "nice_to_have"
                      ? "border-brand bg-white text-slate-900"
                      : "border-dashed border-slate-300 text-slate-500"
                }`}
              >
                {kw.canonical_name} <span className="opacity-70">"{kw.surface_form}"</span>
                {!kw.evidence_found && (
                  <span title="Not found verbatim in the extracted text — may be an LLM error">
                    ⚠️
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
