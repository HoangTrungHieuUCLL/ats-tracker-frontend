import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { login as apiLogin, register as apiRegister } from "../api/auth"
import { getToken, setOnUnauthorized, setToken } from "../api/client"
import { queryClient } from "../api/queryClient"

interface AuthContextValue {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getToken() !== null)

  useEffect(() => {
    setOnUnauthorized(() => setIsAuthenticated(false))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      login: async (username: string, password: string) => {
        const token = await apiLogin(username, password)
        setToken(token)
        setIsAuthenticated(true)
      },
      register: async (username: string, password: string) => {
        const token = await apiRegister(username, password)
        setToken(token)
        setIsAuthenticated(true)
      },
      logout: () => {
        setToken(null)
        queryClient.clear()
        setIsAuthenticated(false)
      },
    }),
    [isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
