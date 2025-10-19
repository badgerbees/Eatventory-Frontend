import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import ItemsPage from './pages/items'
import SalesPage from './pages/sales'
import LandingPage from './pages/landingpage'
import Nav from './components/Nav'
import Login from './pages/login'
import Register from './pages/register'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className="mt-6">
        <Link to="/dashboard" className="text-blue-600 underline">
          Go to Dashboard
        </Link>
      </div>
    </>
  )
}

function App() {
  function ProtectedRoute({ children }) {
    const { idToken, isConfigured } = useAuth()
    // If Firebase is not configured, show a short message and send to login
  if (!isConfigured) return <Navigate to="/login?from=protected" replace />
  if (!idToken) return <Navigate to="/login?from=protected" replace />
    return children
  }
  return (
    <AuthProvider>
      <BrowserRouter>
        <RouteAwareNav />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

  function RouteAwareNav() {
    // Use hook inside a small component to access location
    const location = useLocation()
    // Show a minimal header on the landing page (only brand/logo)
    if (location.pathname === '/') return <Nav minimal={true} />
    return <Nav />
  }

export default App
