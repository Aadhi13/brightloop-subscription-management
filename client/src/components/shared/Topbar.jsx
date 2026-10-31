import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../modules/auth/useAuth.js';
import { useNavigate } from 'react-router-dom';

export const Topbar = ({ onToggleSidebar, healthData, isHealthLoading }) => {
  const { user, customer, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isHealthy = healthData?.status === 'healthy';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = customer?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone bg-surface px-4 lg:px-8">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-muted hover:bg-paper hover:text-charcoal lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-charcoal lg:text-lg">
            Subscription Operations
          </h1>
          <p className="hidden text-xs text-muted sm:block">
            Brightloop Software • INR / Asia-Kolkata
          </p>
        </div>
      </div>

      {/* Right: Health indicator & user profile pill */}
      <div className="flex items-center space-x-4">
        {/* Backend health status pill */}
        <div className="flex items-center space-x-2 rounded-full border border-stone bg-paper px-3 py-1 text-xs">
          <span className="relative flex h-2 w-2">
            {isHealthLoading ? (
              <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
            ) : isHealthy ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-forest" />
              </>
            ) : (
              <span className="h-2 w-2 rounded-full bg-terracotta" />
            )}
          </span>
          <span className="hidden font-medium text-charcoal sm:inline">
            {isHealthLoading
              ? 'Checking API...'
              : isHealthy
              ? 'API & Atlas Online'
              : 'Service Degraded'}
          </span>
        </div>

        {/* User profile & Logout */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-3 border-l border-stone pl-4">
            <div className="hidden text-right text-xs md:block">
              <div className="font-semibold text-charcoal">{displayName}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted">
                {user?.role}
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white font-semibold text-xs shadow-2xs">
              {initials}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-terracotta transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-l border-stone pl-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-hover"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
