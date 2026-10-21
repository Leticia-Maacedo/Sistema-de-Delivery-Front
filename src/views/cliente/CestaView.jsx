import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, ShoppingBag, Bike, Store } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { cesta } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

// Tipo de entrega (Sprint 3 — Fechar Pedido). O back calcula a taxa:
// delivery = pela distância até o endereço do cliente; retirada = grátis.
const TIPOS_ENTREGA = [
  { valor: "delivery", label: "Entrega", detalhe: "No seu endereço", Icon: Bike },
  { valor: "retirada", label: "Retirada", detalhe: "No balcão, sem taxa", Icon: Store },
];

/**
 * Visualização da Cesta — GET /cesta (feito no App.jsx, aqui só exibe).
 * Toda mutação (+ / - / excluir) devolve a sacola inteira atualizada,
 * então este componente é "burro" quanto aos itens: só mostra o que
 * recebe em `sacola` e chama os callbacks.
 *
 * Subtotal, taxa e total vêm do GET /cesta/resumo, recalculado sempre
 * que a sacola ou o tipo de entrega mudam. `pode_fechar`/`motivo` dizem
 * se dá pra seguir (sem endereço, fora do raio, item indisponível...).
 */
export default function CestaView({
  sacola, carregando, erro, tipoEntrega, onTipoEntregaChange,
  onAumentar, onDiminuir, onRemoverItem,
  onBack, onContinuarComprando, onIrParaPagamento,
}) {
  const [resumo, setResumo] = useState(null);
  const [carregandoResumo, setCarregandoResumo] = useState(false);

  const itens = sacola?.itens || [];

  useEffect(() => {
    if (itens.length === 0) {
      setResumo(null);
      return undefined;
    }
    let ativo = true;
    setCarregandoResumo(true);
    cesta
      .resumo(tipoEntrega)
      .then((r) => ativo && setResumo(r))
      .catch(() => ativo && setResumo(null))
      .finally(() => ativo && setCarregandoResumo(false));
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sacola, tipoEntrega]);

  if (carregando) {
    return <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando cesta...</div>;
  }

  const subtotal = Number(resumo?.subtotal ?? sacola?.total ?? 0);
  const taxaEntrega = Number(resumo?.taxa_entrega ?? 0);
  const total = Number(resumo?.total ?? subtotal);
  const podeFechar = resumo ? resumo.pode_fechar : true;

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

          <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "var(--muted)", marginTop: 20, letterSpacing: 1 }}>
            COMO VOCÊ QUER RECEBER?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 8 }}>
            {TIPOS_ENTREGA.map((t) => {
              const selecionado = tipoEntrega === t.valor;
              return (
                <button
                  key={t.valor}
                  onClick={() => onTipoEntregaChange(t.valor)}
                  className="ef-card"
                  aria-pressed={selecionado}
                  style={{
                    padding: 14, display: "flex", alignItems: "center", gap: 12, textAlign: "left", cursor: "pointer",
                    border: selecionado ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: selecionado ? "var(--hover)" : "var(--card)",
                  }}
                >
                  <t.Icon size={20} color={selecionado ? "var(--accent)" : "var(--muted)"} />
                  <span>
                    <span style={{ display: "block", fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{t.label}</span>
                    <span style={{ display: "block", fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{t.detalhe}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ef-card" style={{ padding: 18, marginTop: 14, display: "flex", flexDirection: "column", gap: 10, opacity: carregandoResumo ? 0.6 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#d8d8d8" }}>
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#d8d8d8" }}>
              <span>
                Taxa de entrega
                {tipoEntrega === "delivery" && resumo?.distancia_km != null && (
                  <span style={{ color: "var(--muted)", fontSize: 11 }}> · {Number(resumo.distancia_km).toFixed(1).replace(".", ",")} km</span>
                )}
              </span>
              <span>{taxaEntrega > 0 ? fmt(taxaEntrega) : "Grátis"}</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Total</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "var(--accent)" }}>{fmt(total)}</span>
            </div>
          </div>

          {resumo && !resumo.pode_fechar && resumo.motivo && (
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C", marginTop: 10 }}>{resumo.motivo}</div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="ef-btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={onContinuarComprando}>
              <ShoppingBag size={14} /> CONTINUAR COMPRANDO
            </button>
            <button
              className="ef-btn-solid"
              style={{ flex: 1, opacity: podeFechar ? 1 : 0.5, cursor: podeFechar ? "pointer" : "not-allowed" }}
              onClick={() => podeFechar && onIrParaPagamento(resumo)}
              disabled={!podeFechar || carregandoResumo}
            >
              IR PARA O PAGAMENTO
            </button>
          </div>
        </>
      )}
    </div>
  );
}
