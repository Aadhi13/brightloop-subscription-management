import { Menu } from 'lucide-react';

export const Topbar = ({ onToggleSidebar, healthData, isHealthLoading }) => {
  const isHealthy = healthData?.status === 'healthy';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone bg-surface px-4 lg:px-8">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-muted hover:bg-paper hover:text-charcoal lg:hidden"
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

        {/* Role & User placeholder */}
        <div className="flex items-center space-x-2.5 border-l border-stone pl-4">
          <div className="hidden text-right text-xs md:block">
            <div className="font-medium text-charcoal">System Administrator</div>
            <div className="text-[11px] text-muted">Admin Role</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-light text-charcoal border border-stone font-semibold text-xs shadow-2xs">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
