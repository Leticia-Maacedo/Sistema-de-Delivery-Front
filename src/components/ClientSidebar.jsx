import React from "react";
import { Truck, LogOut } from "lucide-react";
import { PAPEIS, LINK_PORTAL_PARCEIRO } from "../data/navigation";
import { exibicaoUsuario } from "../data/usuarioExibicao";

/**
 * Barra lateral do app (cliente) e do Portal do Parceiro (restaurante e
 * entregador). O menu depende de quem está logado (PAPEIS em
 * data/navigation.js): o cliente não vê as telas do parceiro e vice-versa.
 * A área Admin tem a sua própria barra, à parte.
 */
export default function ClientSidebar({ view, onGo, usuario, papel, onSair }) {
  const regras = PAPEIS[papel] || PAPEIS.visitante;
  const eu = exibicaoUsuario(usuario);
  const logado = papel !== "visitante";

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
          {papel === "restaurante" || papel === "entregador" ? "PORTAL DO PARCEIRO" : "SISTEMA DE DELIVERY"}
        </span>
      </div>

      <NavSection label={regras.titulo} items={regras.menu} view={view} onGo={onGo} />

      {!logado && (
        <NavSection label="PARCEIRO" items={[LINK_PORTAL_PARCEIRO]} view={view} onGo={onGo} />
      )}

      {logado && (
        <div className="ef-card" style={{ padding: 12, marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#0D0D0D", fontWeight: 700, flexShrink: 0 }}>
            {eu.inicial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eu.nome}</div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)" }}>{eu.tipo}</div>
          </div>
          <button onClick={onSair} className="ef-icon-btn" title="Sair" aria-label="Sair" style={{ flexShrink: 0 }}>
            <LogOut size={14} />
          </button>
        </div>
      )}
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
