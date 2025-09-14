import { NextRequest, NextResponse } from 'next/server';

interface BaseLinkerCategory {
  category_id: number;
  name: string;
  parent_id?: number;
}

interface BaseLinkerProductBasic {
  id: number;
  ean: string;
  sku: string;
  name: string;
  prices: Record<string, number>;
  stock: Record<string, number>;
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

interface BaseLinkerResponse {
  status: string;
  categories?: BaseLinkerCategory[];
  products?: Record<string, BaseLinkerProductBasic | BaseLinkerProductDetailed>;
  error_message?: string;
}

const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.trim());
    return !isNaN(parsed) ? parsed : 0;
  }
  return 0;
};

const extractImages = (images: Record<string, string> | undefined): string[] => {
  if (!images || typeof images !== 'object') return [];
  return Object.values(images).filter((img: string) => img && img.length > 0);
};

const extractName = (textFields: Record<string, string> | undefined, fallbackName?: string): string => {
  if (!textFields) return fallbackName || '';
  
  const nameKeys = ['name', 'name|pl', 'name|en', 'name|'];
  for (const key of nameKeys) {
    if (textFields[key] && textFields[key].trim()) {
      return textFields[key].trim();
    }
  }
  
  return fallbackName || '';
};

const extractDescription = (textFields: Record<string, string> | undefined): string => {
  if (!textFields) return '';
  
  const descKeys = ['description', 'description|pl', 'description|en', 'description|'];
  for (const key of descKeys) {
    if (textFields[key] && textFields[key].trim()) {
      return textFields[key].trim();
    }
  }
  
  return '';
};

// 🚀 Funkcja do równoległego przetwarzania kategorii
const processCategoryParallel = async (
  category: BaseLinkerCategory,
  token: string,
  categoryIndex: number,
  totalCategories: number
): Promise<{
  categoryName: string;
  products: Array<{
    id: string;
    name: string;
    sku: string;
    price_brutto: number;
    quantity: number;
    images: string[];
    description: string;
    category_id: string;
    category_name: string;
  }>;
  count: number;
}> => {
  
  console.log(`🔄 [${categoryIndex + 1}/${totalCategories}] Processing: "${category.name}"`);
  
  try {
    // KROK 1: Pobierz listę produktów dla kategorii
    const productsListResponse = await fetch('https://api.baselinker.com/connector.php', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-BLToken': token
      },
      body: new URLSearchParams({
        method: 'getInventoryProductsList',
        parameters: JSON.stringify({
          inventory_id: 24235,
          filter_category_id: category.category_id
        })
      })
    });

    const productsListData: BaseLinkerResponse = await productsListResponse.json();
    
    if (productsListData.status !== 'SUCCESS' || !productsListData.products) {
      console.log(`   ❌ [${category.name}] No products: ${productsListData.error_message}`);
      return { categoryName: category.name, products: [], count: 0 };
    }

    const productIds = Object.keys(productsListData.products);
    if (productIds.length === 0) {
      console.log(`   ⚠️ [${category.name}] Empty category`);
      return { categoryName: category.name, products: [], count: 0 };
    }

    console.log(`   📦 [${category.name}] Found ${productIds.length} products`);

    // KROK 2: Pobierz szczegóły wszystkich produktów na raz (lub w większych chunkach)
    const chunkSize = 200; // Zwiększony chunk size
    const allCategoryProducts: any[] = [];
    
    // 🚀 Równoległe przetwarzanie chunków
    const chunkPromises: Promise<void>[] = [];
    
    for (let i = 0; i < productIds.length; i += chunkSize) {
      const chunk = productIds.slice(i, i + chunkSize);
      
      const chunkPromise = (async () => {
        try {
          const detailsResponse = await fetch('https://api.baselinker.com/connector.php', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-BLToken': token
            },
            body: new URLSearchParams({
              method: 'getInventoryProductsData',
              parameters: JSON.stringify({
                inventory_id: 24235,
                products: chunk
              })
            })
          });
          
          const detailsData: BaseLinkerResponse = await detailsResponse.json();
          
          if (detailsData.status === 'SUCCESS' && detailsData.products) {
            // Przetwórz produkty z tego chunka
            for (const [productId, product] of Object.entries(detailsData.products)) {
              const detailedProduct = product as BaseLinkerProductDetailed;
              
              const name = extractName(detailedProduct.text_fields);
              if (!name) continue;

              const description = extractDescription(detailedProduct.text_fields);
              const images = extractImages(detailedProduct.images);
              
              const priceValue = Object.values(detailedProduct.prices || {})[0] || 0;
              const stockValue = Object.values(detailedProduct.stock || {})[0] || 0;
              
              allCategoryProducts.push({
                id: productId,
                name: name,
                sku: detailedProduct.sku || productId,
                price_brutto: toSafeNumber(priceValue),
                quantity: toSafeNumber(stockValue),
                images: images,
                description: description,
                category_id: category.category_id.toString(),
                category_name: category.name
              });
            }
          }
        } catch (chunkError) {
          console.log(`   ❌ [${category.name}] Chunk error: ${chunkError}`);
        }
      })();
      
      chunkPromises.push(chunkPromise);
    }
    
    // Czekaj na wszystkie chunki równolegle
    await Promise.all(chunkPromises);
    
    console.log(`   ✅ [${category.name}] Completed: ${allCategoryProducts.length} products`);
    
    return {
      categoryName: category.name,
      products: allCategoryProducts,
      count: allCategoryProducts.length
    };
    
  } catch (error) {
    console.log(`   ❌ [${category.name}] Error: ${error}`);
    return { categoryName: category.name, products: [], count: 0 };
  }
};

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (password !== process.env.ADMIN_PASSWORD) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowe hasło' }, 
        { status: 401 }
      );
    }

    console.log('\n🚀 Starting BaseLinker API - TURBO SPEED VERSION...');
    const startTime = Date.now();

    // KROK 1: Pobierz wszystkie kategorie
    console.log('\n📂 === LOADING CATEGORIES ===');
    let categories: BaseLinkerCategory[] = [];

    try {
      const categoriesResponse = await fetch('https://api.baselinker.com/connector.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-BLToken': process.env.BASELINKER_API_TOKEN!
        },
        body: new URLSearchParams({
          method: 'getInventoryCategories',
          parameters: JSON.stringify({
            inventory_id: 24235
          })
        })
      });
      
      const categoriesData: BaseLinkerResponse = await categoriesResponse.json();
      
      if (categoriesData.status === 'SUCCESS' && categoriesData.categories) {
        categories = categoriesData.categories;
        console.log('✅ Categories loaded:', categories.length);
      }
    } catch (error) {
      console.log('❌ Categories loading error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to load categories: ' + (error instanceof Error ? error.message : 'Unknown error')
      }, { status: 500 });
    }

    // KROK 2: 🚀 RÓWNOLEGŁE PRZETWARZANIE WSZYSTKICH KATEGORII
    console.log('\n📦 === PARALLEL PROCESSING ALL CATEGORIES ===');
    console.log(`🚀 Starting parallel processing of ${categories.length} categories...`);
    
    // Przetwarzaj kategorie równolegle (w grupach po 5-10 żeby nie przeciążyć API)
    const concurrencyLimit = 8; // Liczba równoczesnych requestów
    const allProducts: any[] = [];
    const categoryStats: Record<string, number> = {};
    
    // Podziel kategorie na grupy
    for (let i = 0; i < categories.length; i += concurrencyLimit) {
      const categoryBatch = categories.slice(i, i + concurrencyLimit);
      
      console.log(`\n🔄 Processing batch ${Math.floor(i/concurrencyLimit) + 1}/${Math.ceil(categories.length/concurrencyLimit)} (${categoryBatch.length} categories)`);
      
      // Przetwórz tę grupę równolegle
      const batchPromises = categoryBatch.map((category, index) => 
        processCategoryParallel(
          category, 
          process.env.BASELINKER_API_TOKEN!, 
          i + index, 
          categories.length
        )
      );
      
      try {
        const batchResults = await Promise.all(batchPromises);
        
        // Zbierz wyniki z tej grupy
        batchResults.forEach(result => {
          allProducts.push(...result.products);
          categoryStats[result.categoryName] = result.count;
        });
        
        const batchProductsCount = batchResults.reduce((sum, result) => sum + result.count, 0);
        console.log(`   ✅ Batch completed: ${batchProductsCount} products added`);
        
        // Krótkie opóźnienie między grupami żeby nie przeciążyć API
        if (i + concurrencyLimit < categories.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (batchError) {
        console.log(`   ❌ Batch error: ${batchError}`);
      }
    }

    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n📊 === FINAL TURBO STATISTICS ===');
    console.log(`⚡ Total processing time: ${totalTime} seconds`);
    console.log(`✅ Categories processed: ${categories.length}`);
    console.log(`📦 Total products loaded: ${allProducts.length}`);
    
    console.log('\n📂 Top categories by product count:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([categoryName, count]) => {
        if (count > 0) {
          console.log(`   "${categoryName}": ${count} products`);
        }
      });

    const categoriesWithProducts = Object.values(categoryStats).filter(count => count > 0).length;
    const avgProductsPerCategory = allProducts.length / categoriesWithProducts;

    console.log(`\n⚡ Performance: ${(allProducts.length / parseFloat(totalTime)).toFixed(0)} products/second`);

    return NextResponse.json({ 
      success: true,
      products: allProducts,
      count: allProducts.length,
      source: 'turbo_parallel_processing',
      categories_loaded: categories.length,
      categories_with_products: categoriesWithProducts,
      processing_time_seconds: parseFloat(totalTime),
      performance_products_per_second: Math.round(allProducts.length / parseFloat(totalTime)),
      debug: {
        category_stats: categoryStats,
        total_categories: categories.length,
        avg_products_per_category: Math.round(avgProductsPerCategory),
        concurrent_requests: concurrencyLimit
      }
    });

  } catch (error) {
    console.error('❌ Critical API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd serwera: ' + (error instanceof Error ? error.message : 'Nieznany błąd') }, 
      { status: 500 }
    );
  }
}
