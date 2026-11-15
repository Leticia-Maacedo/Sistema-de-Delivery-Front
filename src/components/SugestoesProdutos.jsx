import React, { useState, useEffect } from "react";
import { Sparkles, Plus } from "lucide-react";
import { consultas } from "../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

/**
 * Sugestões de produtos (Sprint 4) — GET /consultas/restaurantes/{id}/sugestoes.
 *
 * Usado no cardápio e na cesta. Manda os ids que já estão na cesta
 * (`naCesta`): o back devolve primeiro o que costuma ser pedido junto com
 * eles e depois os mais pedidos do restaurante, sem repetir o que já está
 * na cesta e sem itens indisponíveis ou esgotados. O botão + chama
 * `onAdicionar(produtoId)` (o mesmo "+" do cardápio).
 *
 * Sem sugestões (restaurante sem outros itens) ou se a consulta falhar, o
 * bloco simplesmente não aparece: sugestão nunca atrapalha a compra.
 */
export default function SugestoesProdutos({ restauranteId, naCesta = [], onAdicionar, titulo = "Sugestões para você", desabilitado = false }) {
  const [sugestoes, setSugestoes] = useState([]);
  const [adicionando, setAdicionando] = useState(null);
  const chave = [...naCesta].sort((a, b) => a - b).join(",");

  useEffect(() => {
    if (!restauranteId) {
      setSugestoes([]);
      return undefined;
    }
    let ativo = true;
    consultas
      .sugestoes(restauranteId, chave ? chave.split(",").map(Number) : [])
      .then((r) => ativo && setSugestoes(r.sugestoes || []))
      .catch(() => ativo && setSugestoes([]));
    return () => { ativo = false; };
  }, [restauranteId, chave]);

  if (sugestoes.length === 0) return null;

  const texto = { fontFamily: "'Exo 2', sans-serif" };

  const adicionar = async (id) => {
    setAdicionando(id);
    try {
      await onAdicionar(id);
    } finally {
      setAdicionando(null);
    }
  };

  return (
    <section aria-label={titulo} style={{ marginTop: 22 }}>
      <div style={{ ...texto, display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, color: "#fff" }}>
        <Sparkles size={15} color="var(--accent)" /> {titulo}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 10, overflowX: "auto", paddingBottom: 4 }}>
        {sugestoes.map((s) => (
          <div key={s.id} className="ef-card" style={{ padding: 12, minWidth: 180, maxWidth: 220, flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ ...texto, fontWeight: 600, fontSize: 13, color: "#fff" }}>{s.nome}</div>
            <div style={{ ...texto, fontSize: 10.5, color: "var(--muted)", lineHeight: 1.35, flex: 1 }}>{s.motivo}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ ...texto, fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>{fmt(s.preco)}</span>
              {!desabilitado && (
                <button
                  onClick={() => adicionar(s.id)}
                  disabled={adicionando === s.id}
                  aria-label={`Adicionar ${s.nome} à cesta`}
                  style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "var(--accent)", color: "#0D0D0D", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Plus size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
