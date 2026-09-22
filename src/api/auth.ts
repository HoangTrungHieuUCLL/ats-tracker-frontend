import { api } from "./client"

export async function login(password: string): Promise<string> {
  const response = await api.post<{ access_token: string }>("/auth/login", { password })
  return response.access_token
}
