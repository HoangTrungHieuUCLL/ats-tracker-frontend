import { useQuery } from "@tanstack/react-query"
import { NavLink, Outlet } from "react-router-dom"
import { getSystemStatus } from "../api/system"
import { useAuth } from "../auth/AuthContext"

function formatMunichTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function QueueIndicator() {
  const { data } = useQuery({
    queryKey: ["system-status"],
    queryFn: getSystemStatus,
    refetchInterval: 5000,
  })

  if (!data) return null

  if (data.quota.daily_quota_reached && data.quota.resumes_at) {
    return (
      <span className="text-sm text-red-300">
        Gemini daily quota reached. Resumes at {formatMunichTime(data.quota.resumes_at)} Munich time
      </span>
    )
  }

  const processing =
    (data.queue_counts.queued ?? 0) +
    (data.queue_counts.fetching ?? 0) +
    (data.queue_counts.extracting ?? 0) +
    (data.queue_counts.analyzing ?? 0)

  if (processing === 0) return null

  return <span className="text-sm text-white/70">{processing} processing</span>
}

export default function Layout() {
  const { logout } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-sm text-sm font-bold uppercase tracking-wide ${
      isActive ? "bg-white text-brand-dark" : "text-white/80 hover:text-white hover:bg-white/10"
    }`

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-brand-dark border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <span className="text-white font-black text-lg tracking-tight uppercase">IHATS</span>
            <NavLink to="/jobs" className={linkClass}>
              Jobs
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          </div>
          <div className="flex items-center gap-4">
            <QueueIndicator />
            <button
              onClick={logout}
              className="text-sm font-bold uppercase tracking-wide text-white/70 hover:text-white"
              type="button"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
