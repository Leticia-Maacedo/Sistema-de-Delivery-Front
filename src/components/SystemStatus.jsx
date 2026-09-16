import React from "react";
import { Circle } from "lucide-react";

/** Indicador fixo no canto inferior direito do conteúdo, tipo "SYSTEM ONLINE". */
export default function SystemStatus() {
  return (
    <div style={{
      position: "absolute", bottom: 16, right: 20, display: "flex", alignItems: "center", gap: 8,
      fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--good)", letterSpacing: 0.5,
    }}>
      <Circle size={7} fill="var(--good)" color="var(--good)" /> SYSTEM ONLINE
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, marginLeft: 2 }}>
        {[6, 9, 12].map((h, i) => (
          <div key={i} style={{ width: 3, height: h, background: "var(--good)", borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );
}
