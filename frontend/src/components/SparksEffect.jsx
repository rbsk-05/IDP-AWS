import React from "react";

function SparksEffect({ sparks, darkMode }) {
  return (
    <>
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="magic-spark"
          style={{
            left: spark.x,
            top: spark.y,
            width: spark.size,
            height: spark.size,
            background: darkMode ? "#64d2ff" : "#C5A028",
            boxShadow: `0 0 8px ${darkMode ? "#64d2ff" : "#C5A028"}`,
            "--dx": `${Math.cos(spark.angle) * 40}px`,
            "--dy": `${Math.sin(spark.angle) * 40}px`,
          }}
        />
      ))}
    </>
  );
}

export default SparksEffect;
