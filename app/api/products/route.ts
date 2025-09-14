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
      const productList = [];
      
      for (const [pid, info] of Object.entries(products)) {
        const name = info.name;
        if (!name) continue;
        
        const price = info.prices?.['21155'] || 0;
        const stock = info.stock?.['bl_41507'] || 0;
        
        console.log(`Product ${pid} images:`, info.images);
        
        let images: string[] = [];
        
        if (info.images) {
          if (Array.isArray(info.images)) {
            images = info.images;
          } else if (typeof info.images === 'object') {
            images = Object.values(info.images).filter((img): img is string => 
              typeof img === 'string' && img.length > 0
            );
          }
        }
        
        if (images.length === 0) {
          if (info.image) images.push(info.image);
          if (info.main_image) images.push(info.main_image);
          if (info.photo) images.push(info.photo);
        }
        
        console.log(`Final images for ${name}:`, images);
        
        productList.push({
          id: pid,
          name: name,
          sku: info.sku || pid,
          price_brutto: typeof price === 'string' ? parseFloat(price) : Number(price),
          quantity: typeof stock === 'string' ? parseInt(stock) : Number(stock),
          images: images,
          description: info.description || '',
          category_id: info.category_id || ''
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
