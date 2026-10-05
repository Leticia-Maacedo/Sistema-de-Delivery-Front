import React, { useState } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import Field from "../../components/Field";
import { pagamentos, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

const formatarNumeroCartao = (v) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

const formatarValidade = (v) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

/**
 * Formulário de pagamento com cartão.
 *
 * O número, nome, validade e CVV são só pra UX parecer real — o
 * pagamento_controller.py real NÃO recebe nada disso, só o pedido_id
 * (o processamento é 100% simulado em app/core/pagamento_cartao.py).
 * Por isso a validação aqui é só de formato, não é enviada à API.
 */
export default function FormularioCartaoView({ pedido, onBack, onPagamentoConfirmado }) {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const total = Number(pedido?.valor_total || 0);

  const validar = () => {
    if (numero.replace(/\s/g, "").length !== 16) return "Número do cartão inválido.";
    if (nome.trim().length < 3) return "Informe o nome como está no cartão.";
    if (!/^\d{2}\/\d{2}$/.test(validade)) return "Validade inválida (use MM/AA).";
    if (!/^\d{3,4}$/.test(cvv)) return "CVV inválido.";
    return "";
  };

  const confirmar = async () => {
    const erroValidacao = validar();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    if (!pedido?.id) {
      setErro("Pedido não encontrado. Volte e tente de novo.");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      const pagamento = await pagamentos.pagarComCartao(pedido.id);
      if (pagamento.status === "recusado") {
        setErro("Pagamento recusado. Verifique os dados e tente novamente.");
        return;
      }
      onPagamentoConfirmado(pagamento);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível processar o pagamento. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <button onClick={onBack} className="ef-btn-outline" style={{ marginBottom: 14 }}>
        <ArrowLeft size={14} /> VOLTAR
      </button>

      <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 17, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <CreditCard size={19} color="var(--accent)" /> PAGAR COM CARTÃO
      </h1>
      <p style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
        Total a pagar: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{fmt(total)}</span>
      </p>

      <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <Field
          label="NÚMERO DO CARTÃO"
          placeholder="0000 0000 0000 0000"
          value={numero}
          onChange={(e) => setNumero(formatarNumeroCartao(e.target.value))}
        />
        <Field label="NOME NO CARTÃO" placeholder="Como está impresso no cartão" value={nome} onChange={(e) => setNome(e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="VALIDADE" placeholder="MM/AA" value={validade} onChange={(e) => setValidade(formatarValidade(e.target.value))} />
          <Field
            label="CVV"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </div>

        {erro && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C" }}>{erro}</span>}

        <button className="ef-btn-solid" onClick={confirmar} disabled={enviando}>
          {enviando ? "PROCESSANDO..." : `PAGAR ${fmt(total)}`}
        </button>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
          Ambiente de demonstração — o pagamento é simulado pelo back, nenhum dado do cartão é enviado.
        </span>
      </div>
    </div>
  );
}