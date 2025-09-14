"use client";
import { useState, useEffect } from 'react';


const ProductsList = ({ onLogout }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const password = sessionStorage.getItem('password') || 
                      prompt('Wprowadź hasło ponownie:');
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Błąd podczas pobierania produktów');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Ładowanie produktów...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={fetchProducts} className={styles.retryButton}>
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Lista Produktów BaseLinker</h1>
        <div className={styles.headerActions}>
          <span className={styles.count}>
            Produktów: {products.length}
          </span>
          <button onClick={fetchProducts} className={styles.refreshButton}>
            Odśwież
          </button>
          <button onClick={onLogout} className={styles.logoutButton}>
            Wyloguj
          </button>
        </div>
      </header>

      <div className={styles.productsGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImage}>
              {product.images && product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className={styles.noImage}>Brak zdjęcia</div>
              )}
            </div>
            
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productSku}>SKU: {product.sku}</p>
              
              <div className={styles.productDetails}>
                <div className={styles.price}>
                  {formatPrice(product.price_brutto)}
                </div>
                <div className={styles.stock}>
                  Magazyn: {product.quantity || 0} szt.
                </div>
              </div>
              
              {product.description && (
                <p className={styles.description}>
                  {product.description.substring(0, 100)}
                  {product.description.length > 100 ? '...' : ''}
                </p>
              )}
              
              <div className={styles.productMeta}>
                <span className={styles.category}>
                  Kategoria: {product.category_id || 'Brak'}
                </span>
                <span className={styles.status}>
                  Status: {product.is_bundle ? 'Zestaw' : 'Pojedynczy'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className={styles.emptyState}>
          <h2>Brak produktów</h2>
          <p>Nie znaleziono żadnych produktów w BaseLinker</p>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
