import React from "react";
import { PRODUCT_CATEGORIES, formatCurrency } from "../utils/theme";

function AdminConsole({
  newProduct,
  setNewProduct,
  editingId,
  cancelEdit,
  saveProduct,
  addingProduct,
  products,
  loading,
  startEdit,
  deleteProduct,
  fetchProducts,
  darkMode,
  theme,
}) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={theme.section.title}>Ministry Catalog Console</h2>
        <button onClick={cancelEdit} style={theme.button.secondary}>
          Reset Editor
        </button>
      </div>

      <div style={{ ...theme.section.card, marginBottom: "2rem" }}>
        <h3
          style={{
            margin: "0 0 1.5rem",
            color: theme.page.color,
            fontSize: "1.5rem",
            fontWeight: 600,
            fontFamily: "'Cinzel', serif",
          }}
        >
          {editingId ? "Rewrite Artifact Data" : "Publish New Artifact"}
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
              color: theme.page.color,
              fontSize: "1.5rem",
              fontWeight: 600,
              fontFamily: "'Cinzel', serif",
            }}
          >
            Arcane Database
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
                    editingId === productId ? (darkMode ? "rgba(0,113,227,0.1)" : "#f5f5f7") : theme.section.card.background,
                  border:
                    editingId === productId
                      ? "1px solid #0071e3"
                      : `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "#e5e5ea"}`,
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
                      color: theme.page.color,
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
                    <span style={{ fontWeight: 600, color: theme.page.color }}>
                      {formatCurrency(p.price)}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => startEdit(p)}
                    disabled={!p.userId || p.userId === "anonymous"}
                    style={{
                      ...theme.button.secondary,
                      background:
                        editingId === productId
                          ? "#0071e3"
                          : (!p.userId || p.userId === "anonymous")
                            ? (darkMode ? "rgba(255,255,255,0.03)" : "#f5f5f7")
                            : theme.button.secondary.background,
                      color:
                        editingId === productId
                          ? "#fff"
                          : (!p.userId || p.userId === "anonymous")
                            ? (darkMode ? "rgba(255,255,255,0.25)" : "#a1a1a6")
                            : theme.button.secondary.color,
                      borderColor: (!p.userId || p.userId === "anonymous") ? (darkMode ? "rgba(255,255,255,0.05)" : "#d2d2d7") : undefined,
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      cursor: (!p.userId || p.userId === "anonymous") ? "not-allowed" : "pointer",
                      opacity: (!p.userId || p.userId === "anonymous") ? 0.6 : 1,
                    }}
                  >
                    {editingId === productId ? "Editing" : "Edit"}
                  </button>
                  <button
                    onClick={() => deleteProduct(productId)}
                    disabled={!p.userId || p.userId === "anonymous"}
                    style={{
                      ...theme.button.secondary,
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      background:
                        (!p.userId || p.userId === "anonymous")
                          ? (darkMode ? "rgba(255,255,255,0.03)" : "#f5f5f7")
                          : (darkMode ? "rgba(255, 59, 48, 0.1)" : "#fef0f0"),
                      color:
                        (!p.userId || p.userId === "anonymous")
                          ? (darkMode ? "rgba(255,255,255,0.25)" : "#a1a1a6")
                          : "#ff3b30",
                      borderColor: (!p.userId || p.userId === "anonymous") ? (darkMode ? "rgba(255,255,255,0.05)" : "#d2d2d7") : undefined,
                      cursor: (!p.userId || p.userId === "anonymous") ? "not-allowed" : "pointer",
                      opacity: (!p.userId || p.userId === "anonymous") ? 0.6 : 1,
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
  );
}

export default AdminConsole;
