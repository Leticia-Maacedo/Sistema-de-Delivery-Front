import React from "react";
import { ExternalLink } from "lucide-react";

const coord = (p) => `${Number(p.latitude)},${Number(p.longitude)}`;

/**
 * Mapa do Google Maps embutido (sem chave de API).
 * - Só `ponto`: mostra o local.
 * - `origem` + `destino`: mostra a rota entre os dois.
 * `link` (opcional) abre o Google Maps em outra aba; sem ele, monta um link
 * para o ponto ou para a rota.
 */
export default function GoogleMapa({ ponto, origem, destino, link, altura = 260, titulo = "Mapa" }) {
  const rota = origem && destino;
  if (!rota && !ponto) return null;

  const src = rota
    ? `https://maps.google.com/maps?saddr=${coord(origem)}&daddr=${coord(destino)}&hl=pt-BR&output=embed`
    : `https://maps.google.com/maps?q=${coord(ponto)}&z=16&hl=pt-BR&output=embed`;
  const abrir = link || (rota
    ? `https://www.google.com/maps/dir/?api=1&origin=${coord(origem)}&destination=${coord(destino)}`
    : `https://www.google.com/maps/search/?api=1&query=${coord(ponto)}`);

  return (
    <div>
      <iframe
        title={titulo}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ width: "100%", height: altura, border: "1px solid var(--border)", borderRadius: 10, display: "block", background: "var(--panel)" }}
      />
      <a
        href={abrir}
        target="_blank"
        rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--accent)" }}
      >
        <ExternalLink size={12} /> Abrir no Google Maps
      </a>
    </div>
  );
}
