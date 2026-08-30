import React from "react";
import { Bell, Search } from "lucide-react";
import { CATEGORIES, RESTAURANTS } from "../../data/mockData";

export default function PaginaPrincipalView({ onGo, onSelectRestaurante }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 15, color: "#fff" }}>Olá, Leticia! 👋</span>
          <p style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
            Pronta pra fazer seu dia mais gostoso?
          </p>
        </div>
        <Bell size={18} color="var(--accent)" />
      </div>

      <div className="ef-card" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px" }}>
        <Search size={16} color="var(--muted)" />
        <input placeholder="Buscar restaurantes, pratos, mercados..." className="ef-input" style={{ border: "none", padding: 0, flex: 1 }} />
      </div>

      <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
        {CATEGORIES.map((c, i) => (
          <div
            key={c.key}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 16px",
              borderRadius: 10, flexShrink: 0, background: i === 0 ? "var(--accent)" : "var(--card)", border: "1px solid var(--border)",
            }}
          >
            <c.Icon size={18} color={i === 0 ? "#0D0D0D" : "var(--accent)"} />
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: i === 0 ? "#0D0D0D" : "#d8d8d8" }}>{c.label}</span>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Perto de você</span>
          <span
            onClick={() => onGo?.("restaurantes-cliente")}
            style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--accent)", cursor: "pointer" }}
          >
            Ver todos
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 10 }}>
          {RESTAURANTS.slice(0, 3).map((r) => (
            <div key={r.id} onClick={() => onSelectRestaurante?.(r.id)} className="ef-card" style={{ overflow: "hidden", cursor: "pointer" }}>
              <div style={{ height: 90, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <r.Icon size={30} color="var(--accent)" />
              </div>
              <div style={{ padding: 10 }}>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 600, fontSize: 12, color: "#fff" }}>{r.nome}</span>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                  ★ {r.rating} · {r.tempo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ef-card" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>
            DESCONTO NO PRIMEIRO PEDIDO!
          </span>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            USE: <b style={{ color: "#fff" }}>ENTREGAFOOD10</b>
          </div>
        </div>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: "var(--accent)" }}>10% OFF</span>
      </div>
    </div>
  );
}