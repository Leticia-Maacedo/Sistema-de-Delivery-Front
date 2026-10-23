import React, { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { ativarNotificacoes, desativarNotificacoes, estadoNotificacoes } from "../api/push";

const TEXTO = {
  ativo: "Notificações ativas",
  inativo: "Ativar notificações",
  bloqueado: "Notificações bloqueadas",
  indisponivel: "Notificações indisponíveis",
};

/**
 * Liga/desliga as notificações push deste navegador para o usuário logado
 * (pedido recebido e cada mudança de status). Ver src/api/push.js.
 */
export default function BotaoNotificacoes({ usuarioId }) {
  const [estado, setEstado] = useState("inativo");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    estadoNotificacoes().then(setEstado).catch(() => setEstado("indisponivel"));
  }, [usuarioId]);

  // Mesmo navegador, outro login: reenvia a inscrição para o usuário atual.
  useEffect(() => {
    if (estado === "ativo" && usuarioId) ativarNotificacoes().catch(() => {});
  }, [estado, usuarioId]);

  const alternar = async () => {
    setErro("");
    setOcupado(true);
    try {
      setEstado(estado === "ativo" ? await desativarNotificacoes() : await ativarNotificacoes());
    } catch (e) {
      setErro(e.message || "Não foi possível ativar as notificações.");
      setEstado(await estadoNotificacoes().catch(() => "indisponivel"));
    } finally {
      setOcupado(false);
    }
  };

  const desabilitado = ocupado || estado === "bloqueado" || estado === "indisponivel";
  const Icone = estado === "ativo" ? Bell : BellOff;

  return (
    <div>
      <button
        onClick={alternar}
        disabled={desabilitado}
        title={estado === "bloqueado" ? "Libere as notificações nas configurações do navegador" : undefined}
        style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 8,
          border: `1px solid ${estado === "ativo" ? "var(--accent)" : "var(--border)"}`,
          background: estado === "ativo" ? "var(--hover)" : "transparent",
          color: estado === "ativo" ? "var(--accent)" : "#c7c7c7",
          fontFamily: "'Exo 2', sans-serif", fontSize: 12, cursor: desabilitado ? "not-allowed" : "pointer", opacity: desabilitado ? 0.6 : 1,
        }}
      >
        <Icone size={14} /> {ocupado ? "Aguarde..." : TEXTO[estado]}
      </button>
      {erro && <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10.5, color: "#E6534C", marginTop: 4 }}>{erro}</div>}
    </div>
  );
}
