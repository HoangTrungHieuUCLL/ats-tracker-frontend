import { QueryClientProvider } from "@tanstack/react-query"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { queryClient } from "./api/queryClient"
import { AuthProvider } from "./auth/AuthContext"
import ProtectedRoute from "./auth/ProtectedRoute"
import Layout from "./components/Layout"
import DashboardPage from "./pages/DashboardPage"
import JobDetailPage from "./pages/JobDetailPage"
import JobsPage from "./pages/JobsPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}
