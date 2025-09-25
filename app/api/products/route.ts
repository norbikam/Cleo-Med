import { NextRequest, NextResponse } from 'next/server';
import { prisma, dbHelpers } from '../../lib/database';
import { syncService } from '../../lib/sync-service';


export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Weryfikacja hasła (except auto-load)
    if (password !== 'auto-load' && password !== process.env.ADMIN_PASSWORD) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowe hasło' }, 
        { status: 401 }
      );
    }

    console.log('🚀 Loading products from Neon database...');
    const startTime = Date.now();

    // Sprawdź czy baza wymaga synchronizacji
    const needsSync = await dbHelpers.needsSync();
    const stats = await dbHelpers.getStats();
    
    console.log('📊 Database stats:', stats);

    // Jeśli baza jest pusta, wymuś pierwszą synchronizację
    if (stats.totalProducts === 0) {
      console.log('🔄 First sync - database is empty, syncing from BaseLinker...');
      
      const syncResult = await syncService.fullSync();
      if (!syncResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Nie udało się zsynchronizować bazy danych: ' + syncResult.error
        }, { status: 500 });
      }
    } else if (needsSync) {
      // Synchronizacja w tle - nie blokuj użytkownika
      console.log('⏰ Database needs sync, starting background sync...');
      syncService.fullSync().catch(error => {
        console.error('❌ Background sync failed:', error);
      });
    }

    // 🎯 KLUCZOWA ZMIANA: Pobierz produkty z BAZY DANYCH
    const products = await prisma.product.findMany({
      where: {
        is_active: true
      },
      include: {
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    

    // Konwertuj na format oczekiwany przez frontend
    const formattedProducts = products.map((product: any) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    price_brutto: Number(product.price_brutto),
    quantity: product.quantity,
    images: Array.isArray(product.images) ? (product.images as string[]) : [],
    description: product.description || '',
    category_id: product.category_id || '',
    category_name: product.category_name || product.category?.name || 'Bez kategorii'
    }));

    const endTime = Date.now();
    const loadTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ Products loaded from Neon database in ${loadTime}s`);

    return NextResponse.json({ 
      success: true,
      products: formattedProducts,
      count: formattedProducts.length,
      source: 'neon_database', // 🎯 Zmienione ze 'database' na 'neon_database'
      database_stats: stats,
      needs_sync: needsSync,
      load_time_seconds: parseFloat(loadTime),
      debug: {
        total_in_db: stats.totalProducts,
        active_products: stats.activeProducts,
        last_sync: stats.lastSyncAt,
        sync_needed: needsSync
      }
    });

  } catch (error) {
    console.error('❌ Neon Database API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd serwera: ' + (error instanceof Error ? error.message : 'Nieznany błąd') }, 
      { status: 500 }
    );
  }
}
