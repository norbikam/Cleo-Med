import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper functions
export const dbHelpers = {
  // Sprawdź czy baza wymaga synchronizacji
  async needsSync(): Promise<boolean> {
    try {
      const lastSync = await prisma.syncLog.findFirst({
        where: { status: 'success' },
        orderBy: { completed_at: 'desc' }
      });

      if (!lastSync || !lastSync.completed_at) return true;

      const syncIntervalMinutes = parseInt(process.env.SYNC_INTERVAL_MINUTES || '30');
      const syncThreshold = new Date(Date.now() - syncIntervalMinutes * 60 * 1000);
      
      return lastSync.completed_at < syncThreshold;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return true; // W przypadku błędu, załóż że sync jest potrzebny
    }
  },

  // Pobierz statystyki bazy
  async getStats() {
    try {
      const [
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalCategories,
        lastSync,
        recentSyncs
      ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { is_active: true } }),
        prisma.product.count({ where: { quantity: 0, is_active: true } }),
        prisma.category.count(),
        prisma.syncLog.findFirst({
          where: { status: 'success' },
          orderBy: { completed_at: 'desc' }
        }),
        prisma.syncLog.findMany({
          orderBy: { started_at: 'desc' },
          take: 5
        })
      ]);

      return {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalCategories,
        lastSyncAt: lastSync?.completed_at,
        needsSync: await this.needsSync(),
        recentSyncs
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        totalProducts: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        totalCategories: 0,
        lastSyncAt: null,
        needsSync: true,
        recentSyncs: []
      };
    }
  },

  // Wyczyść stare logi synchronizacji
  async cleanupOldLogs(keepDays: number = 30) {
    try {
      const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
      
      return await prisma.syncLog.deleteMany({
        where: {
          completed_at: {
            lt: cutoffDate
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      return { count: 0 };
    }
  },

  // Health check bazy danych
  async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { healthy: true, timestamp: new Date() };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { healthy: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
