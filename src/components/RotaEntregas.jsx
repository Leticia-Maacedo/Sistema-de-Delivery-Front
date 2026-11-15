import React, { useState } from "react";
import { Route, ExternalLink, MapPin } from "lucide-react";
import { pedidos, ApiError } from "../api/client";
import { melhorRota, totalKm, distanciaKm, linkGoogleMaps } from "../data/rota";

const km = (n) => `${n.toFixed(1).replace(".", ",")} km`;
// Entregas que o entregador ainda vai fazer.
const PENDENTES = ["pronto_para_entrega", "em_transito"];

/**
 * Rota otimizada do entregador (Backlog — caminho mínimo integrado com o Google Maps).
 *
 * Com duas ou mais entregas pendentes, busca o destino de cada uma
 * (GET /pedidos/{id}/rastreio), parte da posição do entregador (ou do
 * restaurante, se a localização não for liberada), calcula a ordem com a
 * menor distância (data/rota.js) e abre o trajeto no Google Maps.
 */
export default function RotaEntregas({ lista }) {
  const [rota, setRota] = useState(null);
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState("");
  const pendentes = (lista || []).filter((p) => p.tipo_entrega === "delivery" && PENDENTES.includes(p.status));
  if (pendentes.length < 2) return null;

  const posicaoAtual = () =>
    new Promise((resolve) => {
      if (!("geolocation" in navigator)) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude, endereco: "Sua posição atual" }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
      );
    });

  const calcular = async () => {
    setCalculando(true);
    setErro("");
    try {
      const rastreios = await Promise.all(pendentes.map((p) => pedidos.rastreio(p.id)));
      const paradas = rastreios.filter((r) => r.destino).map((r) => ({ ...r.destino, pedidoId: r.pedido_id }));
      if (paradas.length < 2) throw new Error("Menos de duas entregas têm endereço com coordenadas.");
      const origem = (await posicaoAtual()) || { ...rastreios[0].restaurante, endereco: `Restaurante ${rastreios[0].restaurante_nome || ""}`.trim() };
      const ordem = melhorRota(origem, paradas);
      setRota({ origem, ordem, total: totalKm(origem, ordem), naOrdemDaLista: totalKm(origem, paradas) });
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : e.message || "Não foi possível calcular a rota.");
    } finally {
      setCalculando(false);
    }
  };

  const texto = { fontFamily: "'Exo 2', sans-serif" };
  return (
    <div className="ef-card" style={{ padding: 14, marginBottom: 14, border: "1px solid var(--accent)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Route size={16} color="var(--accent)" />
        <span style={{ ...texto, fontSize: 13, color: "#fff", flex: 1 }}>
          {pendentes.length} entregas pendentes — calcule a ordem com o menor caminho.
        </span>
        <button className="ef-btn-solid" onClick={calcular} disabled={calculando} style={{ width: "auto" }}>
          {calculando ? "CALCULANDO..." : "ROTA OTIMIZADA"}
        </button>
      </div>
      {erro && <div role="alert" style={{ ...texto, fontSize: 12, color: "#E6534C", marginTop: 8 }}>{erro}</div>}
      {rota && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ ...texto, fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={12} /> Saída: {rota.origem.endereco}
          </div>
          {rota.ordem.map((p, i) => (
            <div key={p.pedidoId} style={{ ...texto, fontSize: 13, color: "#d8d8d8" }}>
              <b style={{ color: "var(--accent)" }}>{i + 1}º</b> Pedido #{p.pedidoId} · {p.endereco || "endereço do cliente"}
              <span style={{ color: "var(--muted)", fontSize: 11 }}> · {km(distanciaKm(i === 0 ? rota.origem : rota.ordem[i - 1], p))}</span>
            </div>
          ))}
          <div style={{ ...texto, fontSize: 12, color: "#fff", marginTop: 4 }}>
            Total: <b>{km(rota.total)}</b> em linha reta
            {rota.naOrdemDaLista - rota.total > 0.05 && <span style={{ color: "var(--accent)" }}> · {km(rota.naOrdemDaLista - rota.total)} a menos que na ordem da lista</span>}
          </div>
          <a href={linkGoogleMaps(rota.origem, rota.ordem)} target="_blank" rel="noreferrer" className="ef-btn-outline"
            style={{ marginTop: 6, width: "auto", alignSelf: "flex-start", textDecoration: "none" }}>
            <ExternalLink size={13} /> ABRIR TRAJETO NO GOOGLE MAPS
          </a>
        </div>
      )}
    </div>
  );
}
