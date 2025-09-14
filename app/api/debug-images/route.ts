import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Nieprawidłowe hasło' }, { status: 401 });
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

    const data = await response.json();
    
    if (data.status === 'SUCCESS') {
      const products = data.products || {};
      const debugInfo = [];
      
      // Weź pierwsze 3 produkty do debugowania
      const productEntries = Object.entries(products).slice(0, 3);
      
      for (const [pid, info] of productEntries) {
        debugInfo.push({
          id: pid,
          name: (info as any).name,
          raw_images: (info as any).images,
          raw_image: (info as any).image,
          raw_main_image: (info as any).main_image,
          raw_photo: (info as any).photo,
          all_keys: Object.keys(info as any)
        });
      }
      
      return NextResponse.json({
        success: true,
        debug: debugInfo,
        sample_product: productEntries[0] ? productEntries[0][1] : null
      });
    } else {
      return NextResponse.json({ error: data.error_message }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
