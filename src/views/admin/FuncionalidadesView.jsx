import React from "react";
import { FEATURES } from "../../data/features";

export default function FuncionalidadesView() {
  const total = FEATURES.length;
  const prontas = FEATURES.filter((f) => f.pronto).length;

  return (
    <div>
      <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
        {prontas} de {total} funcionalidades implementadas no backend
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {FEATURES.map((f) => (
          <div key={f.titulo} className="ef-card" style={{ padding: 16, opacity: f.pronto ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <f.Icon size={18} color="var(--accent2)" />
              <span
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontWeight: 700,
                  fontSize: 9,
                  letterSpacing: 0.5,
                  padding: "2px 6px",
                  borderRadius: 4,
                  color: f.pronto ? "var(--good)" : "var(--muted)",
                  background: f.pronto ? "rgba(29, 185, 84, 0.14)" : "var(--hover)",
                }}
              >
                {f.pronto ? "IMPLEMENTADO" : "PENDENTE"}
              </span>
            </div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "#fff", marginTop: 10 }}>{f.titulo}</div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{f.desc}</div>
            {f.endpoint && (
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "var(--accent2)", marginTop: 8 }}>{f.endpoint}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
