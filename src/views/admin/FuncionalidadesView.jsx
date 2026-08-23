import React from "react";
import { FEATURES } from "../../data/features";

export default function FuncionalidadesView() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {FEATURES.map((f) => (
        <div key={f.titulo} className="ef-card" style={{ padding: 16 }}>
          <f.Icon size={18} color="var(--accent2)" />
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "#fff", marginTop: 10 }}>{f.titulo}</div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{f.desc}</div>
        </div>
      ))}
    </div>
  );
}
