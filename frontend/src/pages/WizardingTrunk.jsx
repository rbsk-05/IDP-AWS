import React from "react";
import { formatCurrency } from "../utils/theme";

function WizardingTrunk({
  cart,
  loading,
  cartQuantity,
  fetchCart,
  clearCart,
  updateCartQuantity,
  cartUpdating,
  removeCartItem,
  products,
  cartTotal,
  placeOrder,
  placingOrder,
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
          marginBottom: "2rem",
        }}
      >
        <div>
          <h2 style={theme.section.title}>Wizarding Trunk</h2>
          <p style={theme.section.description}>{cartQuantity} artifacts</p>
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
          ...theme.section.card,
          padding: 0,
          overflow: "hidden",
        }}
      >
        {cart.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: "1.5rem 2rem",
              borderBottom:
                idx !== cart.length - 1 ? `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "#f5f5f7"}` : "none",
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
                  color: theme.page.color,
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
                    background: darkMode ? "#3a3a3c" : "#eef3ff",
                    color: darkMode ? "#64d2ff" : "#0f4fff",
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
                    background: darkMode ? "rgba(255, 149, 0, 0.1)" : "#fff4e5",
                    color: darkMode ? "#ff9500" : "#b35c00",
                    border: darkMode ? "1px solid rgba(255, 149, 0, 0.2)" : "1px solid #f5d7a2",
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
                color: theme.page.color,
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
            padding: "1.5rem",
            background: darkMode ? "rgba(197, 160, 40, 0.05)" : "#fdfbf7",
            borderRadius: "14px",
            border: `1px solid ${theme.gold}44`
          }}
        >
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: theme.page.color, marginBottom: "1.5rem" }}>
            Galleons Total: {formatCurrency(cartTotal)}
          </div>
          <button
            onClick={placeOrder}
            disabled={placingOrder}
            style={{
              ...theme.button.primary,
              padding: "0.7rem 1.8rem",
              fontSize: "1rem",
              letterSpacing: "0.5px",
              boxShadow: "0 6px 15px rgba(197, 160, 40, 0.25)"
            }}
          >
            {placingOrder ? "Casting Order..." : "Finalize Purchase (Place Order)"}
          </button>
        </div>
      )}
    </div>
  );
}

export default WizardingTrunk;
