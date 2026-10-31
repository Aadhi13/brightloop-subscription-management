import { getDBConnectionStatus } from '../../config/db.js';
import { env } from '../../config/env.js';

export const getHealth = (req, res) => {
  const dbStatus = getDBConnectionStatus();
  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'Brightloop Subscription Management API',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
    },
    message: isHealthy ? 'Service is healthy' : 'Database connection not ready',
  });
};
