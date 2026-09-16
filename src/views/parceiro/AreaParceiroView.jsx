import React, { useState, useEffect } from "react";
import { Store, DollarSign, ClipboardList, Wallet, Star, Package, Pencil } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { ORDERS, fmt } from "../../data/mockData";
import { getRestauranteAtivo, restaurantes as restaurantesApi, ApiError } from "../../api/client";

export default function AreaParceiroView({ onGo, onEditRestaurante }) {
  const meusPedidos = ORDERS.filter((o) => o.restaurante === "Cantinho do Chef");
  const [restaurante, setRestaurante] = useState(getRestauranteAtivo());
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Se já tem um restaurante em cache mas os dados podem ter mudado
  // (ex: editado em outra aba), busca a versão mais recente na API.
  useEffect(() => {
    const atual = getRestauranteAtivo();
    if (!atual) return;
    setCarregando(true);
    restaurantesApi
      .obter(atual.id)
      .then(setRestaurante)
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Não foi possível atualizar os dados do restaurante."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader Icon={Store} title="ÁREA DO PARCEIRO" subtitle="Painel do restaurante" />

      <div className="ef-card" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        {restaurante ? (
          <>
            <div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>
                {restaurante.nome_fantasia}
              </div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                CNPJ {restaurante.cnpj} · Taxa {fmt(Number(restaurante.taxa_entrega_km))}/km
                {carregando && " · atualizando..."}
              </div>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={restaurante.status_aprovacao === "aprovado" ? "Confirmado" : restaurante.status_aprovacao === "recusado" ? "Preparando" : "Em rota"} />
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", marginLeft: 8 }}>
                  {restaurante.status_aprovacao === "aprovado" ? "Aprovado" : restaurante.status_aprovacao === "recusado" ? "Recusado" : "Aguardando aprovação"}
                </span>
              </div>
            </div>
            <button className="ef-btn-outline" onClick={() => onEditRestaurante?.(restaurante.id)}>
              <Pencil size={14} /> EDITAR
            </button>
          </>
        ) : (
          <>
            <div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>
                Você ainda não cadastrou um restaurante
              </div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                Cadastre pra liberar cardápio e recebimento de pedidos.
              </div>
            </div>
            <button className="ef-btn-solid" style={{ width: "auto" }} onClick={() => onGo?.("cadastro-restaurante")}>
              CADASTRAR RESTAURANTE
            </button>
          </>
        )}
      </div>

      {erro && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C" }}>{erro}</span>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="VENDAS HOJE" value="R$ 842" delta="9% vs ontem" Icon={DollarSign} />
        <StatCard label="PEDIDOS PENDENTES" value="3" delta="2 em preparo" Icon={ClipboardList} />
        <StatCard label="TICKET MÉDIO" value="R$ 47" delta="R$4 este mês" Icon={Wallet} />
        <StatCard label="AVALIAÇÃO" value="4.8" delta="2.345 avaliações" Icon={Star} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div onClick={() => onGo?.("cardapios")} className="ef-card" style={{ padding: 18, cursor: "pointer" }}>
          <Package size={20} color="var(--accent)" />
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", marginTop: 10 }}>Gerenciar Cardápio</div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Edite pratos, preços e disponibilidade.</div>
        </div>
        <div onClick={() => onGo?.("avaliacoes")} className="ef-card" style={{ padding: 18, cursor: "pointer" }}>
          <Star size={20} color="var(--accent)" />
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", marginTop: 10 }}>Avaliações</div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Veja e responda o feedback dos clientes.</div>
        </div>
      </div>

      <div className="ef-card" style={{ padding: 18 }}>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Pedidos do restaurante</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {meusPedidos.map((o) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px", borderTop: "1px solid var(--border)", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>
              <span style={{ color: "var(--accent)" }}>#{o.id}</span>
              <span style={{ color: "#d8d8d8" }}>{o.cliente}</span>
              <StatusBadge status={o.status} />
              <span style={{ color: "#fff" }}>{fmt(o.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}