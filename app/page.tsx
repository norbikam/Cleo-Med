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
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Stany dla filtrów
  const [hideOutOfStock, setHideOutOfStock] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stan dla rozwijania filtrów na mobile
  const [filtersExpanded, setFiltersExpanded] = useState(false);

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
    setSearchTerm('');
    setSortBy('name-asc');
    setHideOutOfStock(true);
    setFiltersExpanded(false);
  };

  // Funkcja sortowania
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

  // Funkcja filtrowania
  const getFilteredProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-black"
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
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Produkty BaseLinker
              </h1>
              <p className="text-sm text-gray-500">
                Wyświetlane: {filteredProducts.length} z {products.length} produktów
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

      {/* Filters & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          
          {/* Mobile Toggle Button */}
          <div className="block lg:hidden">
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-t-lg"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <span className="font-medium text-gray-900">Filtry i sortowanie</span>
              </div>
              <div className="flex items-center">
                {/* Active filters indicator */}
                <div className="flex items-center space-x-2 mr-3">
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Wyszukiwanie
                    </span>
                  )}
                  {hideOutOfStock && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Tylko dostępne
                    </span>
                  )}
                  {sortBy !== 'name-asc' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Sortowane
                    </span>
                  )}
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${filtersExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Filters Content */}
          <div className={`
            lg:block 
            ${filtersExpanded ? 'block' : 'hidden'}
            transition-all duration-300 ease-in-out
            ${filtersExpanded ? 'animate-slideDown' : ''}
          `}>
            <div className="p-4 lg:p-6 border-t lg:border-t-0 border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                
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
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
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

              {/* Quick Clear Filters - Mobile */}
              <div className="block lg:hidden mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {(searchTerm || hideOutOfStock || sortBy !== 'name-asc') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setHideOutOfStock(true);
                        setSortBy('name-asc');
                      }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Wyczyść filtry
                    </button>
                  )}
                  <button
                    onClick={() => setFiltersExpanded(false)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors lg:hidden"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Zwiń
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 lg:p-4 border border-gray-200">
            <div className="text-xl lg:text-2xl font-bold text-blue-600">{products.length}</div>
            <div className="text-xs lg:text-sm text-gray-500">Wszystkich</div>
          </div>
          <div className="bg-white rounded-lg p-3 lg:p-4 border border-gray-200">
            <div className="text-xl lg:text-2xl font-bold text-green-600">
              {products.filter(p => p.quantity > 0).length}
            </div>
            <div className="text-xs lg:text-sm text-gray-500">Dostępnych</div>
          </div>
          <div className="bg-white rounded-lg p-3 lg:p-4 border border-gray-200">
            <div className="text-xl lg:text-2xl font-bold text-red-600">
              {products.filter(p => p.quantity === 0).length}
            </div>
            <div className="text-xs lg:text-sm text-gray-500">Niedostępnych</div>
          </div>
          <div className="bg-white rounded-lg p-3 lg:p-4 border border-gray-200">
            <div className="text-xl lg:text-2xl font-bold text-purple-600">{filteredProducts.length}</div>
            <div className="text-xs lg:text-sm text-gray-500">Wyświetlanych</div>
          </div>
        </div>
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
              {searchTerm ? 'Brak wyników wyszukiwania' : 
               hideOutOfStock ? 'Brak dostępnych produktów' : 'Brak produktów'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `Nie znaleziono produktów dla "${searchTerm}"`
                : hideOutOfStock 
                ? 'Wszystkie produkty są niedostępne lub spróbuj wyłączyć filtr dostępności'
                : 'Nie znaleziono żadnych produktów w BaseLinker'
              }
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
                >
                  Wyczyść wyszukiwanie
                </button>
              )}
              {hideOutOfStock && products.filter(p => p.quantity === 0).length > 0 && (
                <button
                  onClick={() => setHideOutOfStock(false)}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
                >
                  Pokaż niedostępne ({products.filter(p => p.quantity === 0).length})
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 transform hover:-translate-y-1"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
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
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      product.quantity > 10 
                        ? 'bg-green-100 text-green-800' 
                        : product.quantity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.quantity > 0 ? `${product.quantity} szt.` : 'Brak'}
                    </span>
                  </div>
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
                      <p className="text-xl lg:text-2xl font-bold text-green-600">
                        {new Intl.NumberFormat('pl-PL', {
                          style: 'currency',
                          currency: 'PLN'
                        }).format(product.price_brutto)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        product.quantity > 10 ? 'text-green-600' :
                        product.quantity > 0 ? 'text-yellow-600' : 'text-red-500'
                      }`}>
                        {product.quantity > 0 ? 'Dostępny' : 'Niedostępny'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
