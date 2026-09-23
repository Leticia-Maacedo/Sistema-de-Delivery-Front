import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, ShoppingCart, Plus, Minus } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { consultas, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

/**
 * Listagem e seleção de produtos — GET /consultas/restaurantes/{id}/cardapio.
 * Só traz itens com disponivel = true (o back já filtra).
 *
 * O carrinho ({ produtoId: quantidade }) e as funções pra alterá-lo vêm
 * de fora (props), porque a tela de "detalhes do produto" precisa
 * continuar enxergando/alterando o mesmo carrinho quando o usuário
 * navega pra lá e volta.
 */
export default function CardapioRestauranteView({ restauranteId, onBack, onSelectProduto, carrinho, onAdicionar, onRemover }) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setCarregando(true);
    setErro("");
    consultas
      .cardapio(restauranteId)
      .then(setDados)
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o cardápio."))
      .finally(() => setCarregando(false));
  }, [restauranteId]);

  const totalItens = Object.values(carrinho).reduce((s, q) => s + q, 0);
  const totalPreco = (dados?.itens || []).reduce((soma, it) => soma + (carrinho[it.id] || 0) * Number(it.preco), 0);

  if (carregando) {
    return <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando cardápio...</div>;
  }
  if (erro || !dados) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <button onClick={onBack} className="ef-btn-outline" style={{ marginBottom: 14 }}><ArrowLeft size={14} /> VOLTAR</button>
        <EmptyState title="RESTAURANTE INDISPONÍVEL" subtitle={erro || "Não encontramos esse restaurante."} />
      </div>
    );
  }

  const { restaurante, itens } = dados;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: totalItens > 0 ? 90 : 0 }}>
      <button onClick={onBack} className="ef-btn-outline" style={{ marginBottom: 14 }}><ArrowLeft size={14} /> VOLTAR</button>

      <div style={{ height: 140, borderRadius: 14, background: "var(--panel)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: "var(--accent)" }}>{restaurante.nome_fantasia[0]}</span>
      </div>

      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#fff" }}>{restaurante.nome_fantasia}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)" }}>
        <MapPin size={13} /> {restaurante.local?.endereco}
      </div>
      <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#d8d8d8", marginTop: 6 }}>
        Taxa de entrega: <span style={{ color: "var(--accent)" }}>{fmt(restaurante.taxa_entrega_km)}/km</span>
      </div>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Cardápio</span>
        {itens.length === 0 && <EmptyState title="CARDÁPIO VAZIO" subtitle="Esse restaurante ainda não tem itens disponíveis." />}
        {itens.map((it) => {
          const qtd = carrinho[it.id] || 0;
          return (
            <div key={it.id} className="ef-card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div onClick={() => onSelectProduto(it.id)} style={{ flex: 1, cursor: "pointer" }}>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 600, fontSize: 13, color: "#fff" }}>{it.nome}</div>
                {it.descricao && <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{it.descricao}</div>}
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--accent)", marginTop: 6 }}>{fmt(it.preco)}</div>
              </div>
              {qtd === 0 ? (
                <button onClick={() => onAdicionar(it.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--accent)", color: "#0D0D0D", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Plus size={16} />
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => onRemover(it.id)} className="ef-icon-btn"><Minus size={14} /></button>
                  <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", minWidth: 14, textAlign: "center" }}>{qtd}</span>
                  <button onClick={() => onAdicionar(it.id)} className="ef-icon-btn" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}><Plus size={14} /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalItens > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "14px 16px", background: "linear-gradient(transparent, var(--bg) 30%)" }}>
          <button className="ef-btn-solid" style={{ maxWidth: 640, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><ShoppingCart size={16} /> Ver carrinho ({totalItens})</span>
            <span>{fmt(totalPreco)}</span>
          </button>
        </div>
      )}
    </div>
  );
}