import React, { useState, useEffect } from "react";
import { Bell, Search, Store, MapPin } from "lucide-react";
import SeloFuncionamento from "../../components/SeloFuncionamento";
import { CATEGORIES } from "../../data/mockData";
import { exibicaoUsuario } from "../../data/usuarioExibicao";
import { consultas, locais, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const LIMITE = 6;

/** Distância em linha reta (km) entre dois pontos — só para ordenar e mostrar. */
function distanciaKm(a, b) {
  const rad = (g) => (Number(g) * Math.PI) / 180;
  const dLat = rad(b.latitude) - rad(a.latitude);
  const dLon = rad(b.longitude) - rad(a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Página principal do cliente (Explorar).
 * "Perto de você" vem de GET /consultas/restaurantes (só restaurantes
 * aprovados). Com o cliente logado, ordena pela distância até o endereço
 * dele (o último cadastrado, o mesmo que o back usa na taxa de entrega).
 * A busca consulta a API pelo nome do restaurante.
 */
export default function PaginaPrincipalView({ usuario, onGo, onSelectRestaurante }) {
  const { primeiroNome } = exibicaoUsuario(usuario);
  const [busca, setBusca] = useState("");
  const [restaurantes, setRestaurantes] = useState(null);
  const [endereco, setEndereco] = useState(null);
  const [erro, setErro] = useState("");

  // Endereço de entrega do cliente (para ordenar por proximidade).
  useEffect(() => {
    if (!usuario?.id) {
      setEndereco(null);
      return;
    }
    locais
      .listar(usuario.id)
      .then((lista) => {
        const deEntrega = (lista || []).filter((l) => l.tipo !== "restaurante");
        setEndereco(deEntrega[deEntrega.length - 1] || null);
      })
      .catch(() => setEndereco(null));
  }, [usuario?.id]);

  useEffect(() => {
    let ativo = true;
    const timer = setTimeout(() => {
      consultas
        .restaurantes(busca.trim() || undefined)
        .then((dados) => {
          if (!ativo) return;
          setRestaurantes(dados);
          setErro("");
        })
        .catch((e) => {
          if (!ativo) return;
          setRestaurantes([]);
          setErro(e instanceof ApiError ? e.message : "Não foi possível carregar os restaurantes.");
        });
    }, 300); // espera a pessoa parar de digitar
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [busca]);

  const lista = (restaurantes || [])
    .map((r) => ({
      ...r,
      km: endereco && r.local ? distanciaKm(endereco, r.local) : null,
    }))
    .sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity))
    .slice(0, LIMITE);

  const texto = { fontFamily: "'Exo 2', sans-serif" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 15, color: "#fff" }}>
            {primeiroNome ? `Olá, ${primeiroNome}! 👋` : "Olá! 👋"}
          </span>
          <p style={{ ...texto, color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
            Que tal fazer seu dia mais gostoso?
          </p>
        </div>
        <Bell size={18} color="var(--accent)" />
      </div>

      <div className="ef-card" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px" }}>
        <Search size={16} color="var(--muted)" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar restaurantes..."
          aria-label="Buscar restaurantes"
          className="ef-input"
          style={{ border: "none", padding: 0, flex: 1 }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
        {CATEGORIES.map((c, i) => (
          <div
            key={c.key}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 16px",
              borderRadius: 10, flexShrink: 0, background: i === 0 ? "var(--accent)" : "var(--card)", border: "1px solid var(--border)",
            }}
          >
            <c.Icon size={18} color={i === 0 ? "#0D0D0D" : "var(--accent)"} />
            <span style={{ ...texto, fontSize: 10, color: i === 0 ? "#0D0D0D" : "#d8d8d8" }}>{c.label}</span>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...texto, fontWeight: 700, fontSize: 13, color: "#fff" }}>
            {busca.trim() ? `Resultados para "${busca.trim()}"` : "Perto de você"}
          </span>
          <span
            onClick={() => onGo?.("restaurantes-cliente")}
            style={{ ...texto, fontSize: 12, color: "var(--accent)", cursor: "pointer" }}
          >
            Ver todos
          </span>
        </div>

        {erro && <div style={{ ...texto, fontSize: 12, color: "#E6534C", marginTop: 10 }}>{erro}</div>}

        {restaurantes === null ? (
          <div style={{ ...texto, fontSize: 12, color: "var(--muted)", marginTop: 10 }}>Carregando restaurantes...</div>
        ) : lista.length === 0 ? (
          <div style={{ ...texto, fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
            {busca.trim() ? "Nenhum restaurante encontrado com esse nome." : "Nenhum restaurante disponível no momento."}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginTop: 10 }}>
            {lista.map((r) => (
              <div key={r.id} onClick={() => onSelectRestaurante?.(r.id)} className="ef-card ef-card-hover" style={{ overflow: "hidden", cursor: "pointer" }}>
                <div style={{ height: 90, background: "var(--panel)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Store size={30} color="var(--accent)" />
                </div>
                <div style={{ padding: 10 }}>
                  <span style={{ ...texto, fontWeight: 600, fontSize: 12, color: "#fff" }}>{r.nome_fantasia}</span>
                  <div style={{ ...texto, fontSize: 10, color: "var(--muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={10} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.km != null ? `${r.km.toFixed(1).replace(".", ",")} km · ` : ""}{r.local?.endereco}
                    </span>
                  </div>
                  <div style={{ ...texto, fontSize: 10, color: "#d8d8d8", marginTop: 4 }}>
                    Entrega: <span style={{ color: "var(--accent)" }}>{fmt(r.taxa_entrega_km)}/km</span>
                  </div>
                  <div style={{ marginTop: 6 }}><SeloFuncionamento restaurante={r} compacto /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
