import React, { useState, useEffect, useCallback, useRef } from "react";
import { Truck, Store, Bike, KeyRound, RefreshCw, XCircle, ArrowRight, Navigation } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import { pedidos, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const hora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const INTERVALO_ATUALIZACAO_MS = 10000;
const CANCELAVEIS = ["aguardando_aceite", "aceito"];
// O entregador só vê entregas (não retiradas) prontas para sair, em andamento ou já entregues.
const STATUS_ENTREGADOR = ["pronto_para_entrega", "em_transito", "entregue"];

/**
 * Painel de entregas (Sprint 3 — Acompanhar Entrega).
 *
 * Restaurante, entregador e admin avançam o pedido etapa por etapa
 * (PATCH /pedidos/{id}/status) e concluem com o código que o cliente
 * informa (POST /pedidos/{id}/entrega/confirmar). Quem pode cada etapa
 * é conferido no back (app/core/status_pedido.py): o restaurante aceita,
 * prepara e deixa pronto; o entregador sai para entrega e confirma.
 */
export default function EntregasView({ titulo }) {
  const [lista, setLista] = useState(null);
  const [selId, setSelId] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [incluirFinalizados, setIncluirFinalizados] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);
  // Entregador: compartilha a posição do celular enquanto a entrega está em trânsito.
  const [localizacao, setLocalizacao] = useState({ ativo: false, ultima: null, erro: "" });
  const rastreioRef = useRef({ watchId: null, ultimoEnvio: 0, pedidoId: null });

  const pararLocalizacao = useCallback(() => {
    const r = rastreioRef.current;
    if (r.watchId !== null) navigator.geolocation.clearWatch(r.watchId);
    rastreioRef.current = { watchId: null, ultimoEnvio: 0, pedidoId: null };
    setLocalizacao((l) => ({ ...l, ativo: false }));
  }, []);

  const iniciarLocalizacao = (pedidoId) => {
    if (!("geolocation" in navigator)) {
      setLocalizacao({ ativo: false, ultima: null, erro: "Este navegador não informa a localização." });
      return;
    }
    pararLocalizacao();
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const r = rastreioRef.current;
        const agora = Date.now();
        if (agora - r.ultimoEnvio < 15000) return; // no máximo a cada 15 s
        r.ultimoEnvio = agora;
        try {
          await pedidos.enviarLocalizacao(pedidoId, pos.coords.latitude, pos.coords.longitude);
          setLocalizacao({ ativo: true, ultima: new Date(), erro: "" });
        } catch (e) {
          setLocalizacao((l) => ({ ...l, erro: e instanceof ApiError ? e.message : "Falha ao enviar a localização." }));
        }
      },
      (e) => setLocalizacao({ ativo: false, ultima: null, erro: e.code === 1 ? "Permissão de localização negada." : "Não foi possível obter a localização." }),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
    rastreioRef.current = { watchId, ultimoEnvio: 0, pedidoId };
    setLocalizacao({ ativo: true, ultima: null, erro: "" });
  };

  // Para de enviar ao trocar de pedido, quando a entrega termina ou ao sair da tela.
  useEffect(() => {
    const r = rastreioRef.current;
    if (r.pedidoId && (!detalhe || detalhe.id !== r.pedidoId || detalhe.status !== "em_transito")) pararLocalizacao();
  }, [detalhe, pararLocalizacao]);
  useEffect(() => pararLocalizacao, [pararLocalizacao]);

  const carregarLista = useCallback(async () => {
    try {
      const todos = await pedidos.painel(incluirFinalizados);
      const dados = titulo === "ENTREGAS"
        ? todos.filter((p) => p.tipo_entrega === "delivery" && STATUS_ENTREGADOR.includes(p.status))
        : todos;
      setLista(dados);
      setErro("");
      setSelId((atual) => (atual && dados.some((p) => p.id === atual) ? atual : dados[0]?.id ?? null));
    } catch (e) {
      setLista([]);
      setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o painel.");
    }
  }, [incluirFinalizados, titulo]);

  const carregarDetalhe = useCallback(async (id) => {
    if (!id) {
      setDetalhe(null);
      return;
    }
    try {
      setDetalhe(await pedidos.obter(id));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o pedido.");
    }
  }, []);

  useEffect(() => { carregarLista(); }, [carregarLista]);
  useEffect(() => { setCodigo(""); setAviso(""); carregarDetalhe(selId); }, [selId, carregarDetalhe]);

  useEffect(() => {
    const timer = setInterval(() => {
      carregarLista();
      if (selId) carregarDetalhe(selId);
    }, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(timer);
  }, [carregarLista, carregarDetalhe, selId]);

  const executar = async (acao, mensagem) => {
    setEnviando(true);
    setErro("");
    setAviso("");
    try {
      const atualizado = await acao();
      setDetalhe(atualizado);
      setAviso(mensagem(atualizado));
      setCodigo("");
      await carregarLista();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível atualizar o pedido.");
    } finally {
      setEnviando(false);
    }
  };

  const avancar = () =>
    executar(
      () => pedidos.alterarStatus(detalhe.id, detalhe.proximo_status),
      (p) => `Pedido #${p.id}: ${p.status_rotulo}.`,
    );

  const cancelar = () => {
    if (!window.confirm(`Cancelar o pedido #${detalhe.id}?`)) return;
    executar(() => pedidos.alterarStatus(detalhe.id, "cancelado"), (p) => `Pedido #${p.id} cancelado.`);
  };

  const confirmar = (e) => {
    e.preventDefault();
    executar(() => pedidos.confirmarEntrega(detalhe.id, codigo), (p) => `Pedido #${p.id} entregue!`);
  };

  const texto = { fontFamily: "'Exo 2', sans-serif" };

  if (lista === null) {
    return <div style={{ ...texto, color: "var(--muted)" }}>Carregando painel...</div>;
  }

  const aguardandoCodigo = detalhe && detalhe.proximo_status === "entregue";

  return (
    <div>
      {titulo && (
        <div style={{ marginBottom: 18 }}>
          <PageHeader
            Icon={titulo === "ENTREGAS" ? Truck : Store}
            title={titulo}
            subtitle={titulo === "ENTREGAS" ? "Pedidos prontos para sair e entregas em andamento" : "Pedidos do seu restaurante"}
          />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <label style={{ ...texto, fontSize: 12, color: "#d8d8d8", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={incluirFinalizados} onChange={(e) => setIncluirFinalizados(e.target.checked)} />
          Mostrar entregues e cancelados
        </label>
        <button onClick={carregarLista} className="ef-btn-outline" style={{ padding: "6px 10px", fontSize: 10 }}>
          <RefreshCw size={12} /> ATUALIZAR
        </button>
      </div>

      {erro && <div style={{ ...texto, fontSize: 12, color: "#E6534C", marginBottom: 12 }}>{erro}</div>}
      {aviso && <div style={{ ...texto, fontSize: 12, color: "var(--accent)", marginBottom: 12 }}>{aviso}</div>}

      {lista.length === 0 ? (
        <EmptyState
          title="NENHUM PEDIDO"
          subtitle={erro ? "Entre com um usuário do tipo restaurante, entregador ou admin." : "Não há pedidos em andamento agora."}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 300px) 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lista.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelId(p.id)}
                className="ef-card"
                style={{ padding: 12, cursor: "pointer", textAlign: "left", border: selId === p.id ? "1px solid var(--accent)" : "1px solid var(--border)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ ...texto, fontWeight: 700, fontSize: 12, color: "var(--accent2)" }}>#{p.id}</span>
                  <StatusBadge status={p.status_rotulo} />
                </div>
                <div style={{ ...texto, fontSize: 12, color: "#d8d8d8", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  {p.tipo_entrega === "retirada" ? <Store size={12} /> : <Bike size={12} />}
                  {p.restaurante_nome || `Restaurante #${p.restaurante_id}`} · {hora(p.criado_em)}
                </div>
              </button>
            ))}
          </div>

          {detalhe && (
            <div className="ef-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: "#fff" }}>PEDIDO #{detalhe.id}</span>
                <StatusBadge status={detalhe.status_rotulo} />
              </div>
              <div style={{ ...texto, fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                {detalhe.tipo_entrega === "retirada" ? "Retirada no balcão" : "Entrega no endereço do cliente"} · {fmt(detalhe.valor_total)} · pagamento {detalhe.pagamento_status || "pendente"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
                {detalhe.itens.map((item) => (
                  <div key={item.produto_id} style={{ ...texto, fontSize: 13, color: "#d8d8d8" }}>{item.quantidade}x {item.nome}</div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
                {detalhe.etapas.map((etapa) => (
                  <span
                    key={etapa.status}
                    style={{
                      ...texto, fontSize: 10, padding: "4px 8px", borderRadius: 12,
                      border: `1px solid ${etapa.atual ? "var(--accent)" : "var(--border)"}`,
                      color: etapa.concluida ? "#fff" : "var(--muted)",
                    }}
                  >
                    {etapa.rotulo}
                  </span>
                ))}
              </div>

              {!detalhe.finalizado && (
                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                  {titulo === "ENTREGAS" && detalhe.status === "em_transito" && detalhe.tipo_entrega === "delivery" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className={localizacao.ativo ? "ef-btn-outline" : "ef-btn-solid"}
                        style={{ width: "auto", justifyContent: "center" }}
                        onClick={() => (localizacao.ativo ? pararLocalizacao() : iniciarLocalizacao(detalhe.id))}
                      >
                        <Navigation size={14} /> {localizacao.ativo ? "PARAR DE COMPARTILHAR LOCALIZAÇÃO" : "COMPARTILHAR MINHA LOCALIZAÇÃO"}
                      </button>
                      <span style={{ ...texto, fontSize: 11, color: localizacao.erro ? "#E6534C" : "var(--muted)" }}>
                        {localizacao.erro || (localizacao.ultima
                          ? `Enviada às ${localizacao.ultima.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · o cliente vê no mapa`
                          : localizacao.ativo ? "Obtendo a posição..." : "O cliente acompanha você no mapa.")}
                      </span>
                    </div>
                  )}
                  {aguardandoCodigo ? (
                    <form onSubmit={confirmar} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <KeyRound size={18} color="var(--accent)" />
                      <input
                        className="ef-input"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="Código do cliente"
                        inputMode="numeric"
                        aria-label="Código de entrega informado pelo cliente"
                        style={{ flex: 1, minWidth: 140, letterSpacing: 4 }}
                      />
                      <button className="ef-btn-solid" type="submit" disabled={enviando || codigo.length < 4} style={{ width: "auto" }}>
                        CONFIRMAR ENTREGA
                      </button>
                    </form>
                  ) : (
                    detalhe.proximo_status && (
                      <button className="ef-btn-solid" onClick={avancar} disabled={enviando}>
                        <ArrowRight size={14} /> MARCAR "{detalhe.proximo_status_rotulo.toUpperCase()}"
                      </button>
                    )
                  )}
                  {CANCELAVEIS.includes(detalhe.status) && (
                    <button className="ef-btn-outline" onClick={cancelar} disabled={enviando} style={{ justifyContent: "center", color: "#E6534C", borderColor: "#E6534C" }}>
                      <XCircle size={14} /> CANCELAR PEDIDO
                    </button>
                  )}
                </div>
              )}

              <div style={{ ...texto, fontSize: 11, color: "var(--muted)", marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <Truck size={12} /> Restaurante: aceita, prepara e deixa pronto. Entregador: sai para entrega e confirma com o código.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
