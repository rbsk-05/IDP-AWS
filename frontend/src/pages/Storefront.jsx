import React from "react";
import { PRODUCT_CATEGORIES, formatCurrency } from "../utils/theme";

function Storefront({
  products,
  loading,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  sortOption,
  setSortOption,
  fetchProducts,
  addToCart,
  cartStatus,
  darkMode,
  theme,
}) {
  return (
    <div>
      {/* Magical Search & Filter Cabinet */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            position: "relative",
            marginBottom: "1.2rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Revelio Eye Icon */}
          <div
            style={{
              position: "absolute",
              left: "1.25rem",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke={theme.gold}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Seek magical artifacts..."
            style={{
              ...theme.input.base,
              paddingLeft: "3.5rem",
              boxShadow: darkMode
                ? "0 4px 20px rgba(0,0,0,0.3)"
                : "0 4px 20px rgba(197, 160, 40, 0.05)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: theme.text.secondary, fontFamily: "'spectral', serif" }}>
              Filter by:
            </span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                ...theme.input.base,
                width: "auto",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                borderRadius: "999px",
                border: `1px solid ${theme.gold}44`,
              }}
            >
              <option value="All">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: theme.text.secondary, fontFamily: "'spectral', serif" }}>
              Sort by:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                ...theme.input.base,
                width: "auto",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                borderRadius: "999px",
                border: `1px solid ${theme.gold}44`,
              }}
            >
              <option value="default">Default Order</option>
              <option value="priceLow">Galleons: Low to High</option>
              <option value="priceHigh">Galleons: High to Low</option>
            </select>
            <button onClick={fetchProducts} style={{ ...theme.button.secondary, padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              Refresh Items
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            color: theme.text.secondary,
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
            color: theme.text.secondary,
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
        {products
          .filter((p) => filterCategory === "All" || p.category === filterCategory)
          .sort((a, b) => {
            if (sortOption === "priceLow") return a.price - b.price;
            if (sortOption === "priceHigh") return b.price - a.price;
            return 0;
          })
          .map((p) => {
            const productId = p.id || p.productId || p.product_id;
            return (
              <div
                key={productId}
                style={{
                  ...theme.section.card,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = theme.shadow.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = theme.shadow.base;
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "0",
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.5rem",
                      color: theme.page.color,
                      fontWeight: 600,
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    {p.name || "Unnamed Artifact"}
                  </h3>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      margin: "0.5rem 0 1rem",
                    }}
                  >
                    <span
                      style={{
                        background: darkMode ? "#3a3a3c" : "#eef3ff",
                        color: darkMode ? "#64d2ff" : "#0f4fff",
                        borderRadius: "999px",
                        padding: "0.35rem 0.8rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {p.category || "General"}
                    </span>
                  </div>
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
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "0",
                  }}
                >
                  <div
                    style={{
                      margin: "0 0 1.5rem",
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: theme.page.color,
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
                      cursor:
                        cartStatus[productId] === "adding" ||
                        (typeof p.stock === "number" && p.stock <= 0)
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: 500,
                      color:
                        cartStatus[productId] === "added"
                          ? (darkMode ? theme.gold : "#000000")
                          : "#000000",
                      background:
                        cartStatus[productId] === "added"
                          ? (darkMode ? "rgba(197, 160, 40, 0.1)" : "#e8e8ed")
                          : cartStatus[productId] === "error"
                            ? theme.crimson
                            : typeof p.stock === "number" && p.stock <= 0
                              ? (darkMode ? "rgba(176, 27, 27, 0.2)" : "#f8d7da")
                              : theme.gold,
                      transition: "all 0.2s ease",
                      border: typeof p.stock === "number" && p.stock <= 0
                        ? `1px solid ${theme.crimson}`
                        : "none",
                    }}
                  >
                    {typeof p.stock === "number" && p.stock <= 0
                      ? "Out of Stock"
                      : cartStatus[productId] === "adding"
                        ? "Casting…"
                        : cartStatus[productId] === "added"
                          ? "In Trunk"
                          : cartStatus[productId] === "error"
                            ? "Fizzy! Try Again"
                            : "Acquire Artifact"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Storefront;
