import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell.jsx';
import { DashboardPlaceholder } from './modules/dashboard/DashboardPlaceholder.jsx';

// Simple upcoming milestone placeholder component for other navigation routes
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
      <AppShell>
        {(shellProps) => (
          <Routes>
            <Route path="/" element={<DashboardPlaceholder {...shellProps} />} />
            <Route path="/customers" element={<UpcomingModulePlaceholder title="Customer Management" milestone="M3" />} />
            <Route path="/products" element={<UpcomingModulePlaceholder title="Products & Variants" milestone="M2" />} />
            <Route path="/plans" element={<UpcomingModulePlaceholder title="Subscription Plans" milestone="M2" />} />
            <Route path="/quotations" element={<UpcomingModulePlaceholder title="Quotations & Templates" milestone="M3" />} />
            <Route path="/subscriptions" element={<UpcomingModulePlaceholder title="Subscription Lifecycle" milestone="M4" />} />
            <Route path="/invoices" element={<UpcomingModulePlaceholder title="Recurring Invoices" milestone="M5" />} />
            <Route path="/payments" element={<UpcomingModulePlaceholder title="Payments & Reconciliation" milestone="M6" />} />
            <Route path="/discounts" element={<UpcomingModulePlaceholder title="Discount & Tax Rules" milestone="M6" />} />
            <Route path="/settings" element={<UpcomingModulePlaceholder title="System Settings & Staff" milestone="M1" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
