import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, CheckCircle2, Circle, KeyRound, RefreshCw, Bike, Store, XCircle } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import GoogleMapa from "../../components/GoogleMapa";
import { pedidos, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const hora = (iso) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

// Enquanto o pedido não termina, consulta o back de novo a cada 10 s.
const INTERVALO_ATUALIZACAO_MS = 10000;

/**
 * Acompanhar Entrega (Sprint 3) — GET /pedidos/{id}.
 *
 * Mostra a linha do tempo de status que o restaurante/entregador vão
 * avançando no painel, os itens e o código de entrega, que o cliente
 * informa ao entregador (delivery) ou no balcão (retirada).
 */
export default function AcompanharPedidoView({ pedidoId, onBack }) {
  const [pedido, setPedido] = useState(null);
  const [rastreio, setRastreio] = useState(null);
  const [erro, setErro] = useState("");
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    if (!pedidoId) return;
    setAtualizando(true);
    try {
      setPedido(await pedidos.obter(pedidoId));
      // Mapa: restaurante, destino e posição do entregador (GET /pedidos/{id}/rastreio).
      pedidos.rastreio(pedidoId).then(setRastreio).catch(() => setRastreio(null));
      setErro("");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o pedido.");
    } finally {
      setAtualizando(false);
    }
  }, [pedidoId]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!pedido || pedido.finalizado) return undefined;
    const timer = setInterval(carregar, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(timer);
  }, [pedido, carregar]);

  const texto = { fontFamily: "'Exo 2', sans-serif" };

  if (!pedidoId) {
    return <div style={{ ...texto, color: "var(--muted)" }}>Nenhum pedido selecionado.</div>;
  }

  if (!pedido) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <button onClick={onBack} className="ef-btn-outline" style={{ marginBottom: 14 }}>
          <ArrowLeft size={14} /> VOLTAR
        </button>
        <div style={{ ...texto, color: erro ? "#E6534C" : "var(--muted)" }}>{erro || "Carregando pedido..."}</div>
      </div>
    );
  }

  const retirada = pedido.tipo_entrega === "retirada";
  const cancelado = pedido.status === "cancelado";

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <button onClick={onBack} className="ef-btn-outline" style={{ marginBottom: 14 }}>
        <ArrowLeft size={14} /> MEUS PEDIDOS
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#fff", margin: 0 }}>
            PEDIDO #{pedido.id}
          </h1>
          <div style={{ ...texto, fontSize: 13, color: "var(--muted)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
            {retirada ? <Store size={14} /> : <Bike size={14} />}
            {pedido.restaurante_nome || `Restaurante #${pedido.restaurante_id}`} · {retirada ? "Retirada no balcão" : "Entrega"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge status={pedido.status_rotulo} />
          <button onClick={carregar} className="ef-icon-btn" title="Atualizar" aria-label="Atualizar" disabled={atualizando}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {erro && <div style={{ ...texto, fontSize: 12, color: "#E6534C", marginTop: 10 }}>{erro}</div>}

      {pedido.codigo_entrega && !pedido.finalizado && (
        <div className="ef-card" style={{ padding: 18, marginTop: 18, display: "flex", alignItems: "center", gap: 16, border: "1px solid var(--accent)" }}>
          <KeyRound size={26} color="var(--accent)" />
          <div style={{ flex: 1 }}>
            <div style={{ ...texto, fontSize: 12, color: "var(--muted)" }}>CÓDIGO DE ENTREGA</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, color: "var(--accent)", letterSpacing: 6, marginTop: 6 }}>
              {pedido.codigo_entrega}
            </div>
            <div style={{ ...texto, fontSize: 12, color: "#d8d8d8", marginTop: 6 }}>
              {retirada ? "Informe este código no balcão ao retirar o pedido." : "Informe este código ao entregador quando receber o pedido."}
            </div>
          </div>
        </div>
      )}

      {rastreio && (rastreio.restaurante || rastreio.destino) && !pedido.finalizado && (
        <div className="ef-card" style={{ padding: 18, marginTop: 14 }}>
          <div style={{ ...texto, fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
            {rastreio.entregador
              ? `ENTREGADOR A CAMINHO · posição de ${hora(rastreio.entregador.atualizado_em)}`
              : retirada ? "ONDE RETIRAR O PEDIDO" : "TRAJETO DA ENTREGA"}
          </div>
          {retirada ? (
            <GoogleMapa ponto={rastreio.restaurante} link={rastreio.mapa_url} titulo="Local de retirada" />
          ) : (
            <GoogleMapa
              origem={rastreio.entregador || rastreio.restaurante}
              destino={rastreio.destino}
              ponto={rastreio.destino || rastreio.restaurante}
              link={rastreio.mapa_url}
              titulo="Trajeto da entrega"
            />
          )}
        </div>
      )}

      <div className="ef-card" style={{ padding: 18, marginTop: 14 }}>
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {pedido.etapas.map((etapa, i) => {
            const ultima = i === pedido.etapas.length - 1;
            const ehCancelamento = etapa.status === "cancelado";
            const cor = ehCancelamento ? "#E6534C" : etapa.concluida ? "var(--accent)" : "var(--border)";
            const Icone = ehCancelamento ? XCircle : etapa.concluida ? CheckCircle2 : Circle;
            return (
              <li key={etapa.status} style={{ display: "flex", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Icone size={20} color={cor} />
                  {!ultima && (
                    <div style={{ width: 2, flex: 1, minHeight: 22, background: etapa.concluida && !cancelado ? "var(--accent)" : "var(--border)" }} />
                  )}
                </div>
                <div style={{ paddingBottom: ultima ? 0 : 14 }}>
                  <div style={{ ...texto, fontSize: 13, fontWeight: etapa.atual ? 700 : 500, color: etapa.concluida ? "#fff" : "var(--muted)" }}>
                    {etapa.rotulo}
                  </div>
                  {etapa.concluida && etapa.data && (
                    <div style={{ ...texto, fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{hora(etapa.data)}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {!pedido.finalizado && (
          <div style={{ ...texto, fontSize: 11, color: "var(--muted)", marginTop: 14 }}>
            Esta tela se atualiza sozinha a cada 10 segundos.
          </div>
        )}
      </div>

      <div className="ef-card" style={{ padding: 18, marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {pedido.itens.map((item) => (
          <div key={item.produto_id} style={{ ...texto, display: "flex", justifyContent: "space-between", fontSize: 13, color: "#d8d8d8" }}>
            <span>{item.quantidade}x {item.nome}</span><span>{fmt(item.subtotal)}</span>
          </div>
        ))}
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 10, ...texto, fontSize: 13, color: "#d8d8d8", display: "flex", justifyContent: "space-between" }}>
          <span>Taxa de entrega</span><span>{Number(pedido.taxa_entrega) > 0 ? fmt(pedido.taxa_entrega) : "Grátis"}</span>
        </div>
        <div style={{ ...texto, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Total</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: "var(--accent)" }}>{fmt(pedido.valor_total)}</span>
        </div>
        {pedido.pagamento_status && (
          <div style={{ ...texto, fontSize: 11, color: "var(--muted)" }}>Pagamento: {pedido.pagamento_status}</div>
        )}
      </div>
    </div>
  );
}
