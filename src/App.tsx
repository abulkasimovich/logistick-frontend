import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Loads from './pages/Loads';
import Drivers from './pages/Drivers';
import Dispatchers from './pages/Dispatchers';
import Customers from './pages/Customers';
import Financials from './pages/Financials';
import Fuel from './pages/Fuel';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const token = useAuthStore(s => s.token);

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/"             element={<Overview />} />
                <Route path="/loads"        element={<Loads />} />
                <Route path="/drivers"      element={<Drivers />} />
                <Route path="/dispatchers"  element={<Dispatchers />} />
                <Route path="/customers"    element={<Customers />} />
                <Route path="/financials"   element={<Financials />} />
                <Route path="/fuel"         element={<Fuel />} />
                <Route path="/reports"      element={<Reports />} />
                <Route path="/settings"     element={<Settings />} />
                <Route path="*"             element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
