import React, { useState, useEffect } from "react";

const API_BASE =
  "https://tymn5ur022.execute-api.ap-southeast-1.amazonaws.com/prod/api";

const theme = {
  page: {
    fontFamily: "'Inter', system-ui, sans-serif",
    margin: 0,
    padding: 0,
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #111827 0%, #1f2937 45%, #111827 100%)",
    color: "#e5e7eb",
  },
  frame: {
    maxWidth: "1100px",
    margin: "2rem auto",
    padding: "0 1.5rem",
  },
  header: {
    container: {
      background: "rgba(15, 23, 42, 0.9)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "18px",
      padding: "1.2rem 1.5rem",
      marginBottom: "1.75rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "1rem",
      backdropFilter: "blur(14px)",
    },
    title: {
      margin: 0,
      fontSize: "1.85rem",
      fontWeight: 800,
      letterSpacing: "-0.03em",
      lineHeight: 1.05,
      background: "linear-gradient(90deg, #a855f7, #38bdf8)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    subtitle: {
      margin: "0.4rem 0 0",
      fontSize: "0.95rem",
      color: "rgba(229,231,235,0.7)",
    },
    tabs: {
      display: "flex",
      gap: "0.75rem",
      flexWrap: "wrap",
    },
  },
  section: {
    card: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "18px",
      padding: "1.5rem",
      overflow: "hidden",
    },
    title: {
      margin: 0,
      fontSize: "1.35rem",
      fontWeight: 700,
      color: "#f8fafc",
    },
    description: {
      margin: "0.5rem 0 0",
      color: "rgba(229,231,235,0.68)",
      fontSize: "0.95rem",
    },
  },
  button: {
    primary: {
      padding: "0.75rem 1.25rem",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "0.95rem",
      transition: "transform 0.18s ease, box-shadow 0.18s ease",
      background: "linear-gradient(135deg, #8b5cf6, #38bdf8)",
      color: "#fff",
    },
    secondary: {
      padding: "0.75rem 1.25rem",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      color: "#e5e7eb",
      cursor: "pointer",
    },
    pill: {
      padding: "0.6rem 1rem",
      borderRadius: "999px",
      border: "none",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "0.88rem",
    },
  },
  input: {
    base: {
      width: "100%",
      padding: "0.85rem 1rem",
      borderRadius: "14px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      color: "#f8fafc",
      fontSize: "0.98rem",
      outline: "none",
    },
  },
  textMuted: {
    color: "rgba(229,231,235,0.65)",
  },
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [addingProduct, setAddingProduct] = useState(false);
  const [cartStatus, setCartStatus] = useState({});

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
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`,
      );
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
        ? items.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
          )
        : [
            ...items,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
            },
          ];

      const res = await fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updatedItems }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCartStatus((prev) => ({ ...prev, [product.id]: "added" }));
      setTimeout(
        () => setCartStatus((prev) => ({ ...prev, [product.id]: null })),
        1500,
      );
    } catch (err) {
      setCartStatus((prev) => ({ ...prev, [product.id]: "error" }));
      setError(`Failed to add to cart: ${err.message}`);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setAddingProduct(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewProduct({ name: "", price: "" });
      await fetchProducts();
    } catch (err) {
      setError(`Failed to add product: ${err.message}`);
    } finally {
      setAddingProduct(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "cart") fetchCart();
  }, [activeTab]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0,
  );
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={theme.page}>
      <div style={theme.frame}>
        <header style={theme.header.container}>
          <div>
            <span
              style={{
                ...theme.textMuted,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              Store dashboard
            </span>
            <h1 style={theme.header.title}>IDP Serverless Store</h1>
            <p style={theme.header.subtitle}>
              Clean, professional UI for your product catalog and cart
              experience.
            </p>
          </div>

          <div style={theme.header.tabs}>
            {["products", "cart", "add"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...theme.button.pill,
                  background:
                    activeTab === tab ? "#4f46e5" : "rgba(255,255,255,0.06)",
                  color: activeTab === tab ? "#fff" : "#d1d5db",
                  boxShadow:
                    activeTab === tab
                      ? "0 10px 30px rgba(79,70,229,0.18)"
                      : "none",
                }}
              >
                {tab === "products"
                  ? "Products"
                  : tab === "cart"
                    ? "Cart"
                    : "Add Product"}
              </button>
            ))}
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gap: "1.5rem",
            marginBottom: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div style={theme.section.card}>
            <p style={theme.section.title}>Product inventory</p>
            <p style={theme.section.description}>
              {products.length} items available for sale.
            </p>
          </div>
          <div style={theme.section.card}>
            <p style={theme.section.title}>Active cart</p>
            <p style={theme.section.description}>
              {cartQuantity} items in cart • ${cartTotal.toFixed(2)} total
            </p>
          </div>
          <div style={theme.section.card}>
            <p style={theme.section.title}>Live actions</p>
            <p style={theme.section.description}>
              Use the tabs above to browse, add items, or manage cart contents
              in real time.
            </p>
          </div>
        </section>

        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.22)",
              borderRadius: "14px",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                color: "#fbbf24",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ×
            </button>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchProducts()}
                placeholder="Search products"
                style={theme.input.base}
              />
              <button
                onClick={searchProducts}
                style={{ ...theme.button.primary, minWidth: "140px" }}
              >
                Search
              </button>
              <button onClick={fetchProducts} style={theme.button.secondary}>
                Refresh
              </button>
            </div>

            {loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: theme.textMuted.color,
                }}
              >
                Loading products...
              </div>
            )}
            {!loading && products.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: theme.textMuted.color,
                }}
              >
                No products found. Add some to populate the catalog.
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {products.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "18px",
                    padding: "1.5rem",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 18px 45px rgba(79,70,229,0.16)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                    }}
                  >
                    <span style={{ fontSize: "1.35rem" }}>📦</span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: theme.textMuted.color,
                      }}
                    >
                      ID: {p.id}
                    </span>
                  </div>
                  <h3
                    style={{
                      margin: "0 0 0.75rem",
                      fontSize: "1.15rem",
                      color: "#f8fafc",
                    }}
                  >
                    {p.name || "Unnamed Product"}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: theme.textMuted.color,
                      fontSize: "0.95rem",
                    }}
                  >
                    Price
                  </p>
                  <p
                    style={{
                      margin: "0.35rem 0 1.25rem",
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#a78bfa",
                    }}
                  >
                    $
                    {typeof p.price === "number" ? p.price.toFixed(2) : p.price}
                  </p>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={cartStatus[p.id] === "adding"}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "14px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#fff",
                      background:
                        cartStatus[p.id] === "added"
                          ? "#16a34a"
                          : cartStatus[p.id] === "error"
                            ? "#dc2626"
                            : "linear-gradient(135deg, #8b5cf6, #38bdf8)",
                    }}
                  >
                    {cartStatus[p.id] === "adding"
                      ? "Adding…"
                      : cartStatus[p.id] === "added"
                        ? "Added"
                        : cartStatus[p.id] === "error"
                          ? "Try again"
                          : "Add to cart"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "cart" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h2 style={theme.section.title}>Shopping Cart</h2>
                <p style={theme.section.description}>
                  {cartQuantity} items selected
                </p>
              </div>
              <button onClick={fetchCart} style={theme.button.secondary}>
                Refresh
              </button>
            </div>
            {loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: theme.textMuted.color,
                }}
              >
                Loading cart...
              </div>
            )}
            {!loading && cart.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: theme.textMuted.color,
                }}
              >
                Cart is empty. Add products to start checkout.
              </div>
            )}
            {cart.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "1.2rem 1.3rem",
                  marginBottom: "0.85rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                    {item.name || item.productId}
                  </div>
                  <div
                    style={{ color: theme.textMuted.color, fontSize: "0.9rem" }}
                  >
                    Qty: {item.quantity}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#a78bfa",
                    fontSize: "1.05rem",
                  }}
                >
                  ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            {cart.length > 0 && (
              <div
                style={{
                  textAlign: "right",
                  marginTop: "1rem",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                Total: ${cartTotal.toFixed(2)}
              </div>
            )}
          </div>
        )}

        {activeTab === "add" && (
          <div style={{ maxWidth: "520px", margin: "0 auto" }}>
            <h2 style={theme.section.title}>Add New Product</h2>
            <div
              style={{
                ...theme.section.card,
                borderRadius: "20px",
                padding: "2rem",
                display: "grid",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.88rem",
                    color: theme.textMuted.color,
                    display: "block",
                    marginBottom: "0.45rem",
                  }}
                >
                  Product Name
                </label>
                <input
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Wireless Headphones"
                  style={theme.input.base}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.88rem",
                    color: theme.textMuted.color,
                    display: "block",
                    marginBottom: "0.45rem",
                  }}
                >
                  Price ($)
                </label>
                <input
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, price: e.target.value }))
                  }
                  type="number"
                  placeholder="49.99"
                  style={theme.input.base}
                />
              </div>
              <button
                onClick={addProduct}
                disabled={
                  addingProduct || !newProduct.name || !newProduct.price
                }
                style={{
                  ...theme.button.primary,
                  opacity: !newProduct.name || !newProduct.price ? 0.6 : 1,
                  cursor:
                    !newProduct.name || !newProduct.price
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {addingProduct ? "Adding product…" : "Add Product"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
