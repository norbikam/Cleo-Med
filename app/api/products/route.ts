import { NextRequest, NextResponse } from 'next/server';

interface BaseLinkerProductInfo {
  name?: string;
  sku?: string;
  description?: string;
  category_id?: string;
  prices?: Record<string, string | number>;
  stock?: Record<string, string | number>;
  images?: Record<string, string> | string[];
  image?: string;
  main_image?: string;
  photo?: string;
}

interface BaseLinkerResponse {
  status: string;
  products?: Record<string, BaseLinkerProductInfo>;
  error_message?: string;
}

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

    // KROK 1: Pobierz produkty
    const response = await fetch('https://api.baselinker.com/connector.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: process.env.BASELINKER_API_TOKEN!,
        method: 'getInventoryProductsList',
        parameters: JSON.stringify({
          inventory_id: "24235"
        })
      })
    });

    const data: BaseLinkerResponse = await response.json();
    
    if (data.status === 'SUCCESS') {
      const products = data.products || {};
      const productIds = Object.keys(products);
      
      console.log('Products fetched:', productIds.length);
      
      // KROK 2: Spróbuj pobrać obrazki dla produktów
      let imagesData: Record<string, BaseLinkerProductInfo> = {};
      try {
        const imagesResponse = await fetch('https://api.baselinker.com/connector.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            token: process.env.BASELINKER_API_TOKEN!,
            method: 'getInventoryProductsData',
            parameters: JSON.stringify({
              inventory_id: "24235",
              products: productIds
            })
          })
        });
        
        const imagesResult: BaseLinkerResponse = await imagesResponse.json();
        console.log('Images API result:', imagesResult.status);
        
        if (imagesResult.status === 'SUCCESS') {
          imagesData = imagesResult.products || {};
        }
      } catch (imageError) {
        console.log('Images fetch failed, continuing without images:', imageError);
      }
      
      const productList = [];
      
      for (const [pid, info] of Object.entries(products)) {
        const name = info.name;
        if (!name) continue;
        
        const price = info.prices?.['21155'] || 0;
        const stock = info.stock?.['bl_41507'] || 0;
        
        // Sprawdź czy mamy obrazki z drugiego API
        let images: string[] = [];
        const productWithImages = imagesData[pid];
        if (productWithImages?.images) {
          if (Array.isArray(productWithImages.images)) {
            images = productWithImages.images.filter((img: string) => img && img.length > 0);
          } else if (typeof productWithImages.images === 'object') {
            images = Object.values(productWithImages.images).filter((img): img is string => 
              typeof img === 'string' && img.length > 0
            );
          }
        }
        
        // Jeśli dalej brak obrazków, sprawdź inne pola
        if (images.length === 0 && productWithImages) {
          const imageFields = ['image', 'main_image', 'photo', 'picture'];
          for (const field of imageFields) {
            const imageValue = (productWithImages as Record<string, unknown>)[field];
            if (imageValue && typeof imageValue === 'string') {
              images.push(imageValue);
            }
          }
        }
        
        console.log(`Product ${name}: ${images.length} images found`);
        
        productList.push({
          id: pid,
          name: name,
          sku: info.sku || pid,
          price_brutto: typeof price === 'string' ? parseFloat(price) : Number(price),
          quantity: typeof stock === 'string' ? parseInt(stock) : Number(stock),
          images: images,
          description: productWithImages?.description || info.description || '',
          category_id: info.category_id || ''
        });
      }
      
      return NextResponse.json({ 
        success: true,
        products: productList,
        count: productList.length,
        images_fetched: Object.keys(imagesData).length
      });
    } else {
      return NextResponse.json(
        { success: false, error: `BaseLinker: ${data.error_message || 'Błąd API'}` }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd serwera' }, 
      { status: 500 }
    );
  }
}
