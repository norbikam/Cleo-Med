'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  sku: string;
  price_brutto: number;
  quantity: number;
  images: string[];
  description?: string;
  category_id?: string;
  _debug_images?: any; // Debug
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        console.log('Otrzymane produkty:', data.products); // Debug
        setProducts(data.products);
        setIsLoggedIn(true);
      } else {
        setError(data.error || 'Wystąpił błąd');
      }
    } catch (err) {
      console.error('Błąd fetch:', err);
      setError('Błąd połączenia z serwerem');
    }
    setLoading(false);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setProducts([]);
    setPassword('');
    setError('');
  };

  // Funkcja do sprawdzenia czy URL obrazka jest poprawny
  const getValidImageUrl = (images: string[]): string | null => {
    if (!images || images.length === 0) return null;
    
    for (const img of images) {
      if (img && typeof img === 'string' && (img.startsWith('http') || img.startsWith('/'))) {
        return img;
      }
    }
    return null;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel Produktów</h1>
            <p className="text-gray-600">BaseLinker Integration</p>
          </div>
          
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasło dostępu
              </label>
              <input
                type="password"
                placeholder="Wprowadź hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sprawdzanie...
                </div>
              ) : (
                'Zaloguj się'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Produkty BaseLinker
              </h1>
              <p className="text-sm text-gray-500">
                Znaleziono {products.length} produktów
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Brak produktów</h3>
            <p className="text-gray-500">Nie znaleziono produktów w BaseLinker</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const imageUrl = getValidImageUrl(product.images);
              
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load:', imageUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', imageUrl);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-400">Brak zdjęcia</p>
                          {/* DEBUG: Pokaż raw images data */}
                          {product._debug_images && (
                            <p className="text-xs text-red-400 mt-1">
                              Debug: {JSON.stringify(product._debug_images)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      SKU: {product.sku}
                    </p>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {new Intl.NumberFormat('pl-PL', {
                            style: 'currency',
                            currency: 'PLN'
                          }).format(product.price_brutto)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Magazyn</p>
                        <p className={`font-semibold ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {product.quantity} szt.
                        </p>
                      </div>
                    </div>
                    
                    {/* DEBUG: Show images array */}
                    {product.images && product.images.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Images: {product.images.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
