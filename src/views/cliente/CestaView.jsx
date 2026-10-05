import React from "react";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import EmptyState from "../../components/EmptyState";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

/**
 * Visualização da Cesta — GET /cesta (feito no App.jsx, aqui só exibe).
 * Toda mutação (+ / - / excluir) devolve a sacola inteira atualizada,
 * então este componente é "burro": só mostra o que recebe em `sacola`
 * e chama os callbacks, sem guardar nenhum estado próprio.
 */
export default function CestaView({ sacola, carregando, erro, onAumentar, onDiminuir, onRemoverItem, onBack, onIrParaPagamento }) {
  if (carregando) {
    return <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando cesta...</div>;
  }

  const itens = sacola?.itens || [];

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

          <div className="ef-card" style={{ padding: 18, marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Total</span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "var(--accent)" }}>{fmt(sacola.total)}</span>
          </div>

          <button className="ef-btn-solid" style={{ marginTop: 14 }} onClick={onIrParaPagamento}>
            IR PARA O PAGAMENTO
          </button>
        </>
      )}
    </div>
  );
}