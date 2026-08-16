import { CATEGORIES } from "../../data/mockData";

export default function InicioCategoriasView({ onGo }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ textAlign: "center", padding: "18px 0" }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 26, color: "#fff", letterSpacing: 2 }}>
          ENTREGA<span style={{ color: "var(--accent)" }}>FOOD</span>
        </div>
        <p style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          Sistema completo de delivery — praticidade, agilidade e experiência do usuário.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => onGo("login")} className="ef-card"
            style={{ padding: "28px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "pointer", border: "1px solid var(--border)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: "var(--panel)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <c.Icon size={24} color="var(--accent)" />
            </div>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#fff", letterSpacing: 0.5 }}>{c.label}</span>
          </button>
        ))}
      </div>

      <button onClick={() => onGo("login")} className="ef-btn-solid" style={{ maxWidth: 260, margin: "0 auto" }}>
        COMEÇAR A PEDIR
      </button>
    </div>
  );
}
