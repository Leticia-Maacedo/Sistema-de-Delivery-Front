import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, ShoppingBag } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { consultas } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

/**
 * Visualização da Cesta — GET /cesta (feito no App.jsx, aqui só exibe).
 * Toda mutação (+ / - / excluir) devolve a sacola inteira atualizada,
 * então este componente é "burro" quanto aos itens: só mostra o que
 * recebe em `sacola` e chama os callbacks.
 *
 * A taxa de entrega NÃO vem da sacola (ela não tem esse campo) — busca
 * direto do restaurante (consultas.restaurante) usando restauranteId.
 * Hoje é só `taxa_entrega_km` usada como valor fixo (não calcula
 * distância real) — ajustar aqui quando tiver cálculo de frete de verdade.
 */
export default function CestaView({
  sacola, carregando, erro, restauranteId,
  onAumentar, onDiminuir, onRemoverItem,
  onBack, onContinuarComprando, onIrParaPagamento,
}) {
  const [taxaEntrega, setTaxaEntrega] = useState(0);

  useEffect(() => {
    if (!restauranteId) return;
    consultas
      .restaurante(restauranteId)
      .then((r) => setTaxaEntrega(Number(r.taxa_entrega_km) || 0))
      .catch(() => setTaxaEntrega(0));
  }, [restauranteId]);

  if (carregando) {
    return <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando cesta...</div>;
  }

  const itens = sacola?.itens || [];
  const subtotal = Number(sacola?.total || 0);
  const total = subtotal + taxaEntrega;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <button onClick={onBack} className="ef-btn-outline" style={{ marginBottom: 14 }}>
        <ArrowLeft size={14} /> VOLTAR
      </button>

      <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 17, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <ShoppingCart size={19} color="var(--accent)" /> MINHA CESTA
      </h1>

      {erro && (
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C", marginTop: 10 }}>{erro}</div>
      )}

      {itens.length === 0 ? (
        <div style={{ marginTop: 18 }}>
          <EmptyState title="CESTA VAZIA" subtitle="Adicione itens do cardápio de um restaurante pra vê-los aqui." />
          <button className="ef-btn-solid" style={{ marginTop: 14 }} onClick={onContinuarComprando}>
            <ShoppingBag size={14} /> CONTINUAR COMPRANDO
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            {itens.map((item) => (
              <div key={item.id} className="ef-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 600, fontSize: 13, color: "#fff" }}>{item.nome}</div>
                  <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{fmt(item.preco_unitario)} cada</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => onDiminuir(item)} className="ef-icon-btn"><Minus size={14} /></button>
                  <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", minWidth: 16, textAlign: "center" }}>{item.quantidade}</span>
                  <button onClick={() => onAumentar(item)} className="ef-icon-btn" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}><Plus size={14} /></button>
                </div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--accent)", minWidth: 74, textAlign: "right" }}>
                  {fmt(item.subtotal)}
                </div>
                <button onClick={() => onRemoverItem(item.produto_id)} className="ef-icon-btn" style={{ color: "#E6534C", borderColor: "#E6534C" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="ef-card" style={{ padding: 18, marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#d8d8d8" }}>
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#d8d8d8" }}>
              <span>Taxa de entrega</span><span>{taxaEntrega > 0 ? fmt(taxaEntrega) : "Grátis"}</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Total</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "var(--accent)" }}>{fmt(total)}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="ef-btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={onContinuarComprando}>
              <ShoppingBag size={14} /> CONTINUAR COMPRANDO
            </button>
            <button className="ef-btn-solid" style={{ flex: 1 }} onClick={onIrParaPagamento}>
              IR PARA O PAGAMENTO
            </button>
          </div>
        </>
      )}
    </div>
  );
}