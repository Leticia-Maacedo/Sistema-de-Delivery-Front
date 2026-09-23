import React, { useState, useMemo } from "react";
import { Store, Star, Clock, ChevronRight } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import ClientTopBar from "../../components/ClientTopBar";
import ViewToggle from "../../components/ViewToggle";
import Pagination from "../../components/Pagination";
import { RESTAURANTS, fmt } from "../../data/mockData";

const POR_PAGINA = 3;

/**
 * Tela de listagem/busca de restaurantes — cliente.
 * onSelect(restauranteId) é chamado ao clicar num card, pra abrir o cardápio.
 */
export default function RestaurantesListaView({ onSelect }) {
  const [q, setQ] = useState("");
  const [ordenar, setOrdenar] = useState("relevancia");
  const [modo, setModo] = useState("grid");
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    let lista = RESTAURANTS.filter(
      (r) => r.nome.toLowerCase().includes(q.toLowerCase()) || r.cat.toLowerCase().includes(q.toLowerCase())
    );
    if (ordenar === "avaliacao") lista = [...lista].sort((a, b) => b.rating - a.rating);
    if (ordenar === "entrega") lista = [...lista].sort((a, b) => parseInt(a.tempo) - parseInt(b.tempo));
    return lista;
  }, [q, ordenar]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((pagAtual - 1) * POR_PAGINA, pagAtual * POR_PAGINA);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <PageHeader Icon={Store} title="RESTAURANTES" subtitle="Encontre o restaurante ideal pra você" />
        <ClientTopBar
          searchValue={q}
          onSearchChange={(v) => { setQ(v); setPagina(1); }}
          placeholder="Buscar por nome ou tipo de cozinha..."
          notifCount={3}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>ORDENAR POR:</span>
          {[
            { key: "relevancia", label: "Relevância" },
            { key: "avaliacao", label: "Melhor avaliação" },
            { key: "entrega", label: "Menor tempo" },
          ].map((o) => (
            <button
              key={o.key}
              onClick={() => setOrdenar(o.key)}
              style={{
                padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "'Exo 2', sans-serif",
                fontWeight: 600, fontSize: 11,
                border: `1px solid ${ordenar === o.key ? "var(--accent)" : "var(--border)"}`,
                background: ordenar === o.key ? "var(--hover)" : "transparent",
                color: ordenar === o.key ? "var(--accent)" : "#d8d8d8",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
        <ViewToggle view={modo} onChange={setModo} />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState title="NENHUM RESTAURANTE ENCONTRADO" subtitle="Tente buscar por outro nome ou tipo de cozinha." />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: modo === "grid" ? "repeat(3, 1fr)" : "1fr",
            gap: 16,
          }}
        >
          {visiveis.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="ef-card ef-card-hover"
              style={{
                padding: 16, cursor: "pointer", display: "flex",
                flexDirection: modo === "grid" ? "column" : "row",
                gap: 14, alignItems: modo === "grid" ? "stretch" : "center",
              }}
            >
              <div style={{
                width: modo === "grid" ? "100%" : 64, height: modo === "grid" ? 64 : 64,
                borderRadius: 10, background: "var(--panel)", border: "1px solid var(--accent2)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <r.Icon size={28} color="var(--accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{r.nome}</span>
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

      <Pagination page={pagAtual} totalPages={totalPaginas} onChange={setPagina} />
    </div>
  );
}