import React, { useState, useEffect } from "react";

const API_BASE = "https://tymn5ur022.execute-api.ap-southeast-1.amazonaws.com/prod/api";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Kitchen", "Sports", "General"];

const theme = {
  page: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: 0,
    minHeight: "100vh",
    backgroundColor: "#f5f5f7",
    color: "#1d1d1f",
    WebkitFontSmoothing: "antialiased",
  },
  frame: {
    maxWidth: "1024px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
  },
  header: {
    container: {
      padding: "1rem 0 3rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "1.5rem",
    },
    title: {
      margin: 0,
      fontSize: "3rem",
      fontWeight: 700,
      letterSpacing: "-0.015em",
      color: "#1d1d1f",
    },
    subtitle: {
      margin: "0.5rem 0 0",
      fontSize: "1.2rem",
      fontWeight: 400,
      color: "#86868b",
      maxWidth: "500px",
    },
    tabsContainer: {
      display: "flex",
      background: "#e3e3e8",
      borderRadius: "999px",
      padding: "0.25rem",
      gap: "0.25rem",
    },
  },
  section: {
    card: {
      background: "#ffffff",
      borderRadius: "18px",
      padding: "2rem",
      boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
      border: "1px solid rgba(0,0,0,0.02)",
    },
    title: {
      margin: 0,
      fontSize: "1.5rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      color: "#1d1d1f",
    },
    description: {
      margin: "0.5rem 0 0",
      color: "#86868b",
      fontSize: "1rem",
    },
  },
  button: {
    primary: {
      padding: "0.8rem 1.5rem",
      borderRadius: "999px",
      border: "none",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "0.95rem",
      background: "#0071e3",
      color: "#fff",
      transition: "all 0.2s ease",
    },
    secondary: {
      padding: "0.8rem 1.5rem",
      borderRadius: "999px",
      border: "none",
      background: "#e8e8ed",
      color: "#1d1d1f",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "0.95rem",
      transition: "all 0.2s ease",
    },
    pillActive: {
      padding: "0.6rem 1.25rem",
      borderRadius: "999px",
      border: "none",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "0.95rem",
      background: "#ffffff",
      color: "#1d1d1f",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      transition: "all 0.2s ease",
    },
    pillInactive: {
      padding: "0.6rem 1.25rem",
      borderRadius: "999px",
      border: "none",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "0.95rem",
      background: "transparent",
      color: "#86868b",
      transition: "all 0.2s ease",
    },
  },
  input: {
    base: {
      width: "100%",
      padding: "1rem 1.25rem",
      borderRadius: "12px",
      border: "1px solid #d2d2d7",
      background: "#ffffff",
      color: "#1d1d1f",
      fontSize: "1.05rem",
      outline: "none",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
    },
  },
  textMuted: { color: "#86868b" },
};

const EMPTY_PRODUCT = { name: "", price: "", category: "Electronics", stock: "" };

function fmt(price) {
  const n = parseFloat(price);
  return isNaN(n) ? price : "\u20B9" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [addingProduct, setAddingProduct] = useState(false);
  const [cartStatus, setCartStatus] = useState({});
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Failed to fetch products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/cart`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCart(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(`Failed to fetch cart: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    setCartStatus((prev) => ({ ...prev, [product.id]: "adding" }));
    try {
      const currentCart = await fetch(`${API_BASE}/cart`).then((r) => r.json());
      const items = Array.isArray(currentCart?.items) ? currentCart.items : [];
      const existing = items.find((i) => i.productId === product.id);
      const updatedItems = existing
        ? items.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...items, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];

      const res = await fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updatedItems }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCartStatus((prev) => ({ ...prev, [product.id]: "added" }));
      setTimeout(() => setCartStatus((prev) => ({ ...prev, [product.id]: null })), 1500);
    } catch (err) {
      setCartStatus((prev) => ({ ...prev, [product.id]: "error" }));
      setError(`Failed to add to cart: ${err.message}`);
    }
  };

  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setAddingProduct(true);
    setError(null);
    try {
      const url = editingId ? `${API_BASE}/products/${editingId}` : `${API_BASE}/products`;
      const method = editingId ? "PUT" : "POST";
      const payload = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category || "General",
        stock: parseInt(newProduct.stock || 0, 10),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewProduct(EMPTY_PRODUCT);
      setEditingId(null);
      await fetchProducts();
    } catch (err) {
      setError(`Failed to save product: ${err.message}`);
    } finally {
      setAddingProduct(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchProducts();
    } catch (err) {
      setError(`Failed to delete product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setNewProduct({
      name: product.name,
      price: typeof product.price === "number" ? product.price.toString() : product.price,
      category: product.category || "Electronics",
      stock: product.stock !== undefined ? product.stock.toString() : "",
    });
    setEditingId(product.id);
    setActiveTab("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setNewProduct(EMPTY_PRODUCT);
    setEditingId(null);
  };

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { if (activeTab === "cart") fetchCart(); }, [activeTab]);

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price || 0) * item.quantity, 0);
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={theme.page}>
      <div style={theme.frame}>

        {/* ── HEADER ── */}
        <header style={theme.header.container}>
          <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "#86868b", fontWeight: 600 }}>
            Serverless Store
          </span>
          <h1 style={theme.header.title}>IDP Serverless Store</h1>
          <p style={theme.header.subtitle}>
            A modern, serverless microservices architecture with an intuitive aesthetic layout.
          </p>
          <div style={theme.header.tabsContainer}>
            {["products", "cart", "admin"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); if (tab !== "admin") cancelEdit(); }}
                style={activeTab === tab ? theme.button.pillActive : theme.button.pillInactive}
              >
                {tab === "products" ? "Storefront" : tab === "cart" ? "Shopping Cart" : "Admin Panel"}
              </button>
            ))}
          </div>
        </header>

        {/* ── STATS ── */}
        <section style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div style={theme.section.card}>
            <p style={theme.section.title}>Product Inventory</p>
            <p style={theme.section.description}>{products.length} items available</p>
          </div>
          <div style={theme.section.card}>
            <p style={theme.section.title}>Your Bag</p>
            <p style={theme.section.description}>{cartQuantity} items &bull; {fmt(cartTotal)} total</p>
          </div>
        </section>

        {/* ── ERROR BANNER ── */}
        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #ffdcd5", borderRadius: "14px", padding: "1rem 1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#ff3b30", fontWeight: 500 }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: "1.5rem", padding: 0 }}>×</button>
          </div>
        )}

        {/* ── STOREFRONT TAB ── */}
        {activeTab === "products" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", marginBottom: "2rem" }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchProducts()}
                placeholder="Search for products..."
                style={theme.input.base}
              />
              <button onClick={searchProducts} style={{ ...theme.button.primary, minWidth: "120px" }}>Search</button>
              <button onClick={fetchProducts} style={theme.button.secondary}>Refresh</button>
            </div>

            {loading && <div style={{ textAlign: "center", padding: "4rem", color: "#86868b" }}>Loading inventory...</div>}
            {!loading && products.length === 0 && <div style={{ textAlign: "center", padding: "4rem", color: "#86868b" }}>No products found. Add items via Admin Panel.</div>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {products.map((p) => (
                <div
                  key={p.id}
                  style={{ background: "#fff", border: "1px solid #e5e5ea", borderRadius: "18px", padding: "2rem", transition: "all 0.3s ease", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.03)"; }}
                >
                  {/* Category badge */}
                  <div style={{ display: "inline-block", background: "#f0f0f5", borderRadius: "6px", padding: "0.25rem 0.65rem", fontSize: "0.78rem", color: "#636366", fontWeight: 600, marginBottom: "1rem" }}>
                    {p.category || "General"}
                  </div>
                  <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.25rem", color: "#1d1d1f", fontWeight: 600 }}>
                    {p.name || "Unnamed Product"}
                  </h3>
                  <div style={{ fontSize: "0.88rem", color: "#86868b", marginBottom: "1.25rem" }}>
                    {p.stock !== undefined ? `${p.stock} in stock` : "Stock unavailable"}
                  </div>
                  <div style={{ margin: "0 0 1.5rem", fontSize: "1.9rem", fontWeight: 700, color: "#1d1d1f" }}>
                    {fmt(p.price)}
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={cartStatus[p.id] === "adding"}
                    style={{
                      width: "100%", padding: "0.9rem", borderRadius: "999px", border: "none", cursor: "pointer",
                      fontWeight: 500, fontSize: "0.95rem", transition: "all 0.2s ease",
                      color: cartStatus[p.id] === "added" ? "#1d1d1f" : "#fff",
                      background: cartStatus[p.id] === "added" ? "#e8e8ed" : cartStatus[p.id] === "error" ? "#ff3b30" : "#0071e3",
                    }}
                  >
                    {cartStatus[p.id] === "adding" ? "Processing…" : cartStatus[p.id] === "added" ? "Added to Cart" : cartStatus[p.id] === "error" ? "Error! Try Again" : "Add to Cart"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CART TAB ── */}
        {activeTab === "cart" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div>
                <h2 style={theme.section.title}>Your Bag</h2>
                <p style={theme.section.description}>{cartQuantity} items</p>
              </div>
              <button onClick={fetchCart} style={theme.button.secondary}>Refresh</button>
            </div>

            {loading && <div style={{ textAlign: "center", padding: "4rem", color: "#86868b" }}>Loading bag...</div>}
            {!loading && cart.length === 0 && <div style={{ textAlign: "center", padding: "4rem", color: "#86868b" }}>Your bag is empty.</div>}

            <div style={{ background: "#fff", borderRadius: "18px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  style={{ padding: "1.5rem 2rem", borderBottom: idx !== cart.length - 1 ? "1px solid #f5f5f7" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#1d1d1f", fontSize: "1.1rem" }}>{item.name || item.productId}</div>
                    <div style={{ color: "#86868b", fontSize: "0.95rem", marginTop: "0.3rem" }}>Qty: {item.quantity} &bull; {fmt(item.price)} each</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#1d1d1f", fontSize: "1.2rem" }}>{fmt(parseFloat(item.price || 0) * item.quantity)}</div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div style={{ textAlign: "right", marginTop: "2rem", fontSize: "1.8rem", fontWeight: 700, color: "#1d1d1f" }}>
                Total: {fmt(cartTotal)}
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN TAB ── */}
        {activeTab === "admin" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={theme.section.title}>Product Administration</h2>
              <button onClick={cancelEdit} style={theme.button.secondary}>Reset Editor</button>
            </div>

            {/* Form */}
            <div style={{ ...theme.section.card, marginBottom: "2rem" }}>
              <h3 style={{ margin: "0 0 1.5rem", color: "#1d1d1f", fontSize: "1.2rem", fontWeight: 600 }}>
                {editingId ? "Edit Product" : "Publish New Product"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                {/* Name */}
                <div>
                  <label style={{ fontSize: "0.88rem", color: "#86868b", display: "block", marginBottom: "0.4rem", fontWeight: 500 }}>Product Name</label>
                  <input value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Sony WH-1000XM5" style={theme.input.base} />
                </div>
                {/* Price */}
                <div>
                  <label style={{ fontSize: "0.88rem", color: "#86868b", display: "block", marginBottom: "0.4rem", fontWeight: 500 }}>Price (&#8377;)</label>
                  <input value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} type="number" placeholder="e.g. 24900" style={theme.input.base} />
                </div>
                {/* Category */}
                <div>
                  <label style={{ fontSize: "0.88rem", color: "#86868b", display: "block", marginBottom: "0.4rem", fontWeight: 500 }}>Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))} style={theme.input.base}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Stock */}
                <div>
                  <label style={{ fontSize: "0.88rem", color: "#86868b", display: "block", marginBottom: "0.4rem", fontWeight: 500 }}>Stock Quantity</label>
                  <input value={newProduct.stock} onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))} type="number" placeholder="e.g. 50" style={theme.input.base} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={saveProduct}
                  disabled={addingProduct || !newProduct.name || !newProduct.price}
                  style={{ ...theme.button.primary, flex: 1, opacity: (!newProduct.name || !newProduct.price) ? 0.5 : 1, cursor: (!newProduct.name || !newProduct.price) ? "not-allowed" : "pointer" }}
                >
                  {addingProduct ? "Saving…" : editingId ? "Save Changes" : "Publish Product"}
                </button>
                {editingId && <button onClick={cancelEdit} style={{ ...theme.button.secondary, flex: 1 }}>Cancel</button>}
              </div>
            </div>

            {/* Product list */}
            <div style={theme.section.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ margin: 0, color: "#1d1d1f", fontSize: "1.2rem", fontWeight: 600 }}>Catalog Database</h3>
                <button onClick={fetchProducts} style={{ ...theme.button.secondary, padding: "0.5rem 1rem", fontSize: "0.85rem" }}>Refresh</button>
              </div>

              {loading && <p style={{ textAlign: "center", color: "#86868b", padding: "2rem" }}>Syncing...</p>}
              {!loading && products.length === 0 && <p style={{ textAlign: "center", color: "#86868b", padding: "2rem" }}>No products yet.</p>}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {products.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: editingId === p.id ? "#f0f5ff" : "#fafafa",
                      border: editingId === p.id ? "1px solid #0071e3" : "1px solid #e5e5ea",
                      borderRadius: "14px", padding: "1.1rem 1.25rem",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#1d1d1f", fontSize: "1rem" }}>{p.name}</div>
                      <div style={{ color: "#86868b", fontSize: "0.88rem", marginTop: "0.25rem" }}>
                        {p.category || "General"} &bull; Stock: {p.stock ?? "—"} &bull;{" "}
                        <span style={{ fontWeight: 600, color: "#1d1d1f" }}>{fmt(p.price)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <button
                        onClick={() => startEdit(p)}
                        style={{ ...theme.button.secondary, background: editingId === p.id ? "#0071e3" : "#e8e8ed", color: editingId === p.id ? "#fff" : "#1d1d1f", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                      >
                        {editingId === p.id ? "Editing" : "Edit"}
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        style={{ ...theme.button.secondary, padding: "0.5rem 1rem", fontSize: "0.85rem", background: "#fef0f0", color: "#ff3b30" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
