import React, { useEffect, useRef, useState } from "react";
import { X, Camera, Keyboard } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats as F } from "html5-qrcode";

const FORMATOS = {
  qr: [F.QR_CODE],
  // Códigos de barras de produto: EAN-13 (o mais comum no Brasil), EAN-8, UPC e Code 128.
  barras: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128],
};

/**
 * Leitor pela câmera (Backlog — Leitor de QR Code e Leitor de código de barras).
 *
 * Abre a câmera traseira do celular (ou a webcam) e chama `onLido(texto)` na
 * primeira leitura. Usa a biblioteca html5-qrcode, que funciona também nos
 * navegadores sem o BarcodeDetector nativo (Chrome/Edge no Windows, Firefox).
 * Sem câmera ou com a permissão negada, mostra o motivo e deixa digitar.
 */
export default function LeitorCodigo({ tipo = "qr", titulo, onLido, onFechar }) {
  const idRef = useRef(`leitor-${Math.random().toString(36).slice(2)}`);
  const leitorRef = useRef(null);
  const [erro, setErro] = useState("");
  const [digitado, setDigitado] = useState("");

  useEffect(() => {
    let ativo = true;
    // useBarCodeDetectorIfSupported: no Android usa o leitor nativo do navegador (mais rápido).
    const leitor = new Html5Qrcode(idRef.current, {
      formatsToSupport: FORMATOS[tipo], verbose: false, experimentalFeatures: { useBarCodeDetectorIfSupported: true },
    });
    leitorRef.current = leitor;
    leitor
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          // Área de leitura proporcional à câmera: quadrada para o QR, larga e baixa para o código de barras.
          qrbox: (w, h) => (tipo === "qr"
            ? { width: Math.floor(Math.min(w, h) * 0.7), height: Math.floor(Math.min(w, h) * 0.7) }
            : { width: Math.floor(w * 0.92), height: Math.floor(h * 0.5) }),
        },
        (texto) => {
          if (!ativo) return;
          ativo = false;
          leitor.stop().catch(() => {}).finally(() => onLido(texto.trim()));
        },
        () => {}, // quadro sem código: continua procurando
      )
      .catch((e) => {
        const msg = String(e?.message || e);
        setErro(/Permission|NotAllowed/i.test(msg) ? "Permissão da câmera negada. Libere a câmera no navegador ou digite o código."
          : /NotFound|Requested device not found|no camera/i.test(msg) ? "Nenhuma câmera encontrada. Digite o código."
            : "Não foi possível abrir a câmera. Digite o código.");
      });
    return () => {
      ativo = false;
      if (leitor.isScanning) leitor.stop().catch(() => {});
    };
  }, [tipo, onLido]);

  const texto = { fontFamily: "'Exo 2', sans-serif" };

  return (
    <div role="dialog" aria-modal="true" aria-label={titulo}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="ef-card" style={{ width: "100%", maxWidth: 420, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...texto, fontWeight: 700, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <Camera size={15} color="var(--accent)" /> {titulo}
          </span>
          <button className="ef-icon-btn" aria-label="Fechar leitor" onClick={onFechar}><X size={14} /></button>
        </div>
        <div id={idRef.current} style={{ width: "100%", minHeight: erro ? 0 : 240, borderRadius: 10, overflow: "hidden", background: "#000" }} />
        {erro ? (
          <span role="alert" style={{ ...texto, fontSize: 12, color: "#E6534C" }}>{erro}</span>
        ) : (
          <span style={{ ...texto, fontSize: 11, color: "var(--muted)" }}>
            {tipo === "qr" ? "Aponte a câmera para o QR Code." : "Aponte a câmera para o código de barras da embalagem."}
          </span>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); if (digitado.trim()) onLido(digitado.trim()); }}
          style={{ display: "flex", gap: 8 }}
        >
          <input className="ef-input" value={digitado} onChange={(e) => setDigitado(e.target.value)} placeholder="Ou digite o código"
            aria-label="Digitar o código" style={{ flex: 1 }} />
          <button className="ef-btn-outline" type="submit" style={{ width: "auto", padding: "6px 12px" }}><Keyboard size={13} /> OK</button>
        </form>
      </div>
    </div>
  );
}
