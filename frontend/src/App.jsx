import React, { useState, useEffect } from "react";
import TestDashboard from "./test/TestDashboard";
import {
  API_BASE,
  getTheme,
  normalizeProducts,
  normalizeProduct,
  parseStock,
} from "./utils/theme";
import Header from "./components/Header";
import SparksEffect from "./components/SparksEffect";
import Storefront from "./pages/Storefront";
import WizardingTrunk from "./pages/WizardingTrunk";
import OrderHistory from "./pages/OrderHistory";
import AdminConsole from "./pages/AdminConsole";
import EasterEgg from "./pages/EasterEgg";

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
  const [orders, setOrders] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [sparks, setSparks] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  const [easterProducts, setEasterProducts] = useState([]);

  // Dynamic Search Logic (300ms Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Avoid initial fetch if query is empty and we have products,
      // but typically we want fresh results if query changes.
      if (activeTab === "products") {
        searchProducts();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      const newSparks = Array.from({ length: 6 }).map((_, i) => ({
        id: `${Date.now()}-${i}`,
        x: e.clientX,
        y: e.clientY,
        angle: (Math.PI * 2 * i) / 6 + (Math.random() * 0.5),
        velocity: 2 + Math.random() * 3,
        size: 2 + Math.random() * 3,
      }));
      setSparks((prev) => [...prev, ...newSparks]);
      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => !newSparks.includes(s)));
      }, 600);
    };

    window.addEventListener("mousedown", handleGlobalClick);
    return () => window.removeEventListener("mousedown", handleGlobalClick);
  }, []);

  useEffect(() => {
    if (activeTab === "easteregg") {
      fetchEasterproducts();
    }
  }, [activeTab]);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem("darkMode", nextMode.toString());
  };

  const theme = getTheme(darkMode);

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

  const fetchEasterproducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/easter`);
      const data = await res.json();

      setEasterProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
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

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Failed to fetch history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total: cartTotal }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Success! Clear cart locally and in DB
      await saveCartItems([]);
      setCart([]);

      // Switch to history tab to show the new order
      setActiveTab("history");
      await fetchOrders();

      // Magical Success Feedback
      alert("✨ Order Placed Successfully! Your items are flying your way via Owl Post.");
    } catch (err) {
      setError(`Failed to place order: ${err.message}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "cart") fetchCart();
    if (activeTab === "history") fetchOrders();
  }, [activeTab]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0,
  );
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={theme.page}>
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }
          button, a, input, select, textarea, [role="button"] {
            cursor: inherit !important;
          }
          @keyframes spark-ping {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
          }
          .magic-spark {
            position: fixed;
            pointer-events: none;
            border-radius: 50%;
            z-index: 9999;
            animation: spark-ping 0.6s ease-out forwards;
          }
        `}
      </style>

      <SparksEffect sparks={sparks} darkMode={darkMode} />

      <div style={theme.frame}>
        {activeTab !== "easteregg" && (
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            cancelEdit={cancelEdit}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            theme={theme}
          />
        )}

        {activeTab !== "easteregg" && error && (
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
                color: theme.error.text,
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
          <Storefront
            products={products}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortOption={sortOption}
            setSortOption={setSortOption}
            fetchProducts={fetchProducts}
            addToCart={addToCart}
            cartStatus={cartStatus}
            darkMode={darkMode}
            theme={theme}
          />
        )}

        {/* --- CART TAB --- */}
        {activeTab === "cart" && (
          <WizardingTrunk
            cart={cart}
            loading={loading}
            cartQuantity={cartQuantity}
            fetchCart={fetchCart}
            clearCart={clearCart}
            updateCartQuantity={updateCartQuantity}
            cartUpdating={cartUpdating}
            removeCartItem={removeCartItem}
            products={products}
            cartTotal={cartTotal}
            placeOrder={placeOrder}
            placingOrder={placingOrder}
            darkMode={darkMode}
            theme={theme}
          />
        )}

        {/* --- ORDER HISTORY TAB --- */}
        {activeTab === "history" && (
          <OrderHistory
            orders={orders}
            loading={loading}
            fetchOrders={fetchOrders}
            darkMode={darkMode}
            theme={theme}
          />
        )}

        {/* --- ADMIN TAB --- */}
        {activeTab === "admin" && (
          <AdminConsole
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            editingId={editingId}
            cancelEdit={cancelEdit}
            saveProduct={saveProduct}
            addingProduct={addingProduct}
            products={products}
            loading={loading}
            startEdit={startEdit}
            deleteProduct={deleteProduct}
            fetchProducts={fetchProducts}
            darkMode={darkMode}
            theme={theme}
          />
        )}

        {/* --- TESTING TAB --- */}
        {activeTab === "testing" && (
          <TestDashboard darkMode={darkMode} />
        )}

        {/*EASTER EGG TAB*/}
        {activeTab === "easteregg" && (
          <EasterEgg
            setActiveTab={setActiveTab}
            easterProducts={easterProducts}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}

export default App;
