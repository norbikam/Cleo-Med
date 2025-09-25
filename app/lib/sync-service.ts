import { prisma } from './database';
import { Decimal } from '@prisma/client/runtime/library';
import type { PrismaClient, Prisma } from '@prisma/client';

interface DatabaseCategory {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: Date;
  updated_at: Date;
}

// Typ dla transakcji Prisma
type PrismaTransaction = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// Typy dla BaseLinker API
interface BaseLinkerCategory {
  category_id: number;
  name: string;
  parent_id?: number;
}

interface BaseLinkerProductDetailed {
  ean: string;
  sku: string;
  category_id: number;
  text_fields: Record<string, string>;
  prices: Record<string, number>;
  stock: Record<string, number>;
  images: Record<string, string>;
  tax_rate: number;
  weight: number;
}

// Typy dla API responses
interface ApiCallResponse {
  status: string;
  categories?: BaseLinkerCategory[];
  products?: Record<string, BaseLinkerProductDetailed>;
  error_message?: string;
}

// Typy dla statystyk synchronizacji
interface SyncStats {
  processed: number;
  updated: number;
  created: number;
}

interface CategorySyncResult {
  categoryName: string;
  processed: number;
  created: number;
  updated: number;
}

interface FullSyncResult {
  success: boolean;
  duration: number;
  stats: {
    categories: SyncStats;
    products: SyncStats;
  };
  error?: string;
}

export class SyncService {
  private readonly token: string;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    this.token = process.env.BASELINKER_API_TOKEN!;
    if (!this.token) {
      throw new Error('BASELINKER_API_TOKEN is required');
    }
  }

  // Utility functions with proper typing
  private toSafeString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return String(value);
  };

  private toSafeDecimal = (value: unknown): Decimal => {
    if (value === null || value === undefined) return new Decimal(0);
    if (typeof value === 'number' && !isNaN(value)) return new Decimal(value);
    if (typeof value === 'string') {
      try {
        const parsed = parseFloat(value.trim());
        return !isNaN(parsed) ? new Decimal(parsed) : new Decimal(0);
      } catch {
        return new Decimal(0);
      }
    }
    return new Decimal(0);
  };

  private toSafeNumber = (value: unknown): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.trim());
      return !isNaN(parsed) ? parsed : 0;
    }
    return 0;
  };

  private extractName = (textFields: Record<string, string> | undefined, fallback?: string): string => {
    if (!textFields) return fallback || '';
    
    const nameKeys = ['name', 'name|pl', 'name|en', 'name|'] as const;
    for (const key of nameKeys) {
      if (textFields[key]) {
        const name = this.toSafeString(textFields[key]).trim();
        if (name) return name;
      }
    }
    
    return fallback || '';
  };

  private extractDescription = (textFields: Record<string, string> | undefined): string => {
    if (!textFields) return '';
    
    const descKeys = ['description', 'description|pl', 'description|en', 'description|'] as const;
    for (const key of descKeys) {
      if (textFields[key]) {
        const desc = this.toSafeString(textFields[key]).trim();
        if (desc) return desc;
      }
    }
    
    return '';
  };

  private extractImages = (images: Record<string, string> | undefined): string[] => {
    if (!images || typeof images !== 'object') return [];
    return Object.values(images).filter((img: string) => img && img.length > 0);
  };

  // Retry logic for API calls with proper typing
  private async makeApiCall(
    url: string, 
    body: URLSearchParams, 
    context: string
  ): Promise<ApiCallResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 ${context} (attempt ${attempt}/${this.maxRetries})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-BLToken': this.token
          },
          body: body,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ApiCallResponse = await response.json();
        
        if (data.status !== 'SUCCESS') {
          throw new Error(`BaseLinker API error: ${data.error_message || 'Unknown error'}`);
        }

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ ${context} failed (attempt ${attempt}/${this.maxRetries}): ${lastError.message}`);
        
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    
    throw lastError || new Error('Unknown error during API call');
  }

  // Synchronizuj kategorie z właściwymi typami transakcji
  async syncCategories(): Promise<SyncStats> {
    console.log('📂 Syncing categories...');

    const data = await this.makeApiCall(
      'https://api.baselinker.com/connector.php',
      new URLSearchParams({
        method: 'getInventoryCategories',
        parameters: JSON.stringify({
          inventory_id: 24235
        })
      }),
      'Categories fetch'
    );

    if (!data.categories || !Array.isArray(data.categories)) {
      throw new Error('No categories data received');
    }

    let processed = 0;
    let updated = 0;
    let created = 0;

    // Use transaction with proper typing
    await prisma.$transaction(async (tx: PrismaTransaction) => {
      for (const category of data.categories!) {
        const categoryData = {
          id: category.category_id.toString(),
          name: category.name,
          parent_id: category.parent_id?.toString() || null
        };

        const existingCategory = await tx.category.findUnique({
          where: { id: categoryData.id }
        });

        if (existingCategory) {
          await tx.category.update({
            where: { id: categoryData.id },
            data: categoryData
          });
          updated++;
        } else {
          await tx.category.create({
            data: categoryData
          });
          created++;
        }
        processed++;
      }
    });

    console.log(`✅ Categories synced: ${processed} processed, ${created} created, ${updated} updated`);
    return { processed, updated, created };
  }

  // Synchronizuj produkty z jednej kategorii z typami transakcji
  private async syncCategoryProducts(category: BaseLinkerCategory): Promise<CategorySyncResult> {
    console.log(`🔄 Syncing products for category: ${category.name}`);

    // Pobierz listę produktów
    const productsListData = await this.makeApiCall(
      'https://api.baselinker.com/connector.php',
      new URLSearchParams({
        method: 'getInventoryProductsList',
        parameters: JSON.stringify({
          inventory_id: 24235,
          filter_category_id: category.category_id
        })
      }),
      `Product list for ${category.name}`
    );

    if (!productsListData.products || typeof productsListData.products !== 'object') {
      return { categoryName: category.name, processed: 0, created: 0, updated: 0 };
    }

    const productIds = Object.keys(productsListData.products);
    if (productIds.length === 0) {
      return { categoryName: category.name, processed: 0, created: 0, updated: 0 };
    }

    console.log(`   📦 Found ${productIds.length} products in ${category.name}`);

    // Pobierz szczegóły produktów w chunkach
    const chunkSize = 100;
    let processed = 0;
    let created = 0;
    let updated = 0;

    for (let i = 0; i < productIds.length; i += chunkSize) {
      const chunk = productIds.slice(i, i + chunkSize);
      
      console.log(`   🔍 Processing chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(productIds.length/chunkSize)} (${chunk.length} products)`);
      
      const detailsData = await this.makeApiCall(
        'https://api.baselinker.com/connector.php',
        new URLSearchParams({
          method: 'getInventoryProductsData',
          parameters: JSON.stringify({
            inventory_id: 24235,
            products: chunk
          })
        }),
        `Product details chunk for ${category.name}`
      );
      
      if (detailsData.products && typeof detailsData.products === 'object') {
        // Use transaction for chunk with proper typing
        await prisma.$transaction(async (tx: PrismaTransaction) => {
          const productEntries = Object.entries(detailsData.products!) as [string, BaseLinkerProductDetailed][];
          
          for (const [productId, product] of productEntries) {
            const detailedProduct: BaseLinkerProductDetailed = product;
            
            const name = this.extractName(detailedProduct.text_fields, productId);
            if (!name) continue;

            const description = this.extractDescription(detailedProduct.text_fields);
            const images = this.extractImages(detailedProduct.images);
            
            const priceValue = Object.values(detailedProduct.prices || {})[0] || 0;
            const stockValue = Object.values(detailedProduct.stock || {})[0] || 0;
            const taxRate = this.toSafeDecimal(detailedProduct.tax_rate);

            const productData: any = {
                baselinker_id: productId,
                name: name,
                sku: this.toSafeString(detailedProduct.sku) || productId,
                ean: this.toSafeString(detailedProduct.ean) || null,
                price_brutto: this.toSafeDecimal(priceValue),
                price_netto: taxRate.greaterThan(0) 
                    ? this.toSafeDecimal(priceValue).dividedBy(taxRate.dividedBy(100).plus(1))
                    : this.toSafeDecimal(priceValue),
                quantity: this.toSafeNumber(stockValue),
                weight: this.toSafeDecimal(detailedProduct.weight),
                tax_rate: taxRate,
                description: description || null,
                category_id: category.category_id.toString(),
                category_name: category.name,
                last_sync: new Date(),
                is_active: true
                };

                // Dodaj images tylko jeśli są
                if (images.length > 0) {
                productData.images = images;
                }

                // Dodaj text_fields tylko jeśli są
                if (Object.keys(detailedProduct.text_fields || {}).length > 0) {
                productData.text_fields = detailedProduct.text_fields;
            }


            // Check if product exists
            const existingProduct = await tx.product.findUnique({
              where: { baselinker_id: productId }
            });

            if (existingProduct) {
              await tx.product.update({
                where: { baselinker_id: productId },
                data: productData
              });
              updated++;
            } else {
              await tx.product.create({
                data: {
                  id: productId,
                  ...productData
                }
              });
              created++;
            }
            processed++;
          }
        });
      }
      
      // Pauza między chunkami
      if (i + chunkSize < productIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`   ✅ ${category.name} completed: ${processed} processed, ${created} created, ${updated} updated`);
    return { categoryName: category.name, processed, created, updated };
  }

  // Pełna synchronizacja z właściwymi typami
  async fullSync(): Promise<FullSyncResult> {
    const startTime = Date.now();
    
    // Utwórz log synchronizacji
    const syncLog = await prisma.syncLog.create({
      data: {
        sync_type: 'full',
        status: 'started',
        started_at: new Date()
      }
    });

    try {
      console.log('🚀 Starting full synchronization...');

      // 1. Synchronizuj kategorie
      const categoryStats = await this.syncCategories();

      // 2. Pobierz wszystkie kategorie z bazy
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });

      console.log(`📂 Found ${categories.length} categories to sync`);

      // 3. Synchronizuj produkty
      const concurrencyLimit = 2;
      const productStats: SyncStats = { processed: 0, created: 0, updated: 0 };

      for (let i = 0; i < categories.length; i += concurrencyLimit) {
        const categoryBatch = categories.slice(i, i + concurrencyLimit);
        
        console.log(`🔄 Processing category batch ${Math.floor(i/concurrencyLimit) + 1}/${Math.ceil(categories.length/concurrencyLimit)}`);
        
        const batchPromises: Promise<CategorySyncResult>[] = categoryBatch.map((category: DatabaseCategory) => 
          this.syncCategoryProducts({
            category_id: parseInt(category.id),
            name: category.name,
            parent_id: category.parent_id ? parseInt(category.parent_id) : undefined
          })
        );

        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(result => {
          productStats.processed += result.processed;
          productStats.created += result.created;
          productStats.updated += result.updated;
        });

        console.log(`✅ Category batch completed. Total so far: ${productStats.processed} products`);
        
        // Pause between batches
        if (i + concurrencyLimit < categories.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // 4. Oznacz nieaktywne produkty
      const cutoffTime = new Date(startTime);
      const deactivatedResult = await prisma.product.updateMany({
        where: {
          last_sync: { lt: cutoffTime },
          is_active: true
        },
        data: {
          is_active: false
        }
      });

      console.log(`🔄 Deactivated ${deactivatedResult.count} products that weren't in this sync`);

      const duration = Math.round((Date.now() - startTime) / 1000);

      // Zaktualizuj log
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'success',
          completed_at: new Date(),
          products_processed: productStats.processed,
          products_updated: productStats.updated,
          products_created: productStats.created,
          categories_processed: categoryStats.processed,
          duration_seconds: duration
        }
      });

      console.log(`✅ Full sync completed in ${duration}s`);
      console.log(`📊 Categories: ${categoryStats.processed} processed`);
      console.log(`📦 Products: ${productStats.processed} processed, ${productStats.created} created, ${productStats.updated} updated`);

      return {
        success: true,
        duration,
        stats: {
          categories: categoryStats,
          products: productStats
        }
      };

    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'failed',
          completed_at: new Date(),
          duration_seconds: duration,
          error_message: errorMessage
        }
      });

      console.error('❌ Full sync failed:', errorMessage);

      return {
        success: false,
        duration,
        stats: {
          categories: { processed: 0, updated: 0, created: 0 },
          products: { processed: 0, updated: 0, created: 0 }
        },
        error: errorMessage
      };
    }
  }

  // Dodatkowe metody z właściwymi typami
  async getLastSyncInfo(): Promise<{
    lastSync: Date | null;
    status: string | null;
    duration: number | null;
    productsProcessed: number | null;
  }> {
    const lastSync = await prisma.syncLog.findFirst({
      orderBy: { started_at: 'desc' }
    });

    return {
      lastSync: lastSync?.completed_at || null,
      status: lastSync?.status || null,
      duration: lastSync?.duration_seconds || null,
      productsProcessed: lastSync?.products_processed || null
    };
  }

  async cleanupInactiveProducts(daysInactive: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000);
    
    const result = await prisma.product.deleteMany({
      where: {
        is_active: false,
        updated_at: { lt: cutoffDate }
      }
    });

    console.log(`🗑️ Cleaned up ${result.count} inactive products older than ${daysInactive} days`);
    return result.count;
  }

  async getStatistics(): Promise<{
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    totalCategories: number;
    averagePrice: number;
    outOfStockCount: number;
  }> {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalCategories,
      avgPriceResult,
      outOfStockCount
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { is_active: true } }),
      prisma.product.count({ where: { is_active: false } }),
      prisma.category.count(),
      prisma.product.aggregate({
        where: { is_active: true },
        _avg: { price_brutto: true }
      }),
      prisma.product.count({ 
        where: { 
          is_active: true, 
          quantity: 0 
        } 
      })
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalCategories,
      averagePrice: Number(avgPriceResult._avg.price_brutto) || 0,
      outOfStockCount
    };
  }
}

// Singleton instance
export const syncService = new SyncService();
