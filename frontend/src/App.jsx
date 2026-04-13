import React, { useState, useEffect } from 'react'

const API_BASE = 'https://tymn5ur022.execute-api.ap-southeast-1.amazonaws.com/prod/api'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('products')
  const [newProduct, setNewProduct] = useState({ name: '', price: '' })
  const [addingProduct, setAddingProduct] = useState(false)
  const [cartStatus, setCartStatus] = useState({})

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/products`)
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(`Failed to fetch products: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(`Search failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchCart = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/cart`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setCart(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(`Failed to fetch cart: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product) => {
    setCartStatus(prev => ({ ...prev, [product.id]: 'adding' }))
    try {
      const currentCart = await fetch(`${API_BASE}/cart`).then(r => r.json())
      const items = Array.isArray(currentCart?.items) ? currentCart.items : []
      const existing = items.find(i => i.productId === product.id)
      const updatedItems = existing
        ? items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...items, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]

      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setCartStatus(prev => ({ ...prev, [product.id]: 'added' }))
      setTimeout(() => setCartStatus(prev => ({ ...prev, [product.id]: null })), 1500)
    } catch (err) {
      setCartStatus(prev => ({ ...prev, [product.id]: 'error' }))
      setError(`Failed to add to cart: ${err.message}`)
    }
  }

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return
    setAddingProduct(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProduct.name, price: parseFloat(newProduct.price) })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setNewProduct({ name: '', price: '' })
      await fetchProducts()
    } catch (err) {
      setError(`Failed to add product: ${err.message}`)
    } finally {
      setAddingProduct(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (activeTab === 'cart') fetchCart()
  }, [activeTab])

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", margin: 0, padding: 0, minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: '#fff' }}>
      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🛒 IDP Store
          </h1>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Serverless AWS Microservices</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['products', 'cart', 'add'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                background: activeTab === tab ? 'linear-gradient(135deg, #a78bfa, #60a5fa)' : 'rgba(255,255,255,0.1)',
                color: '#fff' }}>
              {tab === 'products' ? '📦 Products' : tab === 'cart' ? '🛒 Cart' : '➕ Add Product'}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchProducts()}
                placeholder="Search products..."
                style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '0.95rem' }} />
              <button onClick={searchProducts} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', background: 'rgba(139,92,246,0.5)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>🔍 Search</button>
              <button onClick={fetchProducts} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer' }}>↻ Refresh</button>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>⏳ Loading products...</div>}
            {!loading && products.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>No products found. Add some!</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem' }}>{p.name || 'Unnamed Product'}</h3>
                  <p style={{ margin: '0 0 0.25rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>ID: {p.id}</p>
                  <p style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 700, color: '#a78bfa' }}>
                    ${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                  </p>
                  <button onClick={() => addToCart(p)}
                    disabled={cartStatus[p.id] === 'adding'}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                      background: cartStatus[p.id] === 'added' ? 'rgba(34,197,94,0.3)' : cartStatus[p.id] === 'error' ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                      color: '#fff' }}>
                    {cartStatus[p.id] === 'adding' ? '⏳ Adding...' : cartStatus[p.id] === 'added' ? '✅ Added!' : cartStatus[p.id] === 'error' ? '❌ Failed' : '🛒 Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Your Cart</h2>
              <button onClick={fetchCart} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer' }}>↻ Refresh</button>
            </div>
            {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>⏳ Loading cart...</div>}
            {!loading && cart.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>Your cart is empty. Add some products!</div>}
            {cart.map((item, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name || item.productId}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '1.1rem' }}>
                  {item.price ? `$${(item.price * item.quantity).toFixed(2)}` : ''}
                </div>
              </div>
            ))}
            {cart.length > 0 && (
              <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
                Total: ${cart.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.quantity), 0).toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === 'add' && (
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Product</h2>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.4rem' }}>Product Name</label>
                <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Wireless Headphones"
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.4rem' }}>Price ($)</label>
                <input value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                  type="number" placeholder="e.g. 49.99"
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
              <button onClick={addProduct} disabled={addingProduct || !newProduct.name || !newProduct.price}
                style={{ padding: '0.8rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: (!newProduct.name || !newProduct.price) ? 0.5 : 1 }}>
                {addingProduct ? '⏳ Adding...' : '➕ Add Product'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
