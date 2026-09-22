import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthLayout from "../components/AuthLayout"
import { ApiError } from "../api/client"
import { useAuth } from "../auth/AuthContext"
import { BTN_PRIMARY, INPUT } from "../styles/ui"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      navigate("/jobs", { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect username or password.")
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
    <AuthLayout
      title="Howdy, mate!"
      subtitle="Log in to track your job search."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="text-red-600 font-semibold hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoFocus
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`w-full ${INPUT} mb-3`}
        />
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full ${INPUT} mb-3`}
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={submitting || username.length === 0 || password.length === 0}
          className={`w-full ${BTN_PRIMARY}`}
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  )
}
