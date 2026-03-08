import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [selectedPrices, setSelectedPrices] = useState({});
  const [addedItems, setAddedItems] = useState({});
  const [searchParams] = useSearchParams();

  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    const selected = selectedPrices[product.id];
    const price = selected || product.prices[0];
    if (!price) return;

    const cartKey = `${product.id}_${price.priceId}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey);
      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        cartKey,
        id: product.id,
        name: product.name,
        sizeLabel: price.label,
        priceId: price.priceId,
        priceCents: price.priceCents,
        quantity: 1,
      }];
    });
  };

  const removeFromCart = (cartKey) => {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const totalCents = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            stripePriceId: item.priceId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckingOut(false);
      }
    } catch {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-red-700 to-brand-orange">
        <Link to="/" className="text-white font-black text-2xl tracking-widest uppercase">
          Droplift
        </Link>
        <div className="text-white/80 text-sm uppercase tracking-wider">
          Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl text-brand-orange tracking-wider mb-8" style={{ fontFamily: "'Special Elite', cursive" }}>Merchandise</h1>

        {/* Success / Cancel banners */}
        {success && (
          <div className="border border-green-500 rounded-lg p-4 mb-8">
            <p className="text-green-400 font-semibold">Order placed! Thanks for the support.</p>
          </div>
        )}
        {canceled && (
          <div className="border border-gray-600 rounded-lg p-4 mb-8">
            <p className="text-gray-400">Checkout canceled — your cart is still here.</p>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No merch available yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-800 rounded-lg overflow-hidden group">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:opacity-80 transition-opacity"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-lg font-bold text-white mb-1">{product.name}</h2>
                  {product.description && (
                    <p className="text-gray-400 text-sm mb-3">{product.description}</p>
                  )}
                  {/* Size / variant selector */}
                  {product.prices.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.prices.map((price) => {
                        const isSelected = (selectedPrices[product.id]?.priceId || product.prices[0]?.priceId) === price.priceId;
                        return (
                          <button
                            key={price.priceId}
                            onClick={() => setSelectedPrices((prev) => ({ ...prev, [product.id]: price }))}
                            className={`px-3 py-1 text-xs uppercase tracking-wider rounded border transition-colors ${
                              isSelected
                                ? 'border-brand-orange text-brand-orange'
                                : 'border-gray-700 text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            {price.label || `$${(price.priceCents / 100).toFixed(2)}`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-brand-orange font-bold text-lg">
                      ${((selectedPrices[product.id]?.priceCents || product.prices[0]?.priceCents || 0) / 100).toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        addToCart(product);
                        setAddedItems((prev) => ({ ...prev, [product.id]: true }));
                        setTimeout(() => setAddedItems((prev) => ({ ...prev, [product.id]: false })), 1500);
                      }}
                      className={`px-4 py-2 font-bold uppercase text-sm tracking-wider rounded transition-colors ${
                        addedItems[product.id]
                          ? 'bg-black text-brand-orange border border-brand-orange'
                          : 'bg-brand-orange text-black hover:bg-brand-orange-light'
                      }`}
                    >
                      {addedItems[product.id] ? '\u2713 Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart summary */}
        {cart.length > 0 && (
          <div className="mt-12 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Your Cart</h2>
            {cart.map((item) => (
              <div key={item.cartKey} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                <div>
                  <span className="text-white">{item.name}</span>
                  {item.sizeLabel && <span className="text-gray-500 ml-2">({item.sizeLabel})</span>}
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-brand-orange">
                    ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.cartKey)}
                    className="text-gray-500 hover:text-red-500 text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
              <span className="text-lg font-bold text-white">
                Total: ${(totalCents / 100).toFixed(2)}
              </span>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="px-8 py-3 bg-brand-orange text-black font-bold uppercase tracking-wider rounded-lg hover:bg-brand-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingOut ? 'Redirecting...' : 'Checkout'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Store;
