import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="min-h-screen bg-red-600 flex flex-col">
      <div className="bg-black text-white text-center text-sm py-2 px-4">
        <Link to="/jobs" className="hover:underline">
          ATS Keyword Tracker — track postings, spot skill gaps, land the role →
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">{title}</h1>
          <p className="text-white/90 mb-8">{subtitle}</p>

          <div className="bg-white rounded-lg shadow-xl p-6">
            {children}
            <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
