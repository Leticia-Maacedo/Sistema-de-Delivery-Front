import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Copy, QrCode, RefreshCw } from "lucide-react";
import Field from "../../components/Field";
import { pagamentos, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

const formatarCpf = (v) =>
  v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

// Enquanto o PIX não é pago, consulta o back (que consulta o Asaas) a cada 5 s.
const INTERVALO_CONSULTA_MS = 5000;

/**
 * Pagamento com PIX (Sprint 3 — backlog 18 e 19).
 *
 * 1. POST /pagamentos/pix com o CPF (o Asaas exige) -> QR Code + copia e cola.
 * 2. GET /pagamentos/pedidos/{id} a cada 5 s e no botão "JÁ PAGUEI".
 * 3. Quando o status vira "aprovado", segue para o pedido confirmado.
 *
 * "Simular pagamento" só funciona no Asaas sandbox ou no gateway simulado.
 */
export default function PagamentoPixView({ pedido, onBack, onPagamentoConfirmado }) {
  const [cpf, setCpf] = useState("");
  const [pix, setPix] = useState(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  const total = Number(pedido?.valor_total || 0);

  const tratarPagamento = useCallback(
    (pagamento) => {
      if (pagamento.status === "aprovado") {
        onPagamentoConfirmado(pagamento);
        return;
      }
      if (pagamento.status === "expirado") {
        setErro("O PIX expirou. Gere um novo código.");
        setPix(null);
        return;
      }
      setPix((atual) => ({ ...atual, ...pagamento, pix_qrcode: pagamento.pix_qrcode || atual?.pix_qrcode }));
    },
    [onPagamentoConfirmado]
  );

  const gerar = async () => {
    if (cpf.replace(/\D/g, "").length !== 11) {
      setErro("Informe um CPF válido.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      setPix(await pagamentos.gerarPix(pedido.id, cpf));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível gerar o PIX. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const consultar = useCallback(
    async (manual = false) => {
      if (!pedido?.id) return;
      try {
        const pagamento = await pagamentos.consultar(pedido.id);
        tratarPagamento(pagamento);
        if (manual && pagamento.status === "pendente") setAviso("Ainda não recebemos o pagamento. Tente de novo em instantes.");
      } catch (e) {
        if (manual) setErro(e instanceof ApiError ? e.message : "Não foi possível consultar o pagamento.");
      }
    },
    [pedido, tratarPagamento]
  );

  useEffect(() => {
    if (!pix || pix.status !== "pendente") return undefined;
    const timer = setInterval(() => consultar(false), INTERVALO_CONSULTA_MS);
    return () => clearInterval(timer);
  }, [pix, consultar]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(pix.pix_copia_cola);
      setAviso("Código copiado. Cole no app do seu banco.");
    } catch {
      setAviso("Não foi possível copiar. Selecione o código e copie manualmente.");
    }
  };

  const simular = async () => {
    setErro("");
    try {
      tratarPagamento(await pagamentos.simularPixPago(pedido.id));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível simular o pagamento.");
    }
  };

  const texto = { fontFamily: "'Exo 2', sans-serif" };

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <button onClick={onBack} className="ef-btn-outline" style={{ marginBottom: 14 }}>
        <ArrowLeft size={14} /> VOLTAR
      </button>

      <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 17, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <QrCode size={19} color="var(--accent)" /> PAGAR COM PIX
      </h1>
      <p style={{ ...texto, color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
        Total a pagar: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{fmt(total)}</span>
      </p>

      <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {!pix ? (
          <>
            <Field label="CPF DO PAGADOR" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatarCpf(e.target.value))} />
            <button className="ef-btn-solid" onClick={gerar} disabled={enviando}>
              {enviando ? "GERANDO PIX..." : "GERAR QR CODE"}
            </button>
          </>
        ) : (
          <>
            {pix.pix_qrcode && (
              <img
                src={pix.pix_qrcode}
                alt="QR Code do PIX"
                style={{ width: 220, height: 220, alignSelf: "center", background: "#fff", padding: 8, borderRadius: 8 }}
              />
            )}
            <div style={{ ...texto, fontSize: 11, color: "var(--muted)" }}>PIX COPIA E COLA</div>
            <textarea
              readOnly
              value={pix.pix_copia_cola || ""}
              className="ef-input"
              rows={3}
              style={{ resize: "none", fontSize: 11, wordBreak: "break-all" }}
              onFocus={(e) => e.target.select()}
            />
            <button className="ef-btn-outline" style={{ justifyContent: "center" }} onClick={copiar}>
              <Copy size={14} /> COPIAR CÓDIGO
            </button>
            <button className="ef-btn-solid" onClick={() => consultar(true)}>
              <RefreshCw size={14} /> JÁ PAGUEI
            </button>
            <span style={{ ...texto, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
              Aguardando pagamento — esta tela confere sozinha a cada 5 segundos.
              {pix.pix_expira_em && ` Válido até ${new Date(pix.pix_expira_em).toLocaleString("pt-BR")}.`}
            </span>
            <button className="ef-btn-outline" style={{ justifyContent: "center", fontSize: 10 }} onClick={simular}>
              SIMULAR PAGAMENTO (SANDBOX)
            </button>
          </>
        )}

        {aviso && <span style={{ ...texto, fontSize: 12, color: "var(--accent)" }}>{aviso}</span>}
        {erro && <span style={{ ...texto, fontSize: 12, color: "#E6534C" }}>{erro}</span>}
      </div>
    </div>
  );
}
