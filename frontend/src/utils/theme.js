export const API_BASE =
  "https://tymn5ur022.execute-api.ap-southeast-1.amazonaws.com/prod/api";

export const PRODUCT_CATEGORIES = [
  "General",
  "Electronics",
  "Accessories",
  "Home",
  "Office",
];

export const getTheme = (darkMode) => {
  const gold = "#C5A028";
  const crimson = "#B01B1B";
  const parchment = "#FDFBF7";
  const midnight = "#111114";
  const darkCard = "#1c1c1e";

  // Magical Wand Cursors as Data URIs (Hotspot at 4,4 for the tip - right-handed)
  const wandLight = `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 28L4 4' stroke='%234a2c2a' stroke-width='3' stroke-linecap='round'/%3E%3Ccircle cx='4' cy='4' r='2' fill='%23FFD700'/%3E%3C/svg%3E") 4 4, auto`;
  const wandDark = `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 28L4 4' stroke='%23e5e5ea' stroke-width='3' stroke-linecap='round'/%3E%3Ccircle cx='4' cy='4' r='2' fill='%2364d2ff'/%3E%3C/svg%3E") 4 4, auto`;

  return {
    page: {
      fontFamily: "'Spectral', serif",
      margin: 0,
      padding: 0,
      minHeight: "100vh",
      backgroundColor: darkMode ? midnight : parchment,
      color: darkMode ? "#f5f5f7" : "#1A0A0A",
      WebkitFontSmoothing: "antialiased",
      transition: "background-color 0.3s ease, color 0.3s ease",
      cursor: darkMode ? wandDark : wandLight,
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
        fontFamily: "'Cinzel Decorative', cursive",
        margin: 0,
        fontSize: "3.5rem",
        fontWeight: 700,
        letterSpacing: "0.05em",
        color: gold,
        textShadow: darkMode ? "0 0 20px rgba(197, 160, 40, 0.3)" : "none",
      },
      subtitle: {
        fontFamily: "'Spectral', serif",
        margin: "0.5rem 0 0",
        fontSize: "1.2rem",
        fontStyle: "italic",
        fontWeight: 400,
        color: darkMode ? "#98989d" : "#5d5d61",
        maxWidth: "600px",
      },
      tabsContainer: {
        display: "flex",
        background: darkMode ? "#2c2c2e" : "#e3e3e8",
        borderRadius: "999px",
        padding: "0.25rem",
        gap: "0.25rem",
      },
    },
    section: {
      card: {
        background: darkMode ? darkCard : "#ffffff",
        borderRadius: "18px",
        padding: "2rem",
        boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(197, 160, 40, 0.08)",
        border: darkMode ? "1px solid rgba(197, 160, 40, 0.1)" : "1px solid rgba(197, 160, 40, 0.1)",
        color: darkMode ? "#f5f5f7" : "#1A0A0A",
      },
      title: {
        fontFamily: "'Cinzel', serif",
        margin: 0,
        fontSize: "1.5rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: darkMode ? gold : "#1A0A0A",
      },
      description: {
        margin: "0.5rem 0 0",
        color: darkMode ? "#98989d" : "#5d5d61",
        fontSize: "1rem",
      },
    },
    button: {
      primary: {
        padding: "0.8rem 1.5rem",
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.95rem",
        background: gold,
        color: "#000000",
        transition: "all 0.2s ease",
        fontFamily: "'Cinzel', serif",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      },
      secondary: {
        padding: "0.8rem 1.5rem",
        borderRadius: "999px",
        border: `1px solid ${gold}`,
        background: "transparent",
        color: darkMode ? gold : "#1A0A0A",
        cursor: "pointer",
        fontWeight: 500,
        fontSize: "0.95rem",
        transition: "all 0.2s ease",
        fontFamily: "'Spectral', serif",
      },
      pillActive: {
        padding: "0.6rem 1.25rem",
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.95rem",
        background: gold,
        color: "#000000",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
        fontFamily: "'Cinzel', serif",
      },
      pillInactive: {
        padding: "0.6rem 1.25rem",
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        fontWeight: 500,
        fontSize: "0.95rem",
        background: "transparent",
        color: darkMode ? "#98989d" : "#86868b",
        transition: "all 0.2s ease",
        fontFamily: "'Spectral', serif",
      },
    },
    input: {
      base: {
        width: "100%",
        padding: "1rem 1.25rem",
        borderRadius: "12px",
        border: darkMode ? "1px solid #48484a" : "1px solid #d2d2d7",
        background: darkMode ? "#3a3a3c" : "#ffffff",
        color: darkMode ? "#ffffff" : "#1A0A0A",
        fontSize: "1.05rem",
        outline: "none",
        transition: "all 0.2s ease",
        boxSizing: "border-box",
        fontFamily: "'Spectral', serif",
      },
    },
    textMuted: {
      color: darkMode ? "#98989d" : "#5d5d61",
    },
    error: {
      text: crimson,
      background: darkMode ? "rgba(176, 27, 27, 0.1)" : "#fff0f0",
    },
    text: {
      primary: darkMode ? gold : "#1A0A0A",
      secondary: darkMode ? "#98989d" : "#5d5d61",
    },
    shadow: {
      base: darkMode ? "0 4px 12px rgba(0,0,0,0.4)" : "0 4px 12px rgba(197, 160, 40, 0.05)",
      hover: darkMode ? "0 12px 32px rgba(0,0,0,0.5)" : "0 12px 32px rgba(197, 160, 40, 0.15)",
    },
    gold: gold,
    crimson: crimson,
  };
};

export const parseStock = (stockValue) => {
  if (typeof stockValue === "number") return stockValue;
  if (typeof stockValue === "string" && stockValue.trim() !== "") {
    const parsed = parseInt(stockValue, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `₹${amount.toFixed(2)}`;
};

export const normalizeProduct = (product) => {
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

export const normalizeProducts = (items) =>
  Array.isArray(items) ? items.map(normalizeProduct) : [];
