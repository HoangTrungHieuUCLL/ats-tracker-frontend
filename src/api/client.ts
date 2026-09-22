const TOKEN_KEY = "ats_tracker_token"
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

let token: string | null = localStorage.getItem(TOKEN_KEY)
let onUnauthorized: (() => void) | null = null

export function setToken(newToken: string | null): void {
  token = newToken
  if (newToken) localStorage.setItem(TOKEN_KEY, newToken)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getToken(): string | null {
  return token
}

export function setOnUnauthorized(callback: () => void): void {
  onUnauthorized = callback
}

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, detail: unknown) {
    super(typeof detail === "string" ? detail : JSON.stringify(detail))
    this.status = status
    this.detail = detail
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (options.body !== undefined) headers.set("Content-Type", "application/json")

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (response.status === 401) {
    setToken(null)
    onUnauthorized?.()
    throw new ApiError(401, "Unauthorized")
  }

  if (!response.ok) {
    let detail: unknown
    try {
      detail = await response.json()
    } catch {
      detail = await response.text()
    }
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) return undefined as T

  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) return (await response.json()) as T
  return (await response.text()) as unknown as T
}

export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string): Promise<T> => request<T>(path, { method: "DELETE" }),
}
