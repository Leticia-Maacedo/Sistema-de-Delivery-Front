import React, { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { pedidos, isLoggedIn, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const data = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Meus pedidos — GET /pedidos (do mais recente para o mais antigo). */
export default function HistoricoView({ onAcompanhar, onGo }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      setLista([]);
      return;
    }
    pedidos
      .listar()
      .then(setLista)
      .catch((e) => {
        setErro(e instanceof ApiError ? e.message : "Não foi possível carregar seus pedidos.");
        setLista([]);
      });
  }, []);

  const texto = { fontFamily: "'Exo 2', sans-serif" };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <PageHeader Icon={ClipboardList} title="MEUS PEDIDOS" subtitle="Acompanhe seus pedidos e veja os anteriores" />

      {erro && <div style={{ ...texto, fontSize: 12, color: "#E6534C", marginTop: 12 }}>{erro}</div>}

      {lista === null ? (
        <div style={{ ...texto, color: "var(--muted)", marginTop: 18 }}>Carregando pedidos...</div>
      ) : lista.length === 0 ? (
        <div style={{ marginTop: 18 }}>
          <EmptyState
            title="NENHUM PEDIDO"
            subtitle={isLoggedIn() ? "Seus pedidos aparecem aqui depois do pagamento." : "Entre na sua conta para ver seus pedidos."}
          />
          {!isLoggedIn() && (
            <button className="ef-btn-solid" style={{ marginTop: 14 }} onClick={() => onGo("login")}>ENTRAR</button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
          {lista.map((o) => (
            <div key={o.id} className="ef-card" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff" }}>
                  #{o.id} · {o.restaurante_nome || `Restaurante #${o.restaurante_id}`}
                </span>
                <StatusBadge status={o.status_rotulo} />
              </div>
              <div style={{ ...texto, fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                {o.quantidade_itens} {o.quantidade_itens > 1 ? "itens" : "item"} · {o.tipo_entrega === "retirada" ? "Retirada" : "Entrega"} · {data(o.criado_em)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <span style={{ ...texto, fontSize: 13, color: "#fff" }}>{fmt(o.valor_total)}</span>
                <button onClick={() => onAcompanhar(o.id)} className="ef-btn-outline" style={{ padding: "6px 10px", fontSize: 10 }}>
                  {o.status === "entregue" || o.status === "cancelado" ? "DETALHES" : "ACOMPANHAR"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
