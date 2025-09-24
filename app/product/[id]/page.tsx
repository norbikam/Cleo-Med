// app/product/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ProductDetails {
  id: string;
  name: string;
  sku: string;
  price_brutto: number;
  quantity: number;
  images: string[];
  description: string;
  category_id: string;
  weight: number;
  tax_rate: number;
  ean: string;
  text_fields: Record<string, string>;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/product/${productId}`);
        const data = await response.json();

        if (data.success && data.product) {
          // Upewnij się, że wszystkie pola są stringami/liczbami
          const cleanProduct: ProductDetails = {
            id: String(data.product.id || ''),
            name: String(data.product.name || 'Brak nazwy'),
            sku: String(data.product.sku || ''),
            price_brutto: Number(data.product.price_brutto) || 0,
            quantity: Number(data.product.quantity) || 0,
            images: Array.isArray(data.product.images) ? data.product.images : [],
            description: String(data.product.description || ''),
            category_id: String(data.product.category_id || ''),
            weight: Number(data.product.weight) || 0,
            tax_rate: Number(data.product.tax_rate) || 0,
            ean: String(data.product.ean || ''),
            text_fields: data.product.text_fields || {}
          };
          
          setProduct(cleanProduct);
        } else {
          setError(data.error || 'Nie udało się załadować produktu');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Błąd połączenia z serwerem');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Funkcje pomocnicze - zawsze zwracają stringi
  const formatPrice = (price: number): string => {
    try {
      return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN'
      }).format(price || 0);
    } catch {
      return `${price || 0} PLN`;
    }
  };

  const getStockStatus = (quantity: number) => {
    const qty = Number(quantity) || 0;
    if (qty > 10) return { color: 'text-green-600', bg: 'bg-green-100', text: 'Dostępny' };
    if (qty > 0) return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Niski stan' };
    return { color: 'text-red-600', bg: 'bg-red-100', text: 'Niedostępny' };
  };

  const renderTextFieldValue = (value: string): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object object]';
      }
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Błąd ładowania produktu</h1>
          <p className="text-gray-600 mb-6">{String(error)}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.back()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Wróć do listy
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.quantity);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Wróć do listy
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Szczegóły produktu</h1>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 && product.images[selectedImageIndex] ? (
                  <img
                    src={String(product.images[selectedImageIndex])}
                    alt={String(product.name)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={String(image)}
                        alt={`${String(product.name)} - zdjęcie ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {String(product.name)}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>SKU: {String(product.sku)}</span>
                  {product.ean && <span>EAN: {String(product.ean)}</span>}
                </div>
              </div>

              {/* Price & Stock */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {formatPrice(product.price_brutto)}
                    </p>
                    <p className="text-sm text-gray-500">Cena brutto</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {String(product.quantity)} sztuk w magazynie
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Szczegóły produktu</h3>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  {product.weight > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Waga:</span>
                      <span className="text-gray-600">{String(product.weight)} kg</span>
                    </div>
                  )}
                  {product.category_id && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">ID Kategorii:</span>
                      <span className="text-gray-600">{String(product.category_id)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Opis produktu</h3>
                  <div 
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: String(product.description) }}
                  />
                </div>
              )}

              {/* Additional Text Fields */}
              {product.text_fields && Object.keys(product.text_fields).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dodatkowe informacje</h3>
                  <div className="space-y-3">
                    {Object.entries(product.text_fields).map(([key, value]) => {
                      const cleanValue = renderTextFieldValue(value);
                      if (!cleanValue || key.includes('name') || key.includes('description')) return null;
                      
                      return (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-700 capitalize">
                            {String(key).replace(/[|_]/g, ' ')}:
                          </span>
                          <span className="text-gray-600 text-right max-w-xs">
                            {cleanValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
