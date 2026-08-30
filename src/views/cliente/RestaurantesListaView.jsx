import React, { useState, useMemo } from "react";
import { Search, Filter, Star, Clock, ChevronRight } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import { RESTAURANTS, fmt } from "../../data/mockData";
import { Store } from "lucide-react";

/**
 * Tela de listagem/busca de restaurantes — cliente.
 * onSelect(restauranteId) é chamado ao clicar num card, pra abrir o cardápio.
 */
export default function RestaurantesListaView({ onSelect }) {
  const [q, setQ] = useState("");
  const [ordenar, setOrdenar] = useState("relevancia");

  const filtrados = useMemo(() => {
    let lista = RESTAURANTS.filter(
      (r) => r.nome.toLowerCase().includes(q.toLowerCase()) || r.cat.toLowerCase().includes(q.toLowerCase())
    );
    if (ordenar === "avaliacao") lista = [...lista].sort((a, b) => b.rating - a.rating);
    if (ordenar === "entrega") lista = [...lista].sort((a, b) => parseInt(a.tempo) - parseInt(b.tempo));
    return lista;
  }, [q, ordenar]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader Icon={Store} title="RESTAURANTES" subtitle="Encontre o restaurante ideal pra você" />

      <div style={{ display: "flex", gap: 10 }}>
        <div className="ef-card" style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "12px 16px" }}>
          <Search size={16} color="var(--muted)" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou tipo de cozinha..."
            className="ef-input"
            style={{ border: "none", padding: 0, flex: 1, background: "transparent" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Filter size={14} color="var(--muted)" />
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>Ordenar por:</span>
        {[
          { key: "relevancia", label: "Relevância" },
          { key: "avaliacao", label: "Melhor avaliação" },
          { key: "entrega", label: "Menor tempo" },
        ].map((o) => (
          <button
            key={o.key}
            onClick={() => setOrdenar(o.key)}
            style={{
              padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontFamily: "'Exo 2', sans-serif", fontSize: 11,
              border: `1px solid ${ordenar === o.key ? "var(--accent)" : "var(--border)"}`,
              background: ordenar === o.key ? "var(--hover)" : "transparent",
              color: ordenar === o.key ? "var(--accent)" : "#d8d8d8",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <EmptyState title="NENHUM RESTAURANTE ENCONTRADO" subtitle="Tente buscar por outro nome ou tipo de cozinha." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filtrados.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="ef-card"
              style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
            >
              <div style={{ height: 110, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <r.Icon size={36} color="var(--accent)" />
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{r.nome}</span>
                  <ChevronRight size={14} color="var(--muted)" />
                </div>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)" }}>{r.cat}</span>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "#d8d8d8" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={12} color="var(--accent)" fill="var(--accent)" /> {r.rating}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={12} /> {r.tempo}
                  </span>
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
