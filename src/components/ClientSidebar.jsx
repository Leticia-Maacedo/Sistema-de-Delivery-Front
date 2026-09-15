import React from "react";
import { Truck, Circle } from "lucide-react";
import { NAV_CLIENTE, NAV_PARCEIRO } from "../data/navigation";

/**
 * Sidebar única para as áreas Cliente + Parceiro (agrupadas com um rótulo
 * cada, como no protótipo). A área Admin tem a sua própria sidebar, à parte.
 */
export default function ClientSidebar({ view, onGo }) {
  return (
    <aside
      style={{
        width: 230, background: "var(--panel)", borderRight: "1px solid var(--border)",
        padding: 18, display: "flex", flexDirection: "column", gap: 18, minHeight: "100vh", flexShrink: 0,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Truck size={18} color="var(--accent)" />
          <span className="ef-logo" style={{ fontSize: 12 }}>
            ENTREGA<span style={{ color: "var(--accent)" }}>FOOD</span>
          </span>
        </div>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 9, color: "var(--muted)", letterSpacing: 1, marginLeft: 26 }}>
          SISTEMA DE DELIVERY
        </span>
      </div>

      <NavSection label="CLIENTE" items={NAV_CLIENTE} view={view} onGo={onGo} />
      <NavSection label="PARCEIRO" items={NAV_PARCEIRO} view={view} onGo={onGo} />

      <div className="ef-card" style={{ padding: 12, marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#0D0D0D", fontWeight: 700 }}>
          L
        </div>
        <div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#fff" }}>Leticia</div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)" }}>Cliente</div>
        </div>
      </div>
    </aside>
  );
}

function NavSection({ label, items, view, onGo }) {
  return (
    <div>
      <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)", letterSpacing: 1 }}>{label}</span>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
        {items.map((n) => (
          <button
            key={n.key}
            onClick={() => onGo(n.key)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8,
              background: view === n.key ? "var(--hover)" : "transparent",
              border: "none", color: view === n.key ? "var(--accent)" : "#c7c7c7",
              fontFamily: "'Exo 2', sans-serif", fontSize: 13, cursor: "pointer", textAlign: "left",
              borderLeft: view === n.key ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            <n.Icon size={15} /> {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
