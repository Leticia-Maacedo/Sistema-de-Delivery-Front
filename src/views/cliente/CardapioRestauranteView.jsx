import React, { useState, useMemo } from "react";
import { ArrowLeft, Heart, Star, Clock, ShoppingCart, Plus, Minus } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { RESTAURANTS, MENUS_POR_RESTAURANTE, fmt } from "../../data/mockData";

const TABS = [
  { key: "cardapio", label: "Cardápio" },
  { key: "avaliacoes", label: "Avaliações" },
  { key: "sobre", label: "Sobre" },
];

/**
 * Tela de cardápio/itens do restaurante — cliente.
 * O carrinho aqui é local (useState), só pra essa tela: some se você sair
 * e voltar. Quando o front tiver um carrinho global, é só levantar esse
 * estado pro App.jsx (ou um contexto) sem mexer no resto do componente.
 */
export default function CardapioRestauranteView({ restauranteId, onBack }) {
  const [tab, setTab] = useState("cardapio");
  const [carrinho, setCarrinho] = useState({}); // { itemId: quantidade }

  const restaurante = RESTAURANTS.find((r) => r.id === restauranteId);
  const secoes = MENUS_POR_RESTAURANTE[restauranteId] || [];

  const todosItens = useMemo(() => secoes.flatMap((s) => s.itens), [secoes]);
  const totalItens = Object.values(carrinho).reduce((s, q) => s + q, 0);
  const totalPreco = useMemo(
    () => todosItens.reduce((soma, it) => soma + (carrinho[it.id] || 0) * it.preco, 0),
    [carrinho, todosItens]
  );

  const adicionar = (id) => setCarrinho((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const remover = (id) =>
    setCarrinho((c) => {
      const atual = (c[id] || 0) - 1;
      const novo = { ...c };
      if (atual <= 0) delete novo[id];
      else novo[id] = atual;
      return novo;
    });

  if (!restaurante) {
    return <EmptyState title="RESTAURANTE NÃO ENCONTRADO" subtitle="Volte e escolha um restaurante da lista." />;
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: totalItens > 0 ? 90 : 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button onClick={onBack} className="ef-btn-outline"><ArrowLeft size={14} /> VOLTAR</button>
        <Heart size={20} color="var(--muted)" />
      </div>

      <div style={{ height: 160, borderRadius: 14, background: "var(--panel)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <restaurante.Icon size={48} color="var(--accent)" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#fff" }}>{restaurante.nome}</span>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{restaurante.cat}</div>
        </div>
        <span style={{
          fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 10, color: "var(--good)",
          border: "1px solid var(--good)", padding: "4px 10px", borderRadius: 20,
        }}>ABERTO</span>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12, fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#d8d8d8" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Star size={13} color="var(--accent)" fill="var(--accent)" /> {restaurante.rating}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Clock size={13} /> {restaurante.tempo}
        </span>
        <span>Frete {fmt(restaurante.frete)}</span>
      </div>

      <div style={{ display: "flex", gap: 24, marginTop: 20, borderBottom: "1px solid var(--border)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: "none", border: "none", cursor: "pointer", paddingBottom: 10,
              fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13,
              color: tab === t.key ? "var(--accent)" : "var(--muted)",
              borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cardapio" && (
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 24 }}>
          {secoes.map((secao) => (
            <div key={secao.categoria}>
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{secao.categoria}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                {secao.itens.map((it) => {
                  const qtd = carrinho[it.id] || 0;
                  return (
                    <div key={it.id} className="ef-card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 600, fontSize: 13, color: "#fff" }}>{it.nome}</div>
                        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{it.desc}</div>
                        <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--accent)", marginTop: 6 }}>{fmt(it.preco)}</div>
                      </div>
                      {qtd === 0 ? (
                        <button
                          onClick={() => adicionar(it.id)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--accent)", color: "#0D0D0D", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        >
                          <Plus size={16} />
                        </button>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <button onClick={() => remover(it.id)} className="ef-icon-btn"><Minus size={14} /></button>
                          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", minWidth: 14, textAlign: "center" }}>{qtd}</span>
                          <button onClick={() => adicionar(it.id)} className="ef-icon-btn" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}><Plus size={14} /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {secoes.length === 0 && (
            <EmptyState title="CARDÁPIO INDISPONÍVEL" subtitle="Esse restaurante ainda não cadastrou os itens do cardápio." />
          )}
        </div>
      )}

      {tab === "avaliacoes" && (
        <div style={{ marginTop: 18 }}>
          <EmptyState title="AVALIAÇÕES" subtitle="Em breve você vai poder ver aqui o que outros clientes acharam desse restaurante." />
        </div>
      )}

      {tab === "sobre" && (
        <div style={{ marginTop: 18 }} className="ef-card">
          <div style={{ padding: 16, fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#d8d8d8", lineHeight: 1.6 }}>
            <strong style={{ color: "#fff" }}>{restaurante.nome}</strong> é especializado em {restaurante.cat.toLowerCase()}.
            Tempo médio de entrega de {restaurante.tempo}, com taxa de {fmt(restaurante.frete)}.
          </div>
        </div>
      )}

      {totalItens > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center",
          padding: "14px 16px", background: "linear-gradient(transparent, var(--bg) 30%)",
        }}>
          <button
            className="ef-btn-solid"
            style={{ maxWidth: 640, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingCart size={16} /> Ver carrinho ({totalItens})
            </span>
            <span>{fmt(totalPreco)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
