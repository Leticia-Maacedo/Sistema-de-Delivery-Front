import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { conteudoQrEntrega } from "../data/qrEntrega";

/** QR Code do código de entrega, gerado no próprio navegador (nada é enviado para fora). */
export default function QrCodeEntrega({ pedidoId, codigo, tamanho = 132 }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let ativo = true;
    QRCode.toDataURL(conteudoQrEntrega(pedidoId, codigo), { width: tamanho * 2, margin: 1, errorCorrectionLevel: "M" })
      .then((url) => ativo && setSrc(url))
      .catch(() => ativo && setSrc(""));
    return () => { ativo = false; };
  }, [pedidoId, codigo, tamanho]);

  if (!src) return null;
  return (
    <img src={src} width={tamanho} height={tamanho} alt={`QR Code do código de entrega do pedido ${pedidoId}`}
      style={{ borderRadius: 8, background: "#fff", padding: 4, flexShrink: 0 }} />
  );
}
