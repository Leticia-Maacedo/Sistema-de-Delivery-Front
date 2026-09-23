import React, { useState, useEffect } from "react";
import { Store, MapPin, ChevronRight } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import ClientTopBar from "../../components/ClientTopBar";
import { consultas, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

/**
 * Listagem e seleção de restaurante — GET /consultas/restaurantes.
 * Só traz restaurantes com status_aprovacao = "aprovado" (o back já
 * filtra isso). onSelect(restauranteId) abre o cardápio dele.
 */
export default function RestaurantesListaView({ onSelect }) {
  const [q, setQ] = useState("");
  const [restaurantes, setRestaurantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => buscar(q), 300); // debounce simples
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const buscar = async (busca) => {
    setCarregando(true);
    setErro("");
    try {
      const dados = await consultas.restaurantes(busca || undefined);
      setRestaurantes(dados);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível carregar os restaurantes.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <PageHeader Icon={Store} title="RESTAURANTES" subtitle="Escolha um restaurante pra ver o cardápio" />
        <ClientTopBar searchValue={q} onSearchChange={setQ} placeholder="Buscar por nome do restaurante..." />
      </div>

      {erro && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C" }}>{erro}</span>}

      {carregando ? (
        <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando restaurantes...</div>
      ) : restaurantes.length === 0 ? (
        <EmptyState title="NENHUM RESTAURANTE ENCONTRADO" subtitle="Tente outro termo de busca." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {restaurantes.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="ef-card ef-card-hover"
              style={{ padding: 16, cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ width: "100%", height: 64, borderRadius: 10, background: "var(--panel)", border: "1px solid var(--accent2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Store size={26} color="var(--accent)" />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{r.nome_fantasia}</span>
                  <ChevronRight size={14} color="var(--muted)" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                  <MapPin size={12} color="var(--muted)" />
                  <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>{r.local?.endereco}</span>
                </div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#d8d8d8", marginTop: 8 }}>
                  Taxa de entrega: <span style={{ color: "var(--accent)" }}>{fmt(r.taxa_entrega_km)}/km</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}