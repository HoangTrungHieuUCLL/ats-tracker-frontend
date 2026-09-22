import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export default function AuthLayout({
  tag,
  title,
  subtitle,
  children,
  footer,
}: {
  tag: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand flex flex-col">
      <div className="bg-brand-dark text-white text-center text-sm py-2 px-4 border-b border-white/20">
        <Link to="/jobs" className="hover:underline tracking-wide">
          IHATS — track postings, spot skill gaps, land the role →
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <span className="inline-block border border-dashed border-white/50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white/90 rounded-sm mb-4">
            {tag}
          </span>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">{title}</h1>
          <p className="text-white/90 mb-8">{subtitle}</p>

          <div className="bg-white rounded-sm shadow-xl border border-brand-dark p-6">
            {children}
            <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
