import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/useAuth.js';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-forest" />
        <p className="mt-3 text-sm text-muted">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="rounded-xl border border-terracotta/30 bg-surface p-8 text-center shadow-2xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-subtle text-terracotta">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-charcoal">Access Restricted</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Your account role (<span className="font-semibold uppercase">{user.role}</span>) does not have permission to access this section.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center rounded-lg bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-hover transition-colors"
          >
            Return to Overview
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
