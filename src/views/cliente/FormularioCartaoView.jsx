import React, { useState } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import Field from "../../components/Field";
import { pagamentos, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

const formatarNumeroCartao = (v) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

const formatarCpf = (v) =>
  v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const formatarCep = (v) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

const formatarValidade = (v) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

/**
 * Formulário de pagamento com cartão.
 *
 * POST /pagamentos/cartao: o back repassa o cartão ao Asaas (sandbox) e
 * não grava nada dele. O Asaas também exige CPF, CEP, número do endereço
 * e telefone do titular. Cartão recusado volta com status "recusado" e o
 * motivo em `mensagem`; o cliente pode corrigir e tentar de novo.
 */
export default function FormularioCartaoView({ pedido, onBack, onPagamentoConfirmado }) {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [numeroEndereco, setNumeroEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const total = Number(pedido?.valor_total || 0);

  const validar = () => {
    if (numero.replace(/\s/g, "").length !== 16) return "Número do cartão inválido.";
    if (nome.trim().length < 3) return "Informe o nome como está no cartão.";
    if (!/^\d{2}\/\d{2}$/.test(validade)) return "Validade inválida (use MM/AA).";
    const [mesValidade, anoValidade] = validade.split("/").map(Number);
    if (mesValidade < 1 || mesValidade > 12) return "Mês da validade inválido: use de 01 a 12 (ex.: 05/30).";
    const hoje = new Date();
    if (2000 + anoValidade < hoje.getFullYear() || (2000 + anoValidade === hoje.getFullYear() && mesValidade < hoje.getMonth() + 1)) {
      return "Cartão vencido: confira a validade.";
    }
    if (!/^\d{3,4}$/.test(cvv)) return "CVV inválido.";
    if (cpf.replace(/\D/g, "").length !== 11) return "CPF inválido.";
    if (cep.replace(/\D/g, "").length !== 8) return "CEP inválido.";
    if (!numeroEndereco.trim()) return "Informe o número do endereço.";
    if (telefone.replace(/\D/g, "").length < 10) return "Telefone inválido.";
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
      const [mes, ano] = validade.split("/");
      const pagamento = await pagamentos.pagarComCartao(
        pedido.id,
        { titular: nome.trim(), numero: numero.replace(/\s/g, ""), mes_validade: mes, ano_validade: `20${ano}`, cvv },
        { cpf, cep, numero_endereco: numeroEndereco.trim(), telefone: telefone.replace(/\D/g, "") }
      );
      if (pagamento.status === "recusado") {
        setErro(`Pagamento recusado: ${pagamento.mensagem || "verifique os dados e tente novamente."}`);
        return;
      }
      if (pagamento.status !== "aprovado") {
        setErro("Pagamento em análise. Acompanhe o status no pedido.");
        return;
      }
      onPagamentoConfirmado(pagamento);
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) {
        // Validação da API (formato de algum campo): mensagem em português no lugar da do Pydantic.
        setErro("Confira os dados do cartão (número, validade MM/AA e CVV) e tente novamente.");
      } else {
        setErro(e instanceof ApiError ? e.message : "Não foi possível processar o pagamento. Tente novamente.");
      }
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
        <Field label="CPF DO TITULAR" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatarCpf(e.target.value))} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="CEP" placeholder="00000-000" value={cep} onChange={(e) => setCep(formatarCep(e.target.value))} />
          <Field label="NÚMERO" placeholder="123" value={numeroEndereco} onChange={(e) => setNumeroEndereco(e.target.value.slice(0, 10))} />
        </div>
        <Field
          label="TELEFONE"
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value.replace(/[^\d()\s-]/g, "").slice(0, 16))}
        />

        {erro && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C" }}>{erro}</span>}

        <button className="ef-btn-solid" onClick={confirmar} disabled={enviando}>
          {enviando ? "PROCESSANDO..." : `PAGAR ${fmt(total)}`}
        </button>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
          Ambiente de teste (Asaas sandbox) — nenhuma cobrança real é feita e o cartão não fica salvo.
        </span>
      </div>
    </div>
  );
}