import React from "react";

const flooStyle = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  opacity: 0.25,
  transform: "scale(0.8)",
  transition: "all 0.3s ease",
  zIndex: 1000,
};

const flooHover = {
  opacity: 1,
  transform: "scale(1)",
};

function Header({
  activeTab,
  setActiveTab,
  cancelEdit,
  darkMode,
  toggleDarkMode,
  theme,
  currentUser,
  onSignOut,
}) {
  const userRole = currentUser?.role || "user";
  const tabs =
    userRole === "admin"
      ? ["products", "cart", "history", "admin", "testing"]
      : ["products", "cart", "history"];

  return (
    <header style={{ ...theme.header.container, paddingTop: "0.5rem" }}>

      <h1 style={theme.header.title}>
        The Diagon Alley
      </h1>
      <p style={theme.header.subtitle}>
        A wizarding marketplace where products appear like magic.
      </p>

      {/*NEW HIDDEN EASTER EGG BUTTON - Only visible to admin! */}
      {userRole === "admin" && (
        <button
          onClick={() => setActiveTab("easteregg")}
          style={flooStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, flooHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, flooStyle)}
        >
          🪄
        </button>
      )}

      <div style={theme.header.tabsContainer}>
        {tabs.map((tab) => (
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
              ? "The Storefront"
              : tab === "cart"
                ? "Wizarding Trunk"
                : tab === "admin"
                  ? "Ministry Console"
                  : tab === "history"
                    ? "Order History"
                    : "Arcane Testing"}
          </button>
        ))}
      </div>
    </header>
  );
}

export default Header;
