import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Plus, Minus, Package } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { produtos, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

/**
 * Visualização de detalhes do produto — GET /produtos/{id}.
 *
 * Recebe o carrinho e as funções de adicionar/remover de fora (mesmo
 * carrinho da tela de cardápio, ver CardapioRestauranteView) pra que a
 * quantidade fique sincronizada entre as duas telas.
 */
export default function ProdutoDetalheView({ produtoId, onBack, carrinho, onAdicionar, onRemover }) {
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setCarregando(true);
    setErro("");
    produtos
      .obter(produtoId)
      .then(setProduto)
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o produto."))
      .finally(() => setCarregando(false));
  }, [produtoId]);

  const qtd = carrinho[produtoId] || 0;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", paddingBottom: qtd > 0 ? 90 : 0 }}>
      <button onClick={onBack} className="ef-btn-outline" style={{ marginBottom: 14 }}>
        <ArrowLeft size={14} /> VOLTAR
      </button>

      {carregando ? (
        <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando produto...</div>
      ) : erro || !produto ? (
        <EmptyState title="PRODUTO NÃO ENCONTRADO" subtitle={erro || "Volte e selecione outro item."} />
      ) : (
        <>
          <div style={{ height: 220, borderRadius: 16, background: "var(--panel)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Package size={56} color="var(--accent)" />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#fff", lineHeight: 1.4 }}>{produto.nome}</span>
            {!produto.disponivel && (
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 10, color: "#E6B43C", border: "1px solid #E6B43C", padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                INDISPONÍVEL
              </span>
            )}
          </div>

          {produto.descricao && (
            <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "#d8d8d8", marginTop: 14, lineHeight: 1.6 }}>
              {produto.descricao}
            </p>
          )}

          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: "var(--accent)", marginTop: 20 }}>
            {fmt(produto.preco)}
          </div>

          {produto.disponivel && (
            <div className="ef-card" style={{ padding: 18, marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Quantidade</span>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button onClick={() => onRemover(produto.id)} className="ef-icon-btn" disabled={qtd === 0} style={{ opacity: qtd === 0 ? 0.4 : 1 }}>
                  <Minus size={16} />
                </button>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#fff", minWidth: 20, textAlign: "center" }}>{qtd}</span>
                <button onClick={() => onAdicionar(produto.id)} className="ef-icon-btn" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {qtd > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "14px 16px", background: "linear-gradient(transparent, var(--bg) 30%)" }}>
          <button className="ef-btn-solid" style={{ maxWidth: 640, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><ShoppingCart size={16} /> Ver carrinho ({qtd})</span>
            <span>{fmt(qtd * Number(produto?.preco || 0))}</span>
          </button>
        </div>
      )}
    </div>
  );
}