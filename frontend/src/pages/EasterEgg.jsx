import React from "react";

function EasterEgg({ setActiveTab, easterProducts, theme }) {
  return (
    <div>
      <h1>EASTER EGG FOUND!</h1>
      <button
        onClick={() => setActiveTab("products")}
        style={theme.button.primary}
      >
        REAL WORLD
      </button>
      {easterProducts.map((item) => (
        <div key={item.id}>
          <div style={{ ...theme.section.card }}>
            {item.name} - ${item.price}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EasterEgg;
