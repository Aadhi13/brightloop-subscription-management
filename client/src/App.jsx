import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './modules/auth/AuthContext.jsx';
import { ProtectedRoute } from './components/shared/ProtectedRoute.jsx';
import { AppShell } from './layouts/AppShell.jsx';
import { LoginPage } from './modules/auth/LoginPage.jsx';
import { RegisterPage } from './modules/auth/RegisterPage.jsx';
import { ForgotPasswordPage } from './modules/auth/ForgotPasswordPage.jsx';
import { StaffManagement } from './modules/settings/StaffManagement.jsx';
import { DashboardPlaceholder } from './modules/dashboard/DashboardPlaceholder.jsx';

const UpcomingModulePlaceholder = ({ title, milestone }) => (
  <div className="rounded-xl border border-stone bg-surface p-8 text-center shadow-2xs">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-subtle text-forest">
      <span className="font-mono text-sm font-semibold">{milestone}</span>
    </div>
    <h3 className="mt-4 text-lg font-semibold text-charcoal">{title}</h3>
    <p className="mt-1 text-sm text-muted">
      This module is scheduled for implementation in upcoming milestone {milestone}.
    </p>
    <div className="mt-6">
      <span className="inline-flex items-center rounded-md border border-stone px-3 py-1 text-xs font-medium text-muted">
        Foundation active • No business logic yet
      </span>
    </div>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes inside AppShell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell>
                  {(shellProps) => <DashboardPlaceholder {...shellProps} />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <AppShell>
                  {() => <UpcomingModulePlaceholder title="Customer Management" milestone="M3" />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <AppShell>
                  {() => <UpcomingModulePlaceholder title="Products & Variants" milestone="M2" />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/plans"
            element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <AppShell>
                  {() => <UpcomingModulePlaceholder title="Subscription Plans" milestone="M2" />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/quotations"
            element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <AppShell>
                  {() => <UpcomingModulePlaceholder title="Quotations & Templates" milestone="M3" />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <AppShell>
                  {() => <UpcomingModulePlaceholder title="Subscriptions Lifecycle" milestone="M4" />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <AppShell>
                  {() => <UpcomingModulePlaceholder title="Recurring Invoices" milestone="M5" />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <AppShell>
                  {() => <UpcomingModulePlaceholder title="Payments & Reconciliation" milestone="M6" />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/discounts"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  {() => <UpcomingModulePlaceholder title="Discount & Tax Rules" milestone="M6" />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/staff"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  {() => <StaffManagement />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  {() => <StaffManagement />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <AppShell>
                  {() => <UpcomingModulePlaceholder title="Customer Profile & Settings" milestone="M1" />}
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
