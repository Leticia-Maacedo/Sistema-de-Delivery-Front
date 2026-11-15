import React, { useState, useEffect, useRef, useCallback } from "react";
import { Megaphone, Maximize2, Minimize2, Volume2, VolumeX, ChefHat, Bike, Store } from "lucide-react";
import { pedidos, ApiError } from "../../api/client";

const INTERVALO_MS = 5000;
const EM_PREPARO = ["aceito", "em_preparacao"];
const PRONTOS = ["pronto_para_retirada", "pronto_para_entrega"];
// Só o primeiro nome do cliente aparece na TV do restaurante.
const primeiroNome = (nome) => (nome || "").trim().split(/\s+/)[0] || "Cliente";

/**
 * Painel de chamada (Backlog — Painel de chamada para o cliente vir buscar o pedido).
 *
 * Tela para uma TV ou monitor no balcão: à esquerda os pedidos em preparo, à
 * direita os prontos (retirada no balcão ou aguardando o entregador). Quando
 * um pedido fica pronto ele pisca em destaque e, com o som ligado, o painel
 * toca um aviso e fala "Pedido número N, pronto para retirada". Atualiza a
 * cada 5 s com GET /pedidos/painel (o restaurante só recebe os pedidos dele).
 */
export default function PainelChamadaView() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState("");
  const [som, setSom] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const [destaque, setDestaque] = useState(null);
  const prontosRef = useRef(null); // ids prontos na última leitura (null = primeira)
  const somRef = useRef(false);
  somRef.current = som;

  const chamar = useCallback((p) => {
    setDestaque(p.id);
    setTimeout(() => setDestaque((d) => (d === p.id ? null : d)), 12000);
    if (!somRef.current) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [880, 660].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.35);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.35 + 0.3);
        o.start(ctx.currentTime + i * 0.35);
        o.stop(ctx.currentTime + i * 0.35 + 0.32);
      });
    } catch { /* sem áudio */ }
    if ("speechSynthesis" in window) {
      const frase = new SpeechSynthesisUtterance(
        `Pedido número ${p.id}, ${primeiroNome(p.cliente_nome)}, ${p.tipo_entrega === "retirada" ? "pronto para retirada" : "pronto para o entregador"}.`,
      );
      frase.lang = "pt-BR";
      setTimeout(() => window.speechSynthesis.speak(frase), 800);
    }
  }, []);

  const carregar = useCallback(async () => {
    try {
      const dados = (await pedidos.painel(false)).filter((p) => EM_PREPARO.includes(p.status) || PRONTOS.includes(p.status));
      const prontos = dados.filter((p) => PRONTOS.includes(p.status));
      if (prontosRef.current) prontos.filter((p) => !prontosRef.current.has(p.id)).forEach(chamar);
      prontosRef.current = new Set(prontos.map((p) => p.id));
      setLista(dados);
      setErro("");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Sem conexão com a API. Tentando de novo...");
    }
  }, [chamar]);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, INTERVALO_MS);
    return () => clearInterval(t);
  }, [carregar]);

  useEffect(() => {
    const aoMudar = () => setTelaCheia(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", aoMudar);
    return () => document.removeEventListener("fullscreenchange", aoMudar);
  }, []);

  const alternarTelaCheia = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.getElementById("painel-chamada")?.requestFullscreen?.();
  };

  const texto = { fontFamily: "'Exo 2', sans-serif" };
  const preparo = (lista || []).filter((p) => EM_PREPARO.includes(p.status));
  const prontos = (lista || []).filter((p) => PRONTOS.includes(p.status));

  const Cartao = ({ p, pronto }) => (
    <div
      className="ef-card"
      style={{
        padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
        border: `2px solid ${pronto ? "var(--accent)" : "var(--border)"}`,
        background: destaque === p.id ? "var(--accent)" : undefined,
        transition: "background .4s",
      }}
    >
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: pronto ? 30 : 22, color: destaque === p.id ? "#0D0D0D" : pronto ? "var(--accent)" : "#fff" }}>
        {p.id}
      </span>
      <span style={{ ...texto, fontSize: pronto ? 22 : 17, fontWeight: 700, color: destaque === p.id ? "#0D0D0D" : "#fff", flex: 1 }}>{primeiroNome(p.cliente_nome)}</span>
      {pronto && (
        <span style={{ ...texto, fontSize: 12, color: destaque === p.id ? "#0D0D0D" : "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
          {p.tipo_entrega === "retirada" ? <><Store size={14} /> BALCÃO</> : <><Bike size={14} /> ENTREGADOR</>}
        </span>
      )}
    </div>
  );

  return (
    <div id="painel-chamada" style={{ background: "var(--bg)", minHeight: telaCheia ? "100vh" : undefined, padding: telaCheia ? 28 : 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <Megaphone size={22} color="var(--accent)" />
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: "#fff", flex: 1 }}>PAINEL DE CHAMADA</span>
        <button className={som ? "ef-btn-solid" : "ef-btn-outline"} style={{ width: "auto" }} onClick={() => setSom((s) => !s)}>
          {som ? <Volume2 size={14} /> : <VolumeX size={14} />} {som ? "SOM LIGADO" : "LIGAR SOM"}
        </button>
        <button className="ef-btn-outline" style={{ width: "auto" }} onClick={alternarTelaCheia}>
          {telaCheia ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {telaCheia ? "SAIR DA TELA CHEIA" : "TELA CHEIA"}
        </button>
      </div>
      {erro && <div role="alert" style={{ ...texto, fontSize: 13, color: "#E6534C", marginBottom: 12 }}>{erro}</div>}
      {lista === null ? (
        <div style={{ ...texto, color: "var(--muted)" }}>Carregando pedidos...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 22 }}>
          <section aria-label="Em preparo">
            <h2 style={{ ...texto, fontSize: 16, color: "var(--muted)", letterSpacing: 2, display: "flex", alignItems: "center", gap: 8 }}><ChefHat size={18} /> EM PREPARO</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {preparo.length === 0 ? <span style={{ ...texto, color: "var(--muted)" }}>Nenhum pedido em preparo.</span> : preparo.map((p) => <Cartao key={p.id} p={p} />)}
            </div>
          </section>
          <section aria-label="Pronto">
            <h2 style={{ ...texto, fontSize: 16, color: "var(--accent)", letterSpacing: 2, display: "flex", alignItems: "center", gap: 8 }}><Megaphone size={18} /> PRONTO — PODE RETIRAR</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {prontos.length === 0 ? <span style={{ ...texto, color: "var(--muted)" }}>Nenhum pedido pronto.</span> : prontos.map((p) => <Cartao key={p.id} p={p} pronto />)}
            </div>
          </section>
        </div>
      )}
      <p style={{ ...texto, fontSize: 11, color: "var(--muted)", marginTop: 18 }}>
        Deixe esta tela aberta num monitor do balcão. Os pedidos mudam sozinhos conforme você marca as etapas em Pedidos.
      </p>
    </div>
  );
}
