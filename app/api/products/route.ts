import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Weryfikacja hasła
    if (password !== 'auto-load' && password !== process.env.ADMIN_PASSWORD) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowe hasło' }, 
        { status: 401 }
      );
    }

    console.log('🚀 Loading products directly from BaseLinker (Bypass DB)...');
    const startTime = Date.now();
    const token = process.env.BASELINKER_API_TOKEN;
    const inventoryId = 24235; // ID Twojego katalogu w BaseLinkerze

    if (!token) {
      throw new Error('Brak tokenu BaseLinker w zmiennych środowiskowych');
    }

    // 1. Pobierz kategorie (żeby zmapować id na nazwy)
    const catRes = await fetch('https://api.baselinker.com/connector.php', {
      method: 'POST',
      headers: { 'X-BLToken': token, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 
        method: 'getInventoryCategories', 
        parameters: JSON.stringify({ inventory_id: inventoryId }) 
      }),
      cache: 'no-store' // zawsze pobieraj świeże
    });
    const catData = await catRes.json();
    const catMap: Record<number, string> = {};
    if (catData.categories) {
      catData.categories.forEach((c: any) => {
        catMap[c.category_id] = c.name;
      });
    }

    // 2. Pobierz listę wszystkich ID produktów
    const listRes = await fetch('https://api.baselinker.com/connector.php', {
      method: 'POST',
      headers: { 'X-BLToken': token, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 
        method: 'getInventoryProductsList', 
        parameters: JSON.stringify({ inventory_id: inventoryId }) 
      }),
      cache: 'no-store'
    });
    const listData = await listRes.json();
    
    if (!listData.products) {
       return NextResponse.json({ success: true, products: [], count: 0, source: 'baselinker_direct' });
    }

    const productIds = Object.keys(listData.products);
    
    // 3. Pobierz szczegóły produktów w paczkach po 100 (równolegle dla szybkości)
    const chunks:string[][] = [];
    for (let i = 0; i < productIds.length; i += 100) {
      chunks.push(productIds.slice(i, i + 100));
    }

    const chunkPromises = chunks.map(chunk => 
      fetch('https://api.baselinker.com/connector.php', {
        method: 'POST',
        headers: { 'X-BLToken': token, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 
          method: 'getInventoryProductsData', 
          parameters: JSON.stringify({ inventory_id: inventoryId, products: chunk }) 
        }),
        cache: 'no-store'
      }).then(res => res.json())
    );

    const chunksResults = await Promise.all(chunkPromises);
    
    // 4. Połącz i sformatuj produkty dla frontendu
    const allProducts: any[] = [];
    chunksResults.forEach(result => {
      if (result.products) {
        Object.entries(result.products).forEach(([id, p]: [string, any]) => {
          
          const price = Object.values(p.prices || {})[0] || 0;
          const stock = Object.values(p.stock || {})[0] || 0;
          const images = Object.values(p.images || {}).filter(img => typeof img === 'string' && img.length > 0) as string[];
          
          const name = p.text_fields?.name || p.text_fields?.['name|pl'] || id;
          const description = p.text_fields?.description || p.text_fields?.['description|pl'] || '';

          allProducts.push({
            id: id,
            name: name,
            sku: p.sku || id,
            price_brutto: Number(price),
            quantity: Number(stock),
            images: images,
            description: description,
            category_id: p.category_id?.toString() || '',
            category_name: catMap[p.category_id] || 'Bez kategorii'
          });
        });
      }
    });

    // 5. Posortuj alfabetycznie (tak jak robiła to baza danych)
    allProducts.sort((a, b) => a.name.localeCompare(b.name));

    const endTime = Date.now();
    const loadTime = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ Zaciągnięto produkty z BaseLinkera w ${loadTime}s`);

    return NextResponse.json({ 
      success: true,
      products: allProducts,
      count: allProducts.length,
      source: 'baselinker_direct',
      load_time_seconds: parseFloat(loadTime)
    });

  } catch (error) {
    console.error('❌ Direct BaseLinker API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd połączenia z BaseLinker: ' + (error instanceof Error ? error.message : 'Nieznany błąd') }, 
      { status: 500 }
    );
  }
}