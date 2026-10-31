import {
  CheckCircle2,
  Database,
  Repeat,
  IndianRupee,
  AlertTriangle,
  Receipt,
  Server,
  RefreshCw,
  Clock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';

export const DashboardPlaceholder = ({ healthData, isHealthLoading, onRefreshHealth, healthError }) => {
  const { user, customer } = useAuth();
  const isConnected = healthData?.database === 'connected';

  return (
    <div className="space-y-6">
      {/* Top Welcome & Milestone Banner */}
      <div className="rounded-xl border border-stone bg-surface p-6 shadow-2xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-forest-subtle px-2.5 py-0.5 text-xs font-semibold text-forest">
                Milestone M1 Active
              </span>
              <span className="text-xs text-muted">Authentication & RBAC Enforced</span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-charcoal sm:text-2xl">
              Welcome, {customer?.name || user?.email?.split('@')[0] || 'Administrator'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {user?.role === 'customer'
                ? `Customer Portal for ${customer?.companyName || customer?.name || 'Active Customer'} • Self-service subscriptions & invoices`
                : 'Verdant Ledger Subscription Management & Recurring Revenue Engine'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 rounded-lg border border-stone bg-paper/60 px-3 py-1.5 text-xs">
              <ShieldCheck className="h-4 w-4 text-forest" />
              <span className="font-semibold text-charcoal uppercase tracking-wider">{user?.role}</span>
            </div>
            <button
              type="button"
              onClick={onRefreshHealth}
              disabled={isHealthLoading}
              className="inline-flex items-center space-x-2 rounded-lg border border-stone bg-paper px-3.5 py-2 text-xs font-medium text-charcoal hover:bg-stone-light/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isHealthLoading ? 'animate-spin' : ''}`} />
              <span>Sync Health</span>
            </button>
          </div>
        </div>
      </div>

      {/* Authenticated Context Card */}
      <div className="rounded-xl border border-forest/30 bg-forest-subtle/30 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-charcoal">
                Active Session: <span className="font-mono">{user?.email}</span>
              </div>
              <div className="text-[11px] text-muted">
                Role: <span className="font-semibold uppercase text-forest">{user?.role}</span>
                {customer?.companyName && ` • Organization: ${customer.companyName}`}
                {` • JWT Auth: HttpOnly Cookie Verified`}
              </div>
            </div>
          </div>
          <div className="text-[11px] font-medium text-forest">
            Server-side authorization enforced
          </div>
        </div>
      </div>

      {/* Live System Connectivity & Architecture Verification */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* API Backend status */}
        <div className="rounded-xl border border-stone bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Express API</span>
            <Server className="h-4 w-4 text-forest" />
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className={`inline-flex h-full w-full rounded-full ${healthData?.status === 'healthy' ? 'bg-forest' : 'bg-amber'}`} />
            </span>
            <span className="text-lg font-semibold text-charcoal">
              {healthData?.status === 'healthy' ? 'Express Online' : isHealthLoading ? 'Checking...' : 'Degraded'}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            ES modules • Port 5000 • CSRF & Rate Limiting active
          </p>
        </div>

        {/* MongoDB Atlas status */}
        <div className="rounded-xl border border-stone bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Database Engine</span>
            <Database className="h-4 w-4 text-forest" />
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className={`inline-flex h-full w-full rounded-full ${isConnected ? 'bg-forest' : 'bg-terracotta'}`} />
            </span>
            <span className="text-lg font-semibold text-charcoal">
              {isConnected ? 'MongoDB Atlas' : 'Disconnected'}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Database: <span className="font-mono font-medium">brightloop</span> • User & Customer collections indexed
          </p>
        </div>

        {/* Health Check Details */}
        <div className="rounded-xl border border-stone bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Health Endpoint</span>
            <Clock className="h-4 w-4 text-forest" />
          </div>
          <div className="mt-3 text-lg font-semibold tabular-nums text-charcoal">
            {healthData?.uptime !== undefined ? `${healthData.uptime}s uptime` : '—'}
          </div>
          <p className="mt-1 text-xs text-muted">
            Endpoint: <span className="font-mono">/api/health</span> • {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Awaiting sync'}
          </p>
        </div>
      </div>

      {/* KPI Cards Placeholder (Verdant Ledger styled) */}
      <div>
        <h3 className="mb-3 text-sm font-semibold tracking-wide text-charcoal uppercase">
          Key Performance Indicators (Preview)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active Subscriptions */}
          <div className="rounded-xl border border-stone bg-surface p-5 shadow-2xs">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Active Subscriptions</span>
              <Repeat className="h-4 w-4 text-forest" />
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-charcoal">0</div>
            <p className="mt-1 text-xs text-muted">Recurring customer plans</p>
          </div>

          {/* Cash Received */}
          <div className="rounded-xl border border-stone bg-surface p-5 shadow-2xs">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Cash Received</span>
              <IndianRupee className="h-4 w-4 text-forest" />
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-charcoal">₹0.00</div>
            <p className="mt-1 text-xs text-muted">Stored as integer paise</p>
          </div>

          {/* Outstanding Balance */}
          <div className="rounded-xl border border-stone bg-surface p-5 shadow-2xs">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Outstanding Balance</span>
              <Receipt className="h-4 w-4 text-amber" />
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-amber">₹0.00</div>
            <p className="mt-1 text-xs text-muted">Pending invoice settlements</p>
          </div>

          {/* Overdue Invoices */}
          <div className="rounded-xl border border-stone bg-surface p-5 shadow-2xs">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Overdue Invoices</span>
              <AlertTriangle className="h-4 w-4 text-terracotta" />
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-terracotta">0</div>
            <p className="mt-1 text-xs text-muted">Past due payment terms</p>
          </div>
        </div>
      </div>

      {/* M1 Milestones Completed Checklist */}
      <div className="rounded-xl border border-stone bg-surface p-6 shadow-2xs">
        <h3 className="text-base font-semibold text-charcoal">M1 Security and Authorization Invariants</h3>
        <p className="mt-1 text-xs text-muted">
          All RBAC rules, cryptographic hashing, and ownership boundaries validated.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex items-start space-x-3 rounded-lg border border-stone/60 bg-paper/50 p-3">
            <CheckCircle2 className="h-5 w-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-charcoal">Customer Self-Registration</h4>
              <p className="text-xs text-muted">Creates customer account and linked Customer document. Cannot assign privileged roles.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border border-stone/60 bg-paper/50 p-3">
            <CheckCircle2 className="h-5 w-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-charcoal">HttpOnly JWT Session Cookies</h4>
              <p className="text-xs text-muted">Tokens never exposed in JSON responses. Cleared cleanly on logout.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border border-stone/60 bg-paper/50 p-3">
            <CheckCircle2 className="h-5 w-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-charcoal">Server-Side RBAC & Staff Provisioning</h4>
              <p className="text-xs text-muted">Only Admin can provision staff. Staff and Customer attempts receive 403 Forbidden.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border border-stone/60 bg-paper/50 p-3">
            <CheckCircle2 className="h-5 w-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-charcoal">Database-Level Customer Ownership</h4>
              <p className="text-xs text-muted">Customers cannot read or update another customer profile. Generic authentication errors prevent account enumeration.</p>
            </div>
          </div>
        </div>

        {healthError && (
          <div className="mt-4 rounded-lg border border-terracotta/30 bg-terracotta-subtle p-3 text-xs text-terracotta">
            <strong>Connectivity Warning:</strong> {healthError.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
