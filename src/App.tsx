import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TrophyProvider } from './context/TrophyContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TrophyPopup } from './components/TrophyPopup'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Actions } from './pages/Actions'
import { Trophies } from './pages/Trophies'
import './index.css'

function App() {
  return (
    <TrophyProvider>
      <BrowserRouter>
        <TrophyPopup />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/actions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Actions />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trophies"
            element={
              <ProtectedRoute>
                <Layout>
                  <Trophies />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TrophyProvider>
  )
}

export default App
