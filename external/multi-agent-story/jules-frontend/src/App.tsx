import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewSession from './pages/NewSession'
import SessionDetail from './pages/SessionDetail'
import IdeaGeneration from './pages/IdeaGeneration'
import ReviewPhase from './pages/ReviewPhase'
import Tournament from './pages/Tournament'
import FinalDecision from './pages/FinalDecision'
import History from './pages/History'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewSession />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SessionDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions/:id/ideas"
              element={
                <ProtectedRoute>
                  <Layout>
                    <IdeaGeneration />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions/:id/review"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReviewPhase />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions/:id/tournament"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Tournament />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions/:id/decision"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FinalDecision />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <Layout>
                    <History />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App