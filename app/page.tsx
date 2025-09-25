'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './hooks/useAuth'; // Dostosuj ścieżkę jeśli trzeba
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  sku: string;
  price_brutto: number;
  quantity: number;
  images: string[];
  description?: string;
  category_id?: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

export default function HomePage() {
  // Używaj hook useAuth zamiast lokalnego stanu
  const { isLoggedIn, saveSession, clearSession, getRemainingTime } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Filtry
  const [hideOutOfStock, setHideOutOfStock] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Auto-load produktów jeśli już zalogowany
  useEffect(() => {
    if (isLoggedIn && products.length === 0) {
      console.log('🔄 Auto-loading products for logged in user');
      loadProducts();
    }
  }, [isLoggedIn]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'auto-load' }) // Specjalny token dla auto-load
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        console.log('✅ Products auto-loaded:', data.products.length);
      }
    } catch (err) {
      console.error('❌ Auto-load error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        setProducts(data.products);
        
        // Zapisz sesję
        saveSession(rememberMe);
        
        console.log('✅ Login successful, session saved');
        console.log('📊 Products loaded:', data.products.length);
      } else {
        setError(data.error || 'Wystąpił błąd');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Błąd połączenia z serwerem');
    }
    setLoading(false);
  };

  const logout = () => {
    clearSession();
    setProducts([]);
    setPassword('');
    setError('');
    setSearchTerm('');
    setSortBy('name-asc');
    setHideOutOfStock(true);
    setSelectedCategory('all');
    console.log('👋 User logged out');
  };

  // Reszta funkcji bez zmian...
  const processCategories = (): Category[] => {
    console.log('🔄 Processing categories from products:', products.length);
    
    const categoryMap = new Map<string, { name: string; count: number }>();
    
    products.forEach((product, index) => {
      const categoryId = product.category_id || '';
      const categoryName = product.category_name || 'Bez kategorii';
      
      if (index < 5) {
        console.log(`🔍 Product #${index + 1}: "${product.name}"`);
        console.log(`   - category_id: "${categoryId}"`);
        console.log(`   - category_name: "${categoryName}"`);
      }
      
      if (categoryMap.has(categoryId)) {
        categoryMap.get(categoryId)!.count++;
      } else {
        categoryMap.set(categoryId, {
          name: categoryName,
          count: 1
        });
      }
    });
    
    const categories = Array.from(categoryMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      count: data.count
    }));
    
    categories.sort((a, b) => {
      if (a.id === '') return 1;
      if (b.id === '') return -1;
      if (a.name.startsWith('Kategoria ') && !b.name.startsWith('Kategoria ')) return 1;
      if (!a.name.startsWith('Kategoria ') && b.name.startsWith('Kategoria ')) return -1;
      return a.name.localeCompare(b.name, 'pl');
    });
    
    console.log('✅ Categories for UI:', categories.length, 'categories found');
    return categories;
  };

  const categories = processCategories();

  const getSortedProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name, 'pl');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'pl');
        case 'price-asc':
          return a.price_brutto - b.price_brutto;
        case 'price-desc':
          return b.price_brutto - a.price_brutto;
        case 'stock-asc':
          return a.quantity - b.quantity;
        case 'stock-desc':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        (product.category_id || '') === selectedCategory
      );
    }

    if (hideOutOfStock) {
      filtered = filtered.filter(product => product.quantity > 0);
    }

    return getSortedProducts(filtered);
  };

  const filteredProducts = getFilteredProducts();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel Produktów</h1>
            <p className="text-gray-600">Wprowadź hasło aby uzyskać dostęp</p>
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Zapamiętaj logowanie {rememberMe ? '(24h)' : '(4h)'}
              </label>
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

          <div className="mt-4 text-center text-xs text-gray-500">
            🔒 Twoje dane są bezpieczne i przechowywane lokalnie
          </div>
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
                Katalog Produktów
              </h1>
              <p className="text-sm text-gray-500">
                Wyświetlane: {filteredProducts.length} z {products.length} produktów
                {categories.length > 0 && ` • ${categories.length} kategorii dostępnych`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Session info */}
              <div className="text-right text-xs text-gray-500">
                <div>Sesja wygasa za:</div>
                <div className="font-medium text-blue-600">{getRemainingTime()}</div>
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
      </div>

      {/* Loading overlay dla auto-load */}
      {loading && products.length === 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Ładowanie produktów...</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wyszukaj produkt
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nazwa lub SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
              >
                <option value="all">Wszystkie kategorie ({products.length})</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sortowanie
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
              >
                <option value="name-asc">Nazwa A-Z</option>
                <option value="name-desc">Nazwa Z-A</option>
                <option value="price-asc">Cena rosnąco</option>
                <option value="price-desc">Cena malejąco</option>
                <option value="stock-asc">Stan magazynowy rosnąco</option>
                <option value="stock-desc">Stan magazynowy malejąco</option>
              </select>
            </div>

            {/* Toggle - Hide out of stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dostępność
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setHideOutOfStock(!hideOutOfStock)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    hideOutOfStock ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={hideOutOfStock}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      hideOutOfStock ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="ml-3 text-sm">
                  <span className="font-medium text-gray-900">
                    {hideOutOfStock ? 'Ukryj niedostępne' : 'Pokaż wszystkie'}
                  </span>
                  <span className="text-gray-500 block">
                    {hideOutOfStock 
                      ? `Ukryte: ${products.filter(p => p.quantity === 0).length} produktów`
                      : 'Wyświetlane wszystkie produkty'
                    }
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{products.length}</div>
            <div className="text-sm text-gray-500">Wszystkich produktów</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.quantity > 0).length}
            </div>
            <div className="text-sm text-gray-500">Dostępnych</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.quantity === 0).length}
            </div>
            <div className="text-sm text-gray-500">Niedostępnych</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
            <div className="text-sm text-gray-500">Kategorii</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{filteredProducts.length}</div>
            <div className="text-sm text-gray-500">Wyświetlanych</div>
          </div>
        </div>

        {/* Categories Debug (development only) */}
        {process.env.NODE_ENV === 'development' && categories.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">
              🔧 Debug: Kategorie (dev mode)
            </h3>
            <div className="text-sm text-yellow-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {categories.slice(0, 10).map((cat) => (
                  <div key={cat.id} className="flex justify-between">
                    <span className={cat.name.startsWith('Kategoria ') ? 'text-red-600' : 'text-green-600'}>
                      {cat.name}
                    </span>
                    <span className="text-gray-500">({cat.count})</span>
                  </div>
                ))}
              </div>
              {categories.length > 10 && (
                <div className="mt-2 text-xs text-yellow-600">
                  ... i {categories.length - 10} więcej kategorii
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Brak wyników wyszukiwania' : 'Brak produktów'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `Nie znaleziono produktów dla "${searchTerm}"`
                : hideOutOfStock
                ? 'Wszystkie produkty są niedostępne. Wyłącz filtr dostępności.'
                : 'Nie znaleziono żadnych produktów'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <div className="mt-4 space-x-2">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Wyczyść wyszukiwanie
                  </button>
                )}
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Pokaż wszystkie kategorie
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
              >
                <Link
                  href={`/product/${product.id}`}
                  key={product.id}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 cursor-pointer group"
                >
                {/* Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      height={600}
                      width={600}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Stock badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      product.quantity > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.quantity > 0 ? `${product.quantity} szt.` : 'Brak'}
                    </span>
                  </div>
                  
                  {/* Category badge */}
                  {product.category_name && (
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        product.category_name.startsWith('Kategoria ')
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {product.category_name.length > 20 
                          ? product.category_name.substring(0, 17) + '...'
                          : product.category_name
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    SKU: {product.sku}
                  </p>
                  
                  {product.category_name && (
                    <p className="text-xs text-gray-400 mb-3">
                      📁 {product.category_name}
                    </p>
                  )}
                  
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
                </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}