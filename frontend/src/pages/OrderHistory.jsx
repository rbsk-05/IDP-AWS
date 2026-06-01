import React from "react";
import { formatCurrency } from "../utils/theme";

function OrderHistory({ orders, loading, fetchOrders, darkMode, theme }) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ ...theme.section.title, marginBottom: "2rem", textAlign: "center" }}>Past Scrolls of Purchase</h2>
      
      {loading && <p style={{ textAlign: "center", fontStyle: "italic", opacity: 0.6 }}>Consulting the Ministry archives...</p>}
      
      {!loading && orders.length === 0 && (
        <div style={{ ...theme.section.card, textAlign: "center", padding: "4rem" }}>
          <p style={{ fontSize: "1.2rem", opacity: 0.6 }}>No magical records found. Perhaps a memory charm was used?</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {orders.map((order) => (
          <div 
            key={order.orderId} 
            style={{ 
              ...theme.section.card, 
              borderLeft: `5px solid ${theme.gold}`,
              background: darkMode ? "rgba(212, 175, 55, 0.03)" : "#fffcf8"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(197, 160, 40, 0.1)", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <div>
                <span style={{ color: theme.gold, fontWeight: 700, fontSize: "1.1rem" }}>{order.orderId}</span>
                <div style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "0.2rem" }}>
                  Placed on {new Date(order.timestamp * 1000).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontWeight: 700, fontSize: "1.2rem", color: theme.gold }}>{formatCurrency(order.total)}</span>
                <div style={{ fontSize: "0.7rem", color: "#2ecc71", textTransform: "uppercase", fontWeight: 800 }}>{order.status}</div>
              </div>
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {order.items.map((item, idx) => (
                <span key={idx} style={{ 
                  background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", 
                  padding: "0.3rem 0.8rem", 
                  borderRadius: "8px", 
                  fontSize: "0.85rem" 
                }}>
                  {item.quantity}x {item.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={fetchOrders} 
        style={{ ...theme.button.secondary, width: "100%", marginTop: "2rem" }}
      >
        Refresh Archives
      </button>
    </div>
  );
}

export default OrderHistory;
