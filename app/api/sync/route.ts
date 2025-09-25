import { NextRequest, NextResponse } from 'next/server';
import { syncService } from '../../lib/sync-service';
import { dbHelpers } from '../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { password, force = false } = await request.json();
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowe hasło' }, 
        { status: 401 }
      );
    }

    console.log('🔄 Manual sync triggered');
    
    // Sprawdź czy synchronizacja jest potrzebna
    if (!force && !(await dbHelpers.needsSync())) {
      const stats = await dbHelpers.getStats();
      return NextResponse.json({
        success: true,
        message: 'Synchronizacja nie jest potrzebna',
        last_sync: stats.lastSyncAt,
        skipped: true
      });
    }

    const result = await syncService.fullSync();

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Synchronizacja zakończona pomyślnie' : 'Synchronizacja nie powiodła się',
      duration: result.duration,
      stats: result.stats,
      error: result.error
    });

  } catch (error) {
    console.error('❌ Sync API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
