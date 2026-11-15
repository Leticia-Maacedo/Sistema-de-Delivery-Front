import React, { useState, useEffect, useRef } from "react";
import { Send, BellOff, ExternalLink, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import { notificacoes, ApiError } from "../api/client";

const INTERVALO_MS = 3000;
const LIMITE_MS = 5 * 60 * 1000;

/**
 * Avisos do pedido pelo Telegram (Backlog — envio automático de SMS, WhatsApp, etc.).
 *
 * 1. "RECEBER AVISOS NO TELEGRAM" pede o link do bot com um código de uso
 *    único (POST /notificacoes/telegram/vincular) e abre o Telegram.
 * 2. A pessoa toca em Iniciar; esta tela confere a cada 3 s
 *    (POST /notificacoes/telegram/confirmar) até a conta ficar ligada.
 * Se o link não abrir (computador sem o Telegram instalado), a tela mostra
 * o QR Code do link para ler com o celular e o comando "/start <código>"
 * para mandar ao bot. Some quando o bot não está configurado na API.
 */
export default function AvisosTelegram() {
  const [estado, setEstado] = useState(null); // { disponivel, vinculado }
  const [link, setLink] = useState("");
  const [aguardando, setAguardando] = useState(false);
  const [erro, setErro] = useState("");
  const [qr, setQr] = useState("");
  const [copiado, setCopiado] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    notificacoes.telegram.situacao().then(setEstado).catch(() => setEstado(null));
    return () => clearInterval(timer.current);
  }, []);

  const parar = () => {
    clearInterval(timer.current);
    setAguardando(false);
  };

  const ligar = async () => {
    setErro("");
    try {
      const r = await notificacoes.telegram.vincular();
      setLink(r.link);
      QRCode.toDataURL(r.link, { width: 320, margin: 1 }).then(setQr).catch(() => setQr(""));
      window.open(r.link, "_blank", "noopener");
      setAguardando(true);
      const inicio = Date.now();
      clearInterval(timer.current);
      timer.current = setInterval(async () => {
        try {
          const s = await notificacoes.telegram.confirmar();
          if (s.vinculado) {
            setEstado(s);
            parar();
          } else if (Date.now() - inicio > LIMITE_MS) {
            parar();
            setErro("Não recebemos a confirmação. Gere o link de novo e toque em Iniciar no Telegram.");
          }
        } catch { /* tenta de novo no próximo intervalo */ }
      }, INTERVALO_MS);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível gerar o link do Telegram.");
    }
  };

  const desligar = async () => {
    setErro("");
    try {
      await notificacoes.telegram.desvincular();
      setEstado((s) => ({ ...s, vinculado: false }));
      setLink("");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível desativar.");
    }
  };

  const comando = link ? `/start ${link.split("start=")[1] || ""}` : "";
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(comando);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* sem permissão para a área de transferência */ }
  };

  if (!estado?.disponivel) return null;
  const texto = { fontFamily: "'Exo 2', sans-serif" };
  return (
    <div className="ef-card" style={{ padding: 22, marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={{ ...texto, fontWeight: 700, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
        <Send size={15} color="var(--accent)" /> AVISOS NO TELEGRAM
      </span>
      {estado.vinculado ? (
        <>
          <span style={{ ...texto, fontSize: 12, color: "var(--accent)" }}>Ativo: você recebe no Telegram um aviso a cada etapa dos seus pedidos.</span>
          <button className="ef-btn-outline" style={{ width: "auto", alignSelf: "flex-start" }} onClick={desligar}><BellOff size={14} /> PARAR DE RECEBER</button>
        </>
      ) : (
        <>
          <span style={{ ...texto, fontSize: 12, color: "#d8d8d8" }}>Receba no Telegram um aviso a cada etapa do pedido (aceito, em preparo, saiu para entrega...).</span>
          {aguardando ? (
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              {qr && <img src={qr} width={140} height={140} alt="QR Code do link do bot do Telegram" style={{ borderRadius: 8, background: "#fff", padding: 4 }} />}
              <div style={{ ...texto, fontSize: 12, color: "var(--muted)", display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 220 }}>
                <span>Aguardando você tocar em <b>Iniciar</b> no Telegram...</span>
                <a href={link} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>Abrir o Telegram de novo <ExternalLink size={11} /></a>
                <span>Não abriu? Leia o QR Code com o celular, ou mande ao bot <b>@{link.split("/")[3]?.split("?")[0]}</b> esta mensagem:</span>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <code style={{ color: "#fff", background: "var(--panel)", padding: "4px 8px", borderRadius: 6 }}>{comando}</code>
                  <button className="ef-icon-btn" aria-label="Copiar o comando" onClick={copiar}>{copiado ? <Check size={13} /> : <Copy size={13} />}</button>
                </span>
              </div>
            </div>
          ) : (
            <button className="ef-btn-solid" style={{ width: "auto", alignSelf: "flex-start" }} onClick={ligar}><Send size={14} /> RECEBER AVISOS NO TELEGRAM</button>
          )}
        </>
      )}
      {erro && <span role="alert" style={{ ...texto, fontSize: 12, color: "#E6534C" }}>{erro}</span>}
    </div>
  );
}
