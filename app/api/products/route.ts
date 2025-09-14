import { NextRequest, NextResponse } from 'next/server';

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

    const data: any = await response.json();
    
    if (data.status === 'SUCCESS') {
      const products = data.products || {};
      const productList = [];
      
      for (const [pid, info] of Object.entries(products)) {
        const productInfo = info as any;
        const name = productInfo.name;
        if (!name) continue;
        
        const price = productInfo.prices?.['21155'] || 0;
        const stock = productInfo.stock?.['bl_41507'] || 0;
        
        // DEBUG: Sprawdź strukturę obrazków
        console.log(`Product ${pid} images:`, productInfo.images);
        
        // Różne sposoby pobierania obrazków z BaseLinker
        let images: string[] = [];
        
        if (productInfo.images) {
          if (Array.isArray(productInfo.images)) {
            // Jeśli to array
            images = productInfo.images;
          } else if (typeof productInfo.images === 'object') {
            // Jeśli to obiekt z kluczami
            images = Object.values(productInfo.images).filter(img => img) as string[];
          }
        }
        
        // Sprawdź też inne pola z obrazkami
        if (images.length === 0) {
          if (productInfo.image) images.push(productInfo.image);
          if (productInfo.main_image) images.push(productInfo.main_image);
          if (productInfo.photo) images.push(productInfo.photo);
        }
        
        console.log(`Final images for ${name}:`, images);
        
        productList.push({
          id: pid,
          name: name,
          sku: productInfo.sku || pid,
          price_brutto: parseFloat(price) || 0,
          quantity: parseInt(stock) || 0,
          images: images,
          description: productInfo.description || '',
          category_id: productInfo.category_id || '',
          // DEBUG: Dodaj raw data żeby sprawdzić
          _debug_images: productInfo.images
        });
      }
      
      return NextResponse.json({ 
        success: true,
        products: productList,
        count: productList.length
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
