import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Agents } from './pages/Agents';
import { AgentForm } from './pages/AgentForm';
import { AgentDetail } from './pages/AgentDetail';
import { Badges } from './pages/Badges';
import { History } from './pages/History';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { VerificationPage, VerificationSearch } from './pages/Verification';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f1f5f9',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Route publique — vérification QR */}
          <Route path="/verification/:token" element={<VerificationPage />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Routes privées */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/agents/new" element={<AgentForm />} />
                    <Route path="/agents/:id" element={<AgentDetail />} />
                    <Route path="/agents/:id/edit" element={<AgentForm />} />
                    <Route path="/badges" element={<Badges />} />
                    <Route path="/verification" element={<VerificationSearch />} />
                    <Route path="/stats" element={<Stats />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
