import { api } from "./client"

export async function login(username: string, password: string): Promise<string> {
  const response = await api.post<{ access_token: string }>("/auth/login", {
    username,
    password,
  })
  return response.access_token
}

export async function register(username: string, password: string): Promise<string> {
  const response = await api.post<{ access_token: string }>("/auth/register", {
    username,
    password,
  })
  return response.access_token
}
