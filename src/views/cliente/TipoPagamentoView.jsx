import React, { useState } from "react";
import { CreditCard, Wallet, Banknote, ArrowLeft } from "lucide-react";
import { pedidos, pagamentos, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

// PIX e Dinheiro aparecem na UI mas ficam desabilitados: o back hoje só
// aceita "cartao" (EscolhaPagamentoIn é Literal["cartao"]).
const METODOS = [
  { valor: "cartao", label: "Cartão de Crédito/Débito", Icon: CreditCard, disponivel: true },
  { valor: "pix", label: "PIX", Icon: Wallet, disponivel: false },
  { valor: "dinheiro", label: "Dinheiro na entrega", Icon: Banknote, disponivel: false },
];

/**
 * Escolha do tipo de pagamento do pedido.
 *
 * Fluxo real (pagamento_controller.py):
 * 1. Cria o pedido — POST /pedidos (proposta, ver pedido_controller.py
 *    que ainda não existe no back).
 * 2. Confirma o método — PUT /pagamentos/pedidos/{id}/metodo.
 * 3. Segue pro formulário do cartão, que processa o pagamento de verdade.
 */
export default function TipoPagamentoView({ sacola, restauranteId, onBack, onPedidoPronto }) {
  const [metodo, setMetodo] = useState("cartao");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const total = Number(sacola?.total || 0);

  const continuar = async () => {
    setErro("");
    if (!restauranteId) {
      setErro("Não encontramos o restaurante do pedido. Volte pro cardápio e tente de novo.");
      return;
    }

    setEnviando(true);
    try {
      const pedido = await pedidos.criar({
        restaurante_id: restauranteId,
        tipo_entrega: "delivery",
        forma_pagamento: "cartao",
        valor_total: total,
        taxa_entrega: 0,
      });
      await pagamentos.escolherTipo(pedido.id, "cartao");
      onPedidoPronto(pedido);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível criar o pedido. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: "0 auto" }}>
      <button onClick={onBack} className="ef-btn-outline" style={{ marginBottom: 14 }}>
        <ArrowLeft size={14} /> VOLTAR
      </button>

      <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 17, color: "#fff", margin: 0 }}>
        FORMA DE PAGAMENTO
      </h1>
      <p style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
        Total do pedido: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{fmt(total)}</span>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {METODOS.map((m) => (
          <button
            key={m.valor}
            onClick={() => m.disponivel && setMetodo(m.valor)}
            disabled={!m.disponivel}
            className="ef-card"
            style={{
              padding: 16, display: "flex", alignItems: "center", gap: 14, textAlign: "left",
              cursor: m.disponivel ? "pointer" : "not-allowed",
              opacity: m.disponivel ? 1 : 0.45,
              border: metodo === m.valor ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: metodo === m.valor ? "var(--hover)" : "var(--card)",
            }}
          >
            <m.Icon size={20} color="var(--accent)" />
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 600, fontSize: 14, color: "#fff", flex: 1 }}>{m.label}</span>
            {!m.disponivel && (
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)" }}>EM BREVE</span>
            )}
          </button>
        ))}
      </div>

      {erro && (
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C", marginTop: 14 }}>{erro}</div>
      )}

      <button className="ef-btn-solid" style={{ marginTop: 18 }} onClick={continuar} disabled={enviando}>
        {enviando ? "CRIANDO PEDIDO..." : "CONTINUAR PARA PAGAMENTO"}
      </button>
    </div>
  );
}