import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/database';

// Reszta importów...


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const productId = params.id;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Brak ID produktu' },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching product from Neon database: ${productId}`);

    // 🎯 ZMIANA: Pobierz z bazy danych zamiast BaseLinker
    const product = await prisma.product.findUnique({
      where: { 
        id: productId,
        is_active: true 
      },
      include: {
        category: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produkt nie został znaleziony' },
        { status: 404 }
      );
    }

    // Konwertuj na format oczekiwany przez frontend
    const processedProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price_brutto: Number(product.price_brutto),
      quantity: product.quantity,
      images: Array.isArray(product.images) ? product.images as string[] : [],
      description: product.description || '',
      category_id: product.category_id || '',
      weight: Number(product.weight) || 0,
      tax_rate: Number(product.tax_rate) || 0,
      ean: product.ean || '',
      text_fields: (product.text_fields as Record<string, string>) || {}
    };

    console.log(`✅ Product loaded from Neon: ${product.name}`);

    return NextResponse.json({ 
      success: true,
      product: processedProduct,
      source: 'neon_database'
    });

  } catch (error) {
    console.error('❌ Neon Product API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd serwera' }, 
      { status: 500 }
    );
  }
}
