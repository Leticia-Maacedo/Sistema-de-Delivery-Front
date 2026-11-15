import React, { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";

/**
 * Compartilhar o restaurante nas redes sociais (Backlog — Integração com redes sociais).
 *
 * O link leva direto ao cardápio: /?restaurante={id} (o App abre o cardápio
 * depois do login, se a pessoa ainda não estiver logada). No celular usa o
 * compartilhamento do próprio sistema (Web Share API: WhatsApp, Instagram,
 * Telegram...); em qualquer navegador há os botões de WhatsApp, Facebook e X
 * e o "copiar link". A prévia do link (título, descrição e imagem) vem das
 * tags Open Graph do index.html.
 */
export default function CompartilharRestaurante({ restaurante }) {
  const [copiado, setCopiado] = useState(false);
  const url = `${window.location.origin}/?restaurante=${restaurante.id}`;
  const texto = `Peça no ${restaurante.nome_fantasia} pelo EntregaFood:`;
  const redes = [
    { nome: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}` },
    { nome: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { nome: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}` },
  ];

  const nativo = async () => {
    try {
      await navigator.share({ title: `${restaurante.nome_fantasia} no EntregaFood`, text: texto, url });
    } catch { /* a pessoa fechou o compartilhamento */ }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch { /* sem permissão para a área de transferência */ }
  };

  const fonte = { fontFamily: "'Exo 2', sans-serif" };
  const botao = { ...fonte, padding: "5px 10px", fontSize: 11, width: "auto", textDecoration: "none" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 10 }} aria-label="Compartilhar o restaurante">
      <span style={{ ...fonte, fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}><Share2 size={12} /> Compartilhar:</span>
      {typeof navigator !== "undefined" && navigator.share && (
        <button className="ef-btn-outline" style={botao} onClick={nativo}>Compartilhar…</button>
      )}
      {redes.map((r) => (
        <a key={r.nome} className="ef-btn-outline" style={botao} href={r.href} target="_blank" rel="noreferrer">{r.nome}</a>
      ))}
      <button className="ef-btn-outline" style={botao} onClick={copiar}>
        {copiado ? <><Check size={12} /> Link copiado</> : <><Link2 size={12} /> Copiar link</>}
      </button>
    </div>
  );
}
