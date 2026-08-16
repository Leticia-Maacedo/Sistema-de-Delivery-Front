import { useState, useMemo } from "react";
import { Store, Search, Filter, Star, Clock, ChevronRight } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { RESTAURANTS, fmt } from "../../data/mockData";

export default function RestaurantesView() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => RESTAURANTS.filter((r) => r.nome.toLowerCase().includes(q.toLowerCase()) || r.cat.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader Icon={Store} title="RESTAURANTES" />
      <div style={{ display: "flex", gap: 10 }}>
        <div className="ef-card" style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}>
          <Search size={16} color="var(--muted)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar restaurantes..." className="ef-input" style={{ border: "none", padding: 0 }} />
        </div>
        <button className="ef-btn-outline"><Filter size={14} /> FILTROS</button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="NÃO ENCONTRADO" subtitle="Não encontramos restaurantes para essa busca. Tente outro termo." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filtered.map((r) => (
            <div key={r.id} className="ef-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ height: 110, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--border)" }}>
                <r.Icon size={36} color="var(--accent)" />
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff" }}>{r.nome}</span>
                  <ChevronRight size={14} color="var(--muted)" />
                </div>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)" }}>{r.cat}</span>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "#d8d8d8" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={12} color="var(--accent)" fill="var(--accent)" /> {r.rating}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {r.tempo}</span>
                  <span>Frete {fmt(r.frete)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
