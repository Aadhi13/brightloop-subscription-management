import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarRange,
  FileText,
  Repeat,
  Receipt,
  CreditCard,
  Tag,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

const navigationItems = [
  { name: 'Overview', to: '/', icon: LayoutDashboard },
  { name: 'Customers', to: '/customers', icon: Users },
  { name: 'Products', to: '/products', icon: Package },
  { name: 'Plans', to: '/plans', icon: CalendarRange },
  { name: 'Quotations', to: '/quotations', icon: FileText },
  { name: 'Subscriptions', to: '/subscriptions', icon: Repeat },
  { name: 'Invoices', to: '/invoices', icon: Receipt },
  { name: 'Payments', to: '/payments', icon: CreditCard },
  { name: 'Discounts', to: '/discounts', icon: Tag, badge: 'Admin' },
  { name: 'Settings', to: '/settings', icon: Settings, badge: 'Admin' },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-stone bg-surface transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-stone px-5">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-charcoal text-base">Brightloop</span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted">
                Verdant Ledger
              </span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            type="button"
            className="rounded-md p-1.5 text-muted hover:bg-paper hover:text-charcoal lg:hidden"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Management
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-forest text-white shadow-xs'
                      : 'text-charcoal hover:bg-paper hover:text-charcoal'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-stone/40 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-stone p-4 text-xs text-muted">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px]">v0.1.0 (M0)</span>
            <span className="inline-flex items-center rounded-full bg-forest-subtle px-2 py-0.5 text-[10px] font-medium text-forest">
              Foundation
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
