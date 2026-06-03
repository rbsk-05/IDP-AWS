import React, { useState, useEffect } from "react";
import { PRODUCT_CATEGORIES, formatCurrency, API_BASE } from "../utils/theme";

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
  currentUser,
  getAuthHeaders,
}) {
  const [consoleTab, setConsoleTab] = useState("analytics"); // 'analytics' or 'editor'
  
  // PowerBI Embed state
  const [embedUrl, setEmbedUrl] = useState(() => {
    return localStorage.getItem("powerbi_embed_url") || "";
  });
  const [urlInput, setUrlInput] = useState(embedUrl);
  const [showSettings, setShowSettings] = useState(false);

  // Athena analytics state
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [isRotating, setIsRotating] = useState(false);

  // Mock dashboard interactivity state
  const [activeMockPage, setActiveMockPage] = useState("overview"); // 'overview', 'products', 'queries'
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [minOrderValue, setMinOrderValue] = useState(0);

  // Default mock data when Athena database is empty or seeding
  const demoDailyRevenue = [
    { date: "05/28", revenue: 4100 },
    { date: "05/29", revenue: 6200 },
    { date: "05/30", revenue: 3800 },
    { date: "05/31", revenue: 2900 },
    { date: "06/01", revenue: 5100 },
    { date: "06/02", revenue: 3200 },
    { date: "06/03", revenue: 4500 }
  ];

  const mockOrdersList = [
    { id: "ORD-9281", user: "hermione@hogwarts.edu", itemsCount: 3, total: 349.50, category: "Accessories", date: "2026-06-03" },
    { id: "ORD-9282", user: "ron@weasley.com", itemsCount: 1, total: 24.99, category: "General", date: "2026-06-03" },
    { id: "ORD-9283", user: "harry@potter.com", itemsCount: 2, total: 1150.00, category: "Electronics", date: "2026-06-02" },
    { id: "ORD-9284", user: "luna@lovegood.org", itemsCount: 5, total: 450.00, category: "Home", date: "2026-06-02" },
    { id: "ORD-9285", user: "neville@longbottom.edu", itemsCount: 1, total: 85.00, category: "Office", date: "2026-06-01" },
    { id: "ORD-9286", user: "draco@malfoy.corp", itemsCount: 4, total: 2800.00, category: "Accessories", date: "2026-06-01" },
    { id: "ORD-9287", user: "dumbledore@hogwarts.edu", itemsCount: 2, total: 120.00, category: "General", date: "2026-05-31" },
  ];

  const fetchAnalytics = async () => {
    if (!getAuthHeaders) return;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    setIsRotating(true);
    try {
      const res = await fetch(`${API_BASE}/analytics/revenue`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setAnalyticsData(data || []);
    } catch (err) {
      console.error("Failed to load Athena data:", err);
      setAnalyticsError(err.message);
    } finally {
      setAnalyticsLoading(false);
      setTimeout(() => setIsRotating(false), 800);
    }
  };

  useEffect(() => {
    if (consoleTab === "analytics") {
      fetchAnalytics();
    }
  }, [consoleTab]);

  const handleSaveUrl = (e) => {
    e.preventDefault();
    localStorage.setItem("powerbi_embed_url", urlInput);
    setEmbedUrl(urlInput);
    setShowSettings(false);
  };

  const handleClearUrl = () => {
    localStorage.removeItem("powerbi_embed_url");
    setEmbedUrl("");
    setUrlInput("");
    setShowSettings(false);
  };

  // Process data for charts
  const chartData = analyticsData.length > 0
    ? [...analyticsData].reverse().map(item => ({
        date: `${item.month}/${item.day}`,
        revenue: parseFloat(item.daily_revenue || 0)
      }))
    : demoDailyRevenue;

  // Filter mock orders list dynamically
  const filteredOrders = mockOrdersList.filter(o => {
    const matchesCategory = categoryFilter === "All" || o.category === categoryFilter;
    const matchesValue = o.total >= minOrderValue;
    return matchesCategory && matchesValue;
  });

  const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const averageBasket = totalOrders > 0 ? totalSales / totalOrders : 0;

  // SVG Chart Plotting Helpers
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);
  const pad = 35;
  const cWidth = 480;
  const cHeight = 150;
  const getX = (idx) => pad + (idx * (cWidth - 2 * pad)) / (chartData.length - 1);
  const getY = (val) => cHeight - pad - (val / maxRevenue) * (cHeight - 2 * pad);

  let linePath = "";
  let fillPath = "";
  if (chartData.length > 0) {
    linePath = `M ${getX(0)} ${getY(chartData[0].revenue)}`;
    for (let i = 1; i < chartData.length; i++) {
      linePath += ` L ${getX(i)} ${getY(chartData[i].revenue)}`;
    }
    fillPath = `${linePath} L ${getX(chartData.length - 1)} ${cHeight - pad} L ${getX(0)} ${cHeight - pad} Z`;
  }

  // Calculate simulated category shares
  const categoryCounts = filteredOrders.reduce((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + o.total;
    return acc;
  }, {});

  const totalShareSum = Object.values(categoryCounts).reduce((s, v) => s + v, 0) || 1;
  const categoryShares = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat],
    percentage: Math.round((categoryCounts[cat] / totalShareSum) * 100)
  })).sort((a, b) => b.value - a.value);

  const colorsMap = {
    Accessories: "#C5A028",
    General: "#B01B1B",
    Electronics: "#0071e3",
    Home: "#34c759",
    Office: "#af52de"
  };

  const renderMockDashboard = () => (
    <div
      style={{
        background: darkMode ? "#1c1c1e" : "#f5f5f7",
        borderRadius: "14px",
        overflow: "hidden",
        border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* PowerBI Top Navigation Panel */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.5rem 1rem",
          background: darkMode ? "#2c2c2e" : "#eaeaea",
          borderBottom: `1px solid ${darkMode ? "#3a3a3c" : "#d2d2d7"}`
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              background: "#F2C811",
              color: "#000",
              fontWeight: 800,
              fontSize: "0.75rem",
              padding: "0.2rem 0.5rem",
              borderRadius: "4px"
            }}
          >
            Power BI
          </div>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: darkMode ? "#fff" : "#333",
            }}
          >
            Ministry Sales & Analytics Report
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <button
            onClick={fetchAnalytics}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.75rem",
              color: darkMode ? "#98989d" : "#5d5d61",
              padding: "0.3rem 0.6rem",
              borderRadius: "4px",
              backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isRotating ? "rotate(360deg)" : "none",
                transition: isRotating ? "transform 0.8s ease-in-out" : "none"
              }}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh Data
          </button>
          <span style={{ fontSize: "0.75rem", color: darkMode ? "#636366" : "#aeaeb2" }}>|</span>
          <span style={{ fontSize: "0.75rem", color: darkMode ? "#98989d" : "#5d5d61" }}>
            Data Source: {analyticsData.length > 0 ? "Athena Data Lake" : "Simulated"}
          </span>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div style={{ display: "flex", minHeight: "360px" }}>
        {/* Left Navigation bar inside report */}
        <div
          style={{
            width: "120px",
            background: darkMode ? "#252528" : "#f1f1f1",
            borderRight: `1px solid ${darkMode ? "#3a3a3c" : "#d2d2d7"}`,
            padding: "1rem 0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
          }}
        >
          <button
            onClick={() => setActiveMockPage("overview")}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "none",
              background: activeMockPage === "overview" ? (darkMode ? "#3a3a3c" : "#fff") : "transparent",
              color: darkMode ? "#fff" : "#000",
              fontSize: "0.75rem",
              fontWeight: activeMockPage === "overview" ? 600 : 400,
              textAlign: "left",
              cursor: "pointer"
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveMockPage("products")}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "none",
              background: activeMockPage === "products" ? (darkMode ? "#3a3a3c" : "#fff") : "transparent",
              color: darkMode ? "#fff" : "#000",
              fontSize: "0.75rem",
              fontWeight: activeMockPage === "products" ? 600 : 400,
              textAlign: "left",
              cursor: "pointer"
            }}
          >
            Orders Log
          </button>
          <button
            onClick={() => setActiveMockPage("queries")}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "none",
              background: activeMockPage === "queries" ? (darkMode ? "#3a3a3c" : "#fff") : "transparent",
              color: darkMode ? "#fff" : "#000",
              fontSize: "0.75rem",
              fontWeight: activeMockPage === "queries" ? 600 : 400,
              textAlign: "left",
              cursor: "pointer"
            }}
          >
            Athena Views
          </button>
        </div>

        {/* Workspace Canvas (Contents) */}
        <div style={{ flex: 1, padding: "1.5rem", position: "relative" }}>
          
          {/* Overview Tab Content */}
          {activeMockPage === "overview" && (
            <div>
              {/* KPI Cards Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem"
                }}
              >
                <div
                  style={{
                    background: darkMode ? "#2c2c2e" : "#fff",
                    borderRadius: "10px",
                    padding: "1rem",
                    border: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#8e8e93", textTransform: "uppercase" }}>Total Sales</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "0.25rem", color: darkMode ? "#fff" : "#000" }}>
                    {formatCurrency(totalSales)}
                  </div>
                </div>
                <div
                  style={{
                    background: darkMode ? "#2c2c2e" : "#fff",
                    borderRadius: "10px",
                    padding: "1rem",
                    border: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#8e8e93", textTransform: "uppercase" }}>Total Orders</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "0.25rem", color: darkMode ? "#fff" : "#000" }}>
                    {totalOrders}
                  </div>
                </div>
                <div
                  style={{
                    background: darkMode ? "#2c2c2e" : "#fff",
                    borderRadius: "10px",
                    padding: "1rem",
                    border: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#8e8e93", textTransform: "uppercase" }}>Average Basket</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "0.25rem", color: darkMode ? "#fff" : "#000" }}>
                    {formatCurrency(averageBasket)}
                  </div>
                </div>
              </div>

              {/* Charts Visual Split */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr",
                  gap: "1.2rem"
                }}
              >
                {/* SVG Revenue Line Graph */}
                <div
                  style={{
                    background: darkMode ? "#2c2c2e" : "#fff",
                    borderRadius: "10px",
                    padding: "1rem",
                    border: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: darkMode ? "#fff" : "#333"
                    }}
                  >
                    Daily Revenue Trend (₹)
                  </div>
                  {analyticsLoading ? (
                    <div style={{ height: "150px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "#8e8e93" }}>
                      Querying Athena...
                    </div>
                  ) : (
                    <svg width="100%" height={cHeight} viewBox={`0 0 ${cWidth} ${cHeight}`}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C5A028" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#C5A028" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Lines */}
                      <line x1={pad} y1={getY(0)} x2={cWidth - pad} y2={getY(0)} stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} strokeWidth="1" />
                      <line x1={pad} y1={getY(maxRevenue / 2)} x2={cWidth - pad} y2={getY(maxRevenue / 2)} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="3" />
                      <line x1={pad} y1={getY(maxRevenue)} x2={cWidth - pad} y2={getY(maxRevenue)} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="3" />

                      {/* Area Fill */}
                      {fillPath && <path d={fillPath} fill="url(#chartGrad)" />}

                      {/* Line */}
                      {linePath && <path d={linePath} fill="none" stroke="#C5A028" strokeWidth="2.5" />}

                      {/* Dots and Labels */}
                      {chartData.map((d, i) => {
                        const cx = getX(i);
                        const cy = getY(d.revenue);
                        return (
                          <g key={i}>
                            <circle cx={cx} cy={cy} r="4" fill="#C5A028" stroke={darkMode ? "#2c2c2e" : "#fff"} strokeWidth="1.5" />
                            <text x={cx} y={cHeight - 10} fontSize="8" fill="#8e8e93" textAnchor="middle">
                              {d.date}
                            </text>
                            <text x={cx} y={cy - 8} fontSize="7" fontWeight="bold" fill={darkMode ? "#fff" : "#000"} textAnchor="middle">
                              {Math.round(d.revenue)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>

                {/* Categories share chart block */}
                <div
                  style={{
                    background: darkMode ? "#2c2c2e" : "#fff",
                    borderRadius: "10px",
                    padding: "1rem",
                    border: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: darkMode ? "#fff" : "#333", marginBottom: "0.5rem" }}>
                    Category Split
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1, justifyContent: "center" }}>
                    {categoryShares.length === 0 ? (
                      <span style={{ fontSize: "0.75rem", color: "#8e8e93", textAlign: "center" }}>No data filtered</span>
                    ) : (
                      categoryShares.map(item => (
                        <div key={item.name}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: "0.2rem" }}>
                            <span style={{ color: darkMode ? "#fff" : "#444", fontWeight: 500 }}>{item.name}</span>
                            <span style={{ color: "#8e8e93" }}>{item.percentage}% ({formatCurrency(item.value)})</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", background: darkMode ? "#3a3a3c" : "#e5e5ea", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${item.percentage}%`, height: "100%", background: colorsMap[item.name] || "#C5A028" }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders list Tab Content */}
          {activeMockPage === "products" && (
            <div style={{ fontSize: "0.75rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.8rem", color: darkMode ? "#fff" : "#333" }}>
                Interactive Orders Log
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${darkMode ? "#3a3a3c" : "#e5e5ea"}`, color: "#8e8e93" }}>
                      <th style={{ padding: "0.4rem" }}>Order ID</th>
                      <th style={{ padding: "0.4rem" }}>Mage</th>
                      <th style={{ padding: "0.4rem" }}>Category</th>
                      <th style={{ padding: "0.4rem" }}>Date</th>
                      <th style={{ padding: "0.4rem", textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} style={{ borderBottom: `1px solid ${darkMode ? "#2c2c2e" : "#f5f5f7"}`, color: darkMode ? "#eaeaea" : "#333" }}>
                        <td style={{ padding: "0.4rem", fontWeight: 600 }}>{order.id}</td>
                        <td style={{ padding: "0.4rem" }}>{order.user}</td>
                        <td style={{ padding: "0.4rem" }}>
                          <span style={{
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            backgroundColor: `${colorsMap[order.category]}22`,
                            color: colorsMap[order.category],
                            fontSize: "0.65rem",
                            fontWeight: 600
                          }}>
                            {order.category}
                          </span>
                        </td>
                        <td style={{ padding: "0.4rem" }}>{order.date}</td>
                        <td style={{ padding: "0.4rem", textAlign: "right", fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Athena view log tab */}
          {activeMockPage === "queries" && (
            <div style={{ fontSize: "0.75rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.5rem", color: darkMode ? "#fff" : "#333" }}>
                Athena Partition Query Results
              </div>
              <p style={{ color: "#8e8e93", margin: "0 0 1rem" }}>
                Below are the aggregated records returned by running SQL queries on the partitioned S3 files in AWS Glue catalog.
              </p>
              {analyticsLoading ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#8e8e93" }}>
                  Querying Athena Workgroup...
                </div>
              ) : analyticsData.length === 0 ? (
                <div style={{ padding: "2.5rem", textAlign: "center", border: `1px dashed ${darkMode ? "#3a3a3c" : "#d2d2d7"}`, borderRadius: "8px", background: darkMode ? "#252528" : "#fafafa" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: darkMode ? "#eaeaea" : "#333", marginBottom: "0.25rem" }}>
                    No Records in Athena Database
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#8e8e93" }}>
                    Once you place new customer orders, Kinesis Firehose streams JSON files to your S3 bucket. Click Refresh Data to sync.
                  </div>
                </div>
              ) : (
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${darkMode ? "#3a3a3c" : "#e5e5ea"}`, color: "#8e8e93" }}>
                        <th style={{ padding: "0.4rem" }}>Partition (Date)</th>
                        <th style={{ padding: "0.4rem" }}>Year</th>
                        <th style={{ padding: "0.4rem" }}>Month</th>
                        <th style={{ padding: "0.4rem" }}>Day</th>
                        <th style={{ padding: "0.4rem", textAlign: "right" }}>Daily Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${darkMode ? "#2c2c2e" : "#f5f5f7"}` }}>
                          <td style={{ padding: "0.4rem", fontWeight: 600 }}>{row.year}-{row.month}-{row.day}</td>
                          <td style={{ padding: "0.4rem" }}>{row.year}</td>
                          <td style={{ padding: "0.4rem" }}>{row.month}</td>
                          <td style={{ padding: "0.4rem" }}>{row.day}</td>
                          <td style={{ padding: "0.4rem", textAlign: "right", fontWeight: 600 }}>{formatCurrency(row.daily_revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Collapsible/Interactive Filters pane on the right */}
        <div
          style={{
            width: "140px",
            background: darkMode ? "#252528" : "#f9f9f9",
            borderLeft: `1px solid ${darkMode ? "#3a3a3c" : "#d2d2d7"}`,
            padding: "1rem 0.8rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}
        >
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#8e8e93", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Filter Category
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: "100%",
                fontSize: "0.7rem",
                padding: "0.25rem",
                background: darkMode ? "#3a3a3c" : "#fff",
                color: darkMode ? "#fff" : "#000",
                border: `1px solid ${darkMode ? "#48484a" : "#d2d2d7"}`,
                borderRadius: "4px",
                outline: "none"
              }}
            >
              <option value="All">All Categories</option>
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#8e8e93", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Min Order Value
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#C5A028" }}
              />
            </div>
            <div style={{ fontSize: "0.65rem", color: darkMode ? "#eaeaea" : "#333", marginTop: "0.2rem", textAlign: "right", fontWeight: 600 }}>
              ₹{minOrderValue}
            </div>
          </div>

          <button
            onClick={() => {
              setCategoryFilter("All");
              setMinOrderValue(0);
            }}
            style={{
              marginTop: "auto",
              padding: "0.3rem",
              background: "none",
              border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"}`,
              borderRadius: "4px",
              color: darkMode ? "#eaeaea" : "#333",
              fontSize: "0.65rem",
              cursor: "pointer"
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Console Section Header */}
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

      {/* Tab Switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "2rem"
        }}
      >
        <div style={theme.header.tabsContainer}>
          <button
            onClick={() => setConsoleTab("analytics")}
            style={consoleTab === "analytics" ? theme.button.pillActive : theme.button.pillInactive}
          >
            PowerBI Analytics Dashboard
          </button>
          <button
            onClick={() => setConsoleTab("editor")}
            style={consoleTab === "editor" ? theme.button.pillActive : theme.button.pillInactive}
          >
            Catalog Editor
          </button>
        </div>
      </div>

      {/* Tab Content 1: PowerBI Dashboard */}
      {consoleTab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Controls Panel */}
          <div
            style={{
              ...theme.section.card,
              padding: "1.2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 0.25rem", color: theme.page.color, fontSize: "1.1rem", fontFamily: "'Cinzel', serif" }}>
                Interactive BI Embed
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#86868b" }}>
                {embedUrl ? "Currently embedding live Microsoft Power BI report." : "Displaying simulated telemetry dashboard. Provide an embed URL below to connect live reports."}
              </p>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                ...theme.button.secondary,
                padding: "0.4rem 1rem",
                fontSize: "0.8rem"
              }}
            >
              {showSettings ? "Close Settings" : "Configure URL"}
            </button>
          </div>

          {/* Settings Sub-Card */}
          {showSettings && (
            <div
              style={{
                ...theme.section.card,
                padding: "1.5rem",
                border: "1px dashed #C5A028"
              }}
            >
              <form onSubmit={handleSaveUrl} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "#86868b", display: "block", marginBottom: "0.4rem", fontWeight: 500 }}>
                    PowerBI Publish/Embed URL
                  </label>
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://app.powerbi.com/view?r=ey..."
                    style={theme.input.base}
                  />
                  <small style={{ color: "#8e8e93", display: "block", marginTop: "0.3rem" }}>
                    Paste a PowerBI Publish to Web URL or App Embed link.
                  </small>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="submit" style={{ ...theme.button.primary, flex: 1, padding: "0.5rem" }}>
                    Save Report URL
                  </button>
                  {embedUrl && (
                    <button type="button" onClick={handleClearUrl} style={{ ...theme.button.secondary, flex: 1, padding: "0.5rem", color: "#ff3b30", borderColor: "#ff3b30" }}>
                      Reset to Mockup
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Core Embed Frame Container */}
          {embedUrl ? (
            <div
              style={{
                background: darkMode ? "#1c1c1e" : "#ffffff",
                borderRadius: "14px",
                overflow: "hidden",
                border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                width: "100%",
                height: "500px",
                position: "relative"
              }}
            >
              <iframe
                title="Live PowerBI Dashboard"
                width="100%"
                height="100%"
                src={embedUrl}
                frameBorder="0"
                allowFullScreen={true}
              />
            </div>
          ) : (
            renderMockDashboard()
          )}
        </div>
      )}

      {/* Tab Content 2: Original Product Catalog Editor */}
      {consoleTab === "editor" && (
        <>
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
        </>
      )}
    </div>
  );
}

export default AdminConsole;
