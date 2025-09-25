import { NextRequest, NextResponse } from 'next/server';
import { syncService } from '../../../lib/sync-service';
import { dbHelpers } from '../../../lib/database';

export async function GET(request: NextRequest) {
  // Weryfikuj że to Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('⏰ Cron sync triggered');
    
    // Sprawdź czy sync jest potrzebny
    const needsSync = await dbHelpers.needsSync();
    if (!needsSync) {
      console.log('⏸️ Sync not needed, skipping');
      return NextResponse.json({ 
        success: true, 
        message: 'Sync not needed',
        skipped: true 
      });
    }

    const result = await syncService.fullSync();
    
    return NextResponse.json({
      success: result.success,
      duration: result.duration,
      stats: result.stats,
      error: result.error
    });

  } catch (error) {
    console.error('❌ Cron sync failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
