import React from "react";
import { Bike, ChevronRight } from "lucide-react";
import { CATEGORIES } from "../../data/mockData";

const DESCRICOES = {
  todos: "Todos os tipos",
  restaurantes: "Comidas e refeições",
  mercados: "Mercados e conveniências",
  bebidas: "Bebidas e drinks",
  farmacia: "Medicamentos e itens",
  mais: "Outras categorias",
};

export default function InicioCategoriasView({ onGo }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Hero */}
      <div
        className="ef-card"
        style={{
          position: "relative", overflow: "hidden", padding: "40px 32px",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10,
        }}
      >
        {/* skyline decorativo */}
        <svg
          viewBox="0 0 900 90" preserveAspectRatio="none"
          style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 70, opacity: 0.35 }}
        >
          {[
            [0, 30, 40, 60], [45, 10, 55, 80], [105, 40, 60, 50], [170, 5, 50, 85],
            [225, 25, 70, 65], [300, 15, 45, 75], [350, 35, 90, 55], [445, 0, 55, 90],
            [505, 22, 65, 68], [575, 12, 50, 78], [630, 38, 80, 52], [715, 8, 60, 82],
            [780, 28, 55, 62], [840, 18, 60, 72],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} fill="var(--accent2)" />
          ))}
        </svg>

        <span style={{ position: "absolute", top: 18, left: 24, fontFamily: "'Exo 2', sans-serif", fontSize: 16, color: "var(--accent2)" }}>+</span>
        <span style={{ position: "absolute", top: 30, right: 90, fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)" }}>+</span>
        <span style={{ position: "absolute", bottom: 90, right: 40, fontFamily: "'Exo 2', sans-serif", fontSize: 20, color: "var(--accent2)" }}>+</span>

        <Bike size={40} color="var(--accent)" style={{ position: "absolute", right: 48, bottom: 48, opacity: 0.9 }} />

        <div style={{ zIndex: 1, fontFamily: "'Press Start 2P', monospace", fontSize: 30, color: "#fff", letterSpacing: 1 }}>
          ENTREGA<span style={{ color: "var(--accent)" }}>FOOD</span>
        </div>
        <p style={{ zIndex: 1, fontFamily: "'Exo 2', sans-serif", color: "var(--accent2)", fontWeight: 700, fontSize: 14, margin: 0 }}>
          Sistema completo de delivery
        </p>
        <p style={{ zIndex: 1, fontFamily: "'Exo 2', sans-serif", color: "var(--muted)", fontSize: 13, margin: 0 }}>
          Praticidade, agilidade e experiência do usuário em um só lugar.
        </p>
      </div>

      {/* Categorias */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => onGo("login")}
            className="ef-card ef-card-hover"
            style={{ padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 10, border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <c.Icon size={22} color="var(--accent)" />
            </div>
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "#fff", letterSpacing: 0.5 }}>
              {c.label.toUpperCase()}
            </span>
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>{DESCRICOES[c.key]}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => onGo("login")}
        className="ef-btn-solid"
        style={{ maxWidth: 280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
      >
        COMEÇAR A PEDIR <ChevronRight size={15} />
      </button>
    </div>
  );
}