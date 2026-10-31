import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/shared/Sidebar.jsx';
import { Topbar } from '../components/shared/Topbar.jsx';
import { checkHealth } from '../services/api.js';

export const AppShell = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  const handleRefreshHealth = () => {
    setIsHealthLoading(true);
    setHealthError(null);
    checkHealth()
      .then((response) => {
        setHealthData(response.data);
      })
      .catch((err) => {
        console.error('[Health Check Error]:', err);
        setHealthError(err);
        setHealthData({ status: 'degraded', database: 'disconnected' });
      })
      .finally(() => {
        setIsHealthLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;

    checkHealth()
      .then((response) => {
        if (isMounted) {
          setHealthData(response.data);
          setIsHealthLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('[Health Check Error]:', err);
          setHealthError(err);
          setHealthData({ status: 'degraded', database: 'disconnected' });
          setIsHealthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-paper text-charcoal">
      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          healthData={healthData}
          isHealthLoading={isHealthLoading}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {typeof children === 'function'
              ? children({
                  healthData,
                  isHealthLoading,
                  onRefreshHealth: handleRefreshHealth,
                  healthError,
                })
              : React.isValidElement(children)
              ? React.cloneElement(children, {
                  healthData,
                  isHealthLoading,
                  onRefreshHealth: handleRefreshHealth,
                  healthError,
                })
              : children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
