import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Caixa de confirmação no visual do EntregaFood (no lugar do window.confirm).
 *
 * Fecha com Esc ou clicando fora. `perigo` deixa o botão de confirmar em
 * vermelho (ações como cancelar pedido).
 */
export default function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "CONFIRMAR",
  textoCancelar = "VOLTAR",
  perigo = false,
  carregando = false,
  onConfirmar,
  onCancelar,
}) {
  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = (e) => {
      if (e.key === "Escape" && !carregando) onCancelar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto, carregando, onCancelar]);

  if (!aberto) return null;

  const cor = perigo ? "#E6534C" : "var(--accent)";
  const texto = { fontFamily: "'Exo 2', sans-serif" };

  return (
    <div
      role="presentation"
      onClick={() => !carregando && onCancelar()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(2px)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        onClick={(e) => e.stopPropagation()}
        className="ef-card"
        style={{ width: "100%", maxWidth: 400, padding: 24, border: `1px solid ${cor}`, boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AlertTriangle size={22} color={cor} />
          <h2 id="confirm-titulo" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: "#fff", margin: 0, lineHeight: 1.5 }}>
            {titulo}
          </h2>
        </div>
        <p style={{ ...texto, fontSize: 14, color: "#d8d8d8", margin: "16px 0 22px", lineHeight: 1.5 }}>{mensagem}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ef-btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={onCancelar} disabled={carregando} autoFocus>
            {textoCancelar}
          </button>
          <button
            className="ef-btn-solid"
            style={{ flex: 1, background: cor, color: perigo ? "#fff" : "#0D0D0D", opacity: carregando ? 0.7 : 1 }}
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? "AGUARDE..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
