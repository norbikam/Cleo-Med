import { NextRequest, NextResponse } from 'next/server';

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
  products?: Record<string, BaseLinkerProductDetailed>;
  error_message?: string;
}

const toSafeString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return String(value);
};

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
    if (textFields[key]) {
      const name = toSafeString(textFields[key]).trim();
      if (name) return name;
    }
  }
  
  return fallbackName || '';
};

const extractDescription = (textFields: Record<string, string> | undefined): string => {
  if (!textFields) return '';
  
  const descKeys = ['description', 'description|pl', 'description|en', 'description|'];
  for (const key of descKeys) {
    if (textFields[key]) {
      const desc = toSafeString(textFields[key]).trim();
      if (desc) return desc;
    }
  }
  
  return '';
};

// ✅ POPRAWNA definicja funkcji - usuń nieprawidłową typizację params
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await params dla Next.js 15+
    const params = await context.params;
    const productId = params.id;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Brak ID produktu' },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching product details for ID: ${productId}`);

    const response = await fetch('https://api.baselinker.com/connector.php', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-BLToken': process.env.BASELINKER_API_TOKEN!
      },
      body: new URLSearchParams({
        method: 'getInventoryProductsData',
        parameters: JSON.stringify({
          inventory_id: 24235,
          products: [productId]
        })
      })
    });

    const data: BaseLinkerResponse = await response.json();
    
    if (data.status !== 'SUCCESS' || !data.products) {
      console.log(`❌ Product not found: ${data.error_message}`);
      return NextResponse.json(
        { success: false, error: 'Produkt nie został znaleziony' },
        { status: 404 }
      );
    }

    const productData = data.products[productId];
    if (!productData) {
      return NextResponse.json(
        { success: false, error: 'Produkt nie został znaleziony' },
        { status: 404 }
      );
    }

    // Bezpieczne przetwarzanie danych
    const name = extractName(productData.text_fields, productId);
    const description = extractDescription(productData.text_fields);
    const images = extractImages(productData.images);
    
    const priceValue = Object.values(productData.prices || {})[0] || 0;
    const stockValue = Object.values(productData.stock || {})[0] || 0;

    const processedProduct = {
      id: productId,
      name: name,
      sku: toSafeString(productData.sku) || productId,
      price_brutto: toSafeNumber(priceValue),
      quantity: toSafeNumber(stockValue),
      images: images,
      description: description,
      category_id: toSafeString(productData.category_id),
      weight: toSafeNumber(productData.weight),
      tax_rate: toSafeNumber(productData.tax_rate),
      ean: toSafeString(productData.ean),
      text_fields: productData.text_fields || {}
    };

    console.log(`✅ Product loaded: ${name}`);

    return NextResponse.json({ 
      success: true,
      product: processedProduct
    });

  } catch (error) {
    console.error('❌ Product API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd serwera' }, 
      { status: 500 }
    );
  }
}
