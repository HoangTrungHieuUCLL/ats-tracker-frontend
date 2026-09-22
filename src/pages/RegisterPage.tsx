import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthLayout from "../components/AuthLayout"
import { ApiError } from "../api/client"
import { useAuth } from "../auth/AuthContext"
import { BTN_PRIMARY, INPUT } from "../styles/ui"

export default function RegisterPage() {
  const { register } = useAuth()
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
      await register(username, password)
      navigate("/jobs", { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("That username is already taken.")
      } else if (err instanceof ApiError && err.status === 422) {
        setError("Username must be 3-32 characters (letters, numbers, _.-), password at least 8.")
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
      tag="Private beta"
      title="Join IHATS."
      subtitle="Create an account to start tracking job postings."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-brand font-semibold hover:underline">
            Log in
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full ${INPUT} mb-3`}
        />
        <p className="text-xs text-slate-500 mb-3">At least 8 characters.</p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={submitting || username.length === 0 || password.length < 8}
          className={`w-full ${BTN_PRIMARY}`}
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  )
}
