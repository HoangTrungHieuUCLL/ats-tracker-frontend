import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ApiError } from "../api/client"
import { useAuth } from "../auth/AuthContext"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(password)
      navigate("/jobs", { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect password.")
      } else if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Try again in a minute.")
      } else {
        setError("Could not reach the server. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-lg shadow-sm border border-slate-200"
      >
        <h1 className="text-lg font-semibold text-slate-900 mb-4">ATS Keyword Tracker</h1>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={submitting || password.length === 0}
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  )
}
