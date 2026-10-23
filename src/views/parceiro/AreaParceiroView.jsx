import React, { useState, useEffect, useCallback } from "react";
import { Store, DollarSign, ClipboardList, Wallet, Package, Pencil, Clock, MapPin, Bike, Power } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import GoogleMapa from "../../components/GoogleMapa";
import { parceiro, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const hora = (h) => (h ? h.slice(0, 5) : "");
const APROVACAO = {
  aprovado: { texto: "Aprovado", cor: "var(--accent)", ajuda: "Seu restaurante aparece para os clientes." },
  pendente: { texto: "Aguardando aprovação", cor: "#F2C94C", ajuda: "Os clientes só veem o restaurante depois que a plataforma aprovar o cadastro." },
  recusado: { texto: "Recusado", cor: "#E6534C", ajuda: "O cadastro foi recusado pela plataforma. Revise os dados e fale com o suporte." },
};

/**
 * Meu restaurante (Portal do Parceiro) — GET /parceiro/restaurante e
 * /parceiro/resumo.
 *
 * Mostra o restaurante do dono logado direto do back (aprovação, aberto
 * ou fechado, horário, raio, endereço no mapa), os números reais do dia e
 * o botão para pausar ou voltar a receber pedidos. Sem restaurante, leva
 * ao cadastro.
 */
export default function AreaParceiroView({ onGo, onEditRestaurante }) {
  const [restaurante, setRestaurante] = useState(undefined);
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState("");
  const [alterando, setAlterando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setRestaurante(await parceiro.restaurante());
      parceiro.resumo().then(setResumo).catch(() => setResumo(null));
      setErro("");
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setRestaurante(null);
      else setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o seu restaurante.");
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const alternarPausa = async () => {
    setAlterando(true);
    setErro("");
    try {
      setRestaurante(await parceiro.alterar({ ativo: !restaurante.ativo }));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível alterar o funcionamento.");
    } finally {
      setAlterando(false);
    }
  };

  const texto = { fontFamily: "'Exo 2', sans-serif" };

  if (restaurante === undefined) {
    return <div style={{ ...texto, color: erro ? "#E6534C" : "var(--muted)" }}>{erro || "Carregando seu restaurante..."}</div>;
  }

  if (restaurante === null) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <PageHeader Icon={Store} title="MEU RESTAURANTE" subtitle="Portal do Parceiro" />
        <div className="ef-card" style={{ padding: 22, marginTop: 18 }}>
          <div style={{ ...texto, fontWeight: 700, fontSize: 15, color: "#fff" }}>Você ainda não cadastrou o seu restaurante</div>
          <p style={{ ...texto, fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
            Cadastre nome, CNPJ, endereço, horário de funcionamento e raio de entrega. Depois da aprovação da plataforma,
            o restaurante aparece para os clientes e você monta o cardápio.
          </p>
          <button className="ef-btn-solid" style={{ marginTop: 10 }} onClick={() => onGo("cadastro-restaurante")}>
            CADASTRAR RESTAURANTE
          </button>
        </div>
      </div>
    );
  }

  const aprovacao = APROVACAO[restaurante.status_aprovacao] || APROVACAO.pendente;
  const raio = restaurante.raio_entrega_km ?? restaurante.raio_padrao_km;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader Icon={Store} title="MEU RESTAURANTE" subtitle="Portal do Parceiro" />

      {erro && <div role="alert" style={{ ...texto, fontSize: 12, color: "#E6534C" }}>{erro}</div>}

      <div className="ef-card" style={{ padding: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ ...texto, fontWeight: 700, fontSize: 17, color: "#fff" }}>{restaurante.nome_fantasia}</span>
            <span
              style={{
                ...texto, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                color: restaurante.aberto ? "#0D0D0D" : "#fff",
                background: restaurante.aberto ? "var(--accent)" : "#5a2a2a",
              }}
            >
              {restaurante.aberto ? "ABERTO AGORA" : restaurante.ativo ? "FECHADO (FORA DO HORÁRIO)" : "PAUSADO"}
            </span>
          </div>
          <div style={{ ...texto, fontSize: 12, color: "var(--muted)", marginTop: 6 }}>CNPJ {restaurante.cnpj}</div>
          <div style={{ ...texto, fontSize: 12, marginTop: 10 }}>
            <span style={{ color: aprovacao.cor, fontWeight: 700 }}>{aprovacao.texto}</span>
            <span style={{ color: "var(--muted)" }}> · {aprovacao.ajuda}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14, ...texto, fontSize: 13, color: "#d8d8d8" }}>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Clock size={14} color="var(--accent)" />
              {restaurante.horario_abertura
                ? `Funciona das ${hora(restaurante.horario_abertura)} às ${hora(restaurante.horario_fechamento)}`
                : "Sem horário definido (aberto enquanto não estiver pausado)"}
            </span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Bike size={14} color="var(--accent)" />
              Entrega até {Number(raio).toFixed(1).replace(".", ",")} km
              {restaurante.raio_entrega_km == null && " (padrão da plataforma)"} · {fmt(restaurante.taxa_entrega_km)}/km
            </span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <MapPin size={14} color="var(--accent)" /> {restaurante.endereco}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button
              className={restaurante.ativo ? "ef-btn-outline" : "ef-btn-solid"}
              style={{ width: "auto", ...(restaurante.ativo ? { color: "#E6534C", borderColor: "#E6534C" } : {}) }}
              onClick={alternarPausa}
              disabled={alterando}
            >
              <Power size={14} /> {restaurante.ativo ? "PAUSAR PEDIDOS" : "VOLTAR A RECEBER PEDIDOS"}
            </button>
            <button className="ef-btn-outline" style={{ width: "auto" }} onClick={() => onEditRestaurante(restaurante.id)}>
              <Pencil size={14} /> EDITAR DADOS, HORÁRIO E RAIO
            </button>
          </div>
        </div>
        <div style={{ flex: "1 1 280px" }}>
          <GoogleMapa ponto={restaurante} altura={220} titulo="Endereço do restaurante" />
        </div>
      </div>

      {resumo && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <StatCard label="PEDIDOS HOJE" value={String(resumo.pedidos_hoje)} delta={`${resumo.aguardando_aceite} aguardando aceite`} Icon={ClipboardList} />
          <StatCard label="FATURAMENTO HOJE" value={fmt(resumo.faturamento_hoje)} delta="sem os cancelados" Icon={DollarSign} />
          <StatCard label="TICKET MÉDIO" value={fmt(resumo.ticket_medio_hoje)} delta="pedidos de hoje" Icon={Wallet} />
          <StatCard label="CARDÁPIO" value={`${resumo.produtos_ativos}/${resumo.produtos_total}`} delta="itens disponíveis" Icon={Package} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <button onClick={() => onGo("painel-entregas")} className="ef-card" style={{ padding: 18, cursor: "pointer", textAlign: "left" }}>
          <ClipboardList size={20} color="var(--accent)" />
          <div style={{ ...texto, fontWeight: 700, fontSize: 13, color: "#fff", marginTop: 10 }}>Pedidos</div>
          <div style={{ ...texto, fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            {resumo ? `${resumo.aguardando_aceite} aguardando aceite · ${resumo.em_andamento} em andamento` : "Aceite e acompanhe os pedidos."}
          </div>
        </button>
        <button onClick={() => onGo("cardapios")} className="ef-card" style={{ padding: 18, cursor: "pointer", textAlign: "left" }}>
          <Package size={20} color="var(--accent)" />
          <div style={{ ...texto, fontWeight: 700, fontSize: 13, color: "#fff", marginTop: 10 }}>Cardápio</div>
          <div style={{ ...texto, fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Inclua pratos, altere preços e ative ou desative itens.</div>
        </button>
      </div>
    </div>
  );
}
