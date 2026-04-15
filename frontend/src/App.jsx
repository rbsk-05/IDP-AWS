import React, { useState, useEffect } from "react";

const API_BASE =
  "https://tymn5ur022.execute-api.ap-southeast-1.amazonaws.com/prod/api";

const theme = {
  page: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
  textMuted: {
    color: "#86868b",
  },
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "General",
    stock: "",
  });
  const [addingProduct, setAddingProduct] = useState(false);
  const [cartStatus, setCartStatus] = useState({});
  const [cartUpdating, setCartUpdating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const PRODUCT_CATEGORIES = [
    "General",
    "Electronics",
    "Accessories",
    "Home",
    "Office",
  ];

  const parseStock = (stockValue) => {
    if (typeof stockValue === "number") return stockValue;
    if (typeof stockValue === "string" && stockValue.trim() !== "") {
      const parsed = parseInt(stockValue, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return `₹${amount.toFixed(2)}`;
  };

  const normalizeProduct = (product) => {
    const id = product.id || product.productId || product.product_id;
    return {
      ...product,
      id,
      stock: parseStock(product.stock),
      price:
        typeof product.price === "number"
          ? product.price
          : product.price
            ? parseFloat(product.price)
            : 0,
      category: product.category || "General",
    };
  };

  const normalizeProducts = (items) =>
    Array.isArray(items) ? items.map(normalizeProduct) : [];

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setProducts(normalizeProducts(data));
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
      setProducts(normalizeProducts(data));
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

  const saveCartItems = async (items) => {
    setError(null);
    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return items;
  };

  const updateProductInDb = async (product, updates) => {
    const productId = product.id || product.productId || product.product_id;
    if (!productId) throw new Error("Missing product identifier");

    const payload = {
      ...product,
      ...updates,
      name: product.name,
      price: parseFloat(product.price || 0),
      category: product.category || "General",
    };

    if (typeof payload.stock !== "undefined") {
      payload.stock =
        payload.stock === null ? null : parseInt(payload.stock, 10);
    }

    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return normalizeProduct(payload);
  };

  const addToCart = async (product) => {
    const productId = product.id || product.productId || product.product_id;
    if (!productId) {
      setError("Unable to add item to cart: missing product identifier.");
      return;
    }

    const stock = parseStock(product.stock);
    if (stock !== null && stock <= 0) {
      setError("Cannot add to cart: product is out of stock.");
      return;
    }

    setCartStatus((prev) => ({ ...prev, [productId]: "adding" }));
    try {
      const currentCartResponse = await fetch(`${API_BASE}/cart`);
      if (!currentCartResponse.ok)
        throw new Error(`HTTP ${currentCartResponse.status}`);
      const currentCart = await currentCartResponse.json();
      const items = Array.isArray(currentCart?.items) ? currentCart.items : [];
      const existing = items.find((i) => i.productId === productId);
      const updatedItems = existing
        ? items.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
          )
        : [
            ...items,
            {
              productId,
              name: product.name,
              price: product.price,
              quantity: 1,
            },
          ];

      await saveCartItems(updatedItems);
      const updatedProduct =
        stock !== null
          ? await updateProductInDb(product, { stock: stock - 1 })
          : product;
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productId || item.product_id === productId
            ? updatedProduct
            : item,
        ),
      );
      setCart(updatedItems);
      setCartStatus((prev) => ({ ...prev, [productId]: "added" }));
      setTimeout(
        () => setCartStatus((prev) => ({ ...prev, [productId]: null })),
        1500,
      );
    } catch (err) {
      setCartStatus((prev) => ({ ...prev, [productId]: "error" }));
      setError(`Failed to add to cart: ${err.message}`);
    }
  };

  const updateCartQuantity = async (productId, delta) => {
    setCartUpdating(true);
    try {
      const product = products.find(
        (item) => item.id === productId || item.product_id === productId,
      );
      const stockValue = parseStock(product?.stock);
      if (delta > 0 && stockValue !== null && stockValue <= 0) {
        throw new Error("Cannot increase quantity: product is out of stock.");
      }

      const updatedItems = cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0);

      const savedItems = await saveCartItems(updatedItems);

      if (product && stockValue !== null) {
        const newStock = stockValue - delta;
        await updateProductInDb(product, { stock: newStock });
        setProducts((prev) =>
          prev.map((item) =>
            item.id === productId || item.product_id === productId
              ? { ...item, stock: newStock }
              : item,
          ),
        );
      }

      setCart(savedItems);
    } catch (err) {
      setError(`Failed to update cart: ${err.message}`);
    } finally {
      setCartUpdating(false);
    }
  };

  const removeCartItem = async (productId) => {
    setCartUpdating(true);
    try {
      const removedItem = cart.find((item) => item.productId === productId);
      const updatedItems = cart.filter((item) => item.productId !== productId);
      const savedItems = await saveCartItems(updatedItems);

      if (removedItem) {
        const product = products.find(
          (item) => item.id === productId || item.product_id === productId,
        );
        const stockValue = parseStock(product?.stock);
        if (stockValue !== null) {
          const newStock = stockValue + removedItem.quantity;
          await updateProductInDb(product, { stock: newStock });
          setProducts((prev) =>
            prev.map((item) =>
              item.id === productId || item.product_id === productId
                ? { ...item, stock: newStock }
                : item,
            ),
          );
        }
      }

      setCart(savedItems);
    } catch (err) {
      setError(`Failed to remove item from cart: ${err.message}`);
    } finally {
      setCartUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!cart.length) return;
    if (!window.confirm("Clear your cart and restore product stock?")) return;
    setCartUpdating(true);
    try {
      let updatedProducts = products;
      const productStockUpdates = cart.reduce((acc, item) => {
        const product = products.find(
          (p) => p.id === item.productId || p.product_id === item.productId,
        );
        if (product) {
          const stockValue = parseStock(product.stock);
          if (stockValue !== null) {
            acc[product.id || product.productId || product.product_id] =
              stockValue + item.quantity;
          }
        }
        return acc;
      }, {});

      await saveCartItems([]);
      setCart([]);

      updatedProducts = updatedProducts.map((product) => {
        const productId = product.id || product.productId || product.product_id;
        if (productStockUpdates[productId] !== undefined) {
          return { ...product, stock: productStockUpdates[productId] };
        }
        return product;
      });

      setProducts(updatedProducts);

      for (const [productId, newStock] of Object.entries(productStockUpdates)) {
        const product = products.find(
          (p) => p.id === productId || p.product_id === productId,
        );
        if (product) {
          await updateProductInDb(product, { stock: newStock });
        }
      }
    } catch (err) {
      setError(`Failed to clear cart: ${err.message}`);
    } finally {
      setCartUpdating(false);
    }
  };

  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setAddingProduct(true);
    setError(null);
    try {
      const url = editingId
        ? `${API_BASE}/products/${editingId}`
        : `${API_BASE}/products`;
      const method = editingId ? "PUT" : "POST";
      const payload = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category || "General",
      };
      if (newProduct.stock !== "") {
        payload.stock = parseInt(newProduct.stock, 10);
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewProduct({ name: "", price: "", category: "General", stock: "" });
      setEditingId(null);
      await fetchProducts();
    } catch (err) {
      setError(`Failed to save product: ${err.message}`);
    } finally {
      setAddingProduct(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchProducts();
    } catch (err) {
      setError(`Failed to delete product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    const productId = product.id || product.productId || product.product_id;
    setNewProduct({
      name: product.name,
      price:
        typeof product.price === "number"
          ? product.price.toString()
          : product.price,
      category: product.category || "General",
      stock:
        typeof product.stock === "number"
          ? product.stock.toString()
          : product.stock || "",
    });
    setEditingId(productId);
    setActiveTab("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setNewProduct({ name: "", price: "", category: "General", stock: "" });
    setEditingId(null);
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
          <span
            style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#86868b",
              fontWeight: 600,
            }}
          >
            Store Framework
          </span>
          <h1 style={theme.header.title}>IDP Serverless Store</h1>
          <p style={theme.header.subtitle}>
            A modern, serverless microservices architecture with an intuitive
            aesthetic layout.
          </p>

          <div style={theme.header.tabsContainer}>
            {["products", "cart", "admin"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== "admin") cancelEdit();
                }}
                style={
                  activeTab === tab
                    ? theme.button.pillActive
                    : theme.button.pillInactive
                }
              >
                {tab === "products"
                  ? "Storefront"
                  : tab === "cart"
                    ? "Shopping Cart"
                    : "Admin Panel"}
              </button>
            ))}
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gap: "1.5rem",
            marginBottom: "2rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div style={theme.section.card}>
            <p style={theme.section.title}>Product inventory</p>
            <p style={theme.section.description}>
              {products.length} items available currently.
            </p>
          </div>
          <div style={theme.section.card}>
            <p style={theme.section.title}>Active cart</p>
            <p style={theme.section.description}>
              {cartQuantity} items • {formatCurrency(cartTotal)} total
            </p>
          </div>
        </section>

        {error && (
          <div
            style={{
              background: "#fff0f0",
              border: "1px solid #ffdcd5",
              borderRadius: "14px",
              padding: "1rem 1.5rem",
              marginBottom: "2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#ff3b30",
              fontWeight: 500,
            }}
          >
            <span>Warning: {error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                color: "#ff3b30",
                cursor: "pointer",
                fontSize: "1.5rem",
                padding: "0",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === "products" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchProducts()}
                placeholder="Search for products..."
                style={theme.input.base}
              />
              <button
                onClick={searchProducts}
                style={{ ...theme.button.primary, minWidth: "120px" }}
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
                  padding: "4rem",
                  color: "#86868b",
                }}
              >
                Loading store inventory...
              </div>
            )}
            {!loading && products.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem",
                  color: "#86868b",
                }}
              >
                No products found. Start by adding items in the Admin Panel.
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {products.map((p) => {
                const productId = p.id || p.productId || p.product_id;
                return (
                  <div
                    key={productId}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e5ea",
                      borderRadius: "18px",
                      padding: "2rem",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 32px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 12px rgba(0,0,0,0.03)";
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 0.5rem",
                        fontSize: "1.3rem",
                        color: "#1d1d1f",
                        fontWeight: 600,
                      }}
                    >
                      {p.name || "Unnamed Product"}
                    </h3>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <span
                        style={{
                          background: "#eef3ff",
                          color: "#0f4fff",
                          borderRadius: "999px",
                          padding: "0.35rem 0.8rem",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        {p.category || "General"}
                      </span>
                    </div>
                    <div
                      style={{
                        margin: "0 0 0.5rem",
                        fontSize: "0.95rem",
                        color: "#86868b",
                        marginBottom: "1rem",
                      }}
                    >
                      {typeof p.stock === "number" && p.stock >= 0
                        ? `${p.stock} in stock`
                        : "Stock unavailable"}
                    </div>
                    <div
                      style={{
                        margin: "0 0 1.5rem",
                        fontSize: "1.8rem",
                        fontWeight: 700,
                        color: "#1d1d1f",
                      }}
                    >
                      {formatCurrency(p.price)}
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={
                        cartStatus[productId] === "adding" ||
                        (typeof p.stock === "number" && p.stock <= 0)
                      }
                      style={{
                        width: "100%",
                        padding: "0.9rem",
                        borderRadius: "999px",
                        border: "none",
                        cursor:
                          cartStatus[productId] === "adding" ||
                          (typeof p.stock === "number" && p.stock <= 0)
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        color:
                          cartStatus[productId] === "added"
                            ? "#1d1d1f"
                            : "#fff",
                        background:
                          cartStatus[productId] === "added"
                            ? "#e8e8ed"
                            : cartStatus[productId] === "error"
                              ? "#ff3b30"
                              : typeof p.stock === "number" && p.stock <= 0
                                ? "#d0d3d8"
                                : "#0071e3",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {typeof p.stock === "number" && p.stock <= 0
                        ? "Out of stock"
                        : cartStatus[productId] === "adding"
                          ? "Processing…"
                          : cartStatus[productId] === "added"
                            ? "Added to Cart"
                            : cartStatus[productId] === "error"
                              ? "Error! Try Again"
                              : "Buy Now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- CART TAB --- */}
        {activeTab === "cart" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
              }}
            >
              <div>
                <h2 style={theme.section.title}>Your Bag</h2>
                <p style={theme.section.description}>{cartQuantity} items</p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={fetchCart} style={theme.button.secondary}>
                  Refresh Bag
                </button>
                <button onClick={clearCart} style={theme.button.secondary}>
                  Clear Cart
                </button>
              </div>
            </div>

            {loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem",
                  color: "#86868b",
                }}
              >
                Loading bag contents...
              </div>
            )}
            {!loading && cart.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem",
                  color: "#86868b",
                }}
              >
                Your bag is empty.
              </div>
            )}

            <div
              style={{
                background: "#fff",
                borderRadius: "18px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}
            >
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "1.5rem 2rem",
                    borderBottom:
                      idx !== cart.length - 1 ? "1px solid #f5f5f7" : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#1d1d1f",
                        fontSize: "1.1rem",
                      }}
                    >
                      {item.name || item.productId}
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          background: "#eef3ff",
                          color: "#0f4fff",
                          borderRadius: "999px",
                          padding: "0.35rem 0.8rem",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        {products.find(
                          (p) =>
                            p.id === item.productId ||
                            p.productId === item.productId ||
                            p.product_id === item.productId,
                        )?.category || "General"}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <button
                        onClick={() => updateCartQuantity(item.productId, -1)}
                        disabled={cartUpdating || item.quantity <= 1}
                        style={{
                          ...theme.button.secondary,
                          minWidth: "42px",
                          padding: "0.5rem 0.75rem",
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          minWidth: "28px",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, 1)}
                        disabled={cartUpdating}
                        style={{
                          ...theme.button.secondary,
                          minWidth: "42px",
                          padding: "0.5rem 0.75rem",
                        }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeCartItem(item.productId)}
                        disabled={cartUpdating}
                        style={{
                          ...theme.button.secondary,
                          background: "#fff4e5",
                          color: "#b35c00",
                          border: "1px solid #f5d7a2",
                          padding: "0.5rem 0.9rem",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#1d1d1f",
                      fontSize: "1.2rem",
                      minWidth: "120px",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(
                      parseFloat(item.price || 0) * item.quantity,
                    )}
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div
                style={{
                  textAlign: "right",
                  marginTop: "2rem",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "#1d1d1f",
                }}
              >
                Total: {formatCurrency(cartTotal)}
              </div>
            )}
          </div>
        )}

        {/* --- ADMIN TAB --- */}
        {activeTab === "admin" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={theme.section.title}>Product Administration</h2>
              <button onClick={cancelEdit} style={theme.button.secondary}>
                Reset Editor
              </button>
            </div>

            <div style={{ ...theme.section.card, marginBottom: "2rem" }}>
              <h3
                style={{
                  margin: "0 0 1.5rem",
                  color: "#1d1d1f",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                }}
              >
                {editingId ? "Edit Existing Product" : "Publish New Product"}
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "0.9rem",
                      color: "#86868b",
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Product Name
                  </label>
                  <input
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. AirPods Pro"
                    style={theme.input.base}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.9rem",
                      color: "#86868b",
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Price (₹)
                  </label>
                  <input
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, price: e.target.value }))
                    }
                    type="number"
                    placeholder="e.g. 249.00"
                    style={theme.input.base}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.9rem",
                      color: "#86868b",
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, category: e.target.value }))
                    }
                    style={theme.input.base}
                  >
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.9rem",
                      color: "#86868b",
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Stock Quantity
                  </label>
                  <input
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, stock: e.target.value }))
                    }
                    type="number"
                    placeholder="e.g. 50"
                    style={theme.input.base}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={saveProduct}
                  disabled={
                    addingProduct || !newProduct.name || !newProduct.price
                  }
                  style={{
                    ...theme.button.primary,
                    flex: 1,
                    opacity: !newProduct.name || !newProduct.price ? 0.5 : 1,
                    cursor:
                      !newProduct.name || !newProduct.price
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingProduct
                    ? "Processing…"
                    : editingId
                      ? "Save Changes"
                      : "Save Product"}
                </button>
                {editingId && (
                  <button
                    onClick={cancelEdit}
                    style={{ ...theme.button.secondary, flex: 1 }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div style={{ ...theme.section.card }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1d1d1f",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                  }}
                >
                  Catalog Database
                </h3>
                <button
                  onClick={fetchProducts}
                  style={{
                    ...theme.button.secondary,
                    padding: "0.5rem 1rem",
                    fontSize: "0.85rem",
                  }}
                >
                  Refresh Items
                </button>
              </div>

              {loading && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#86868b",
                    padding: "2rem",
                  }}
                >
                  Synchronizing backend...
                </p>
              )}
              {!loading && products.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#86868b",
                    padding: "2rem",
                  }}
                >
                  Database is currently empty.
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                }}
              >
                {products.map((p) => {
                  const productId = p.id || p.productId || p.product_id;
                  return (
                    <div
                      key={productId}
                      style={{
                        background:
                          editingId === productId ? "#f5f5f7" : "#ffffff",
                        border:
                          editingId === productId
                            ? "1px solid #0071e3"
                            : "1px solid #e5e5ea",
                        borderRadius: "14px",
                        padding: "1.2rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#1d1d1f",
                            fontSize: "1.05rem",
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            color: "#86868b",
                            fontSize: "0.9rem",
                            marginTop: "0.3rem",
                          }}
                        >
                          SKU: {productId?.substring(0, 8)} •{" "}
                          <span style={{ fontWeight: 600, color: "#1d1d1f" }}>
                            {formatCurrency(p.price)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => startEdit(p)}
                          style={{
                            ...theme.button.secondary,
                            background:
                              editingId === productId ? "#0071e3" : "#e8e8ed",
                            color: editingId === productId ? "#fff" : "#1d1d1f",
                            padding: "0.5rem 1rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          {editingId === productId ? "Editing" : "Edit"}
                        </button>
                        <button
                          onClick={() => deleteProduct(productId)}
                          style={{
                            ...theme.button.secondary,
                            padding: "0.5rem 1rem",
                            fontSize: "0.85rem",
                            background: "#fef0f0",
                            color: "#ff3b30",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
