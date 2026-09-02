import React, { useState, useEffect } from "react";
import { Truck, ArrowLeft, Search, Bell, MessageCircle } from "lucide-react";

import { NAV_CLIENTE, NAV_CLIENTE_HIDDEN, NAV_PARCEIRO, NAV_ADMIN_SIDEBAR, ADMIN_TITLES } from "./data/navigation";
import { consumeOAuthResultFromQuery, isLoggedIn } from "./api/client";

import InicioCategoriasView from "./views/cliente/InicioCategoriasView";
import LoginView from "./views/cliente/LoginView";
import CadastroDadosView from "./views/cliente/CadastroDadosView";
import CadastroEnderecoView from "./views/cliente/CadastroEnderecoView";
import CadastroTelefoneView from "./views/cliente/CadastroTelefoneView";
import PaginaPrincipalView from "./views/cliente/PaginaPrincipalView";
import RestaurantesListaView from "./views/cliente/RestaurantesListaView";
import CardapioRestauranteView from "./views/cliente/CardapioRestauranteView";
import PagamentoView from "./views/cliente/PagamentoView";
import HistoricoView from "./views/cliente/HistoricoView";

import AreaParceiroView from "./views/parceiro/AreaParceiroView";
import CardapiosView from "./views/parceiro/CardapiosView";
import AvaliacoesView from "./views/parceiro/AvaliacoesView";

import DashboardView from "./views/admin/DashboardView";
import RestaurantesView from "./views/admin/RestaurantesView";
import PedidosView from "./views/admin/PedidosView";
import PedidoDetalheView from "./views/admin/PedidoDetalheView";
import EntregasView from "./views/admin/EntregasView";
import FuncionalidadesView from "./views/admin/FuncionalidadesView";
import EmptyState from "./components/EmptyState";

/* Grupo de links do header (usado pelas seÃ§Ãµes CLIENTE e PARCEIRO) */
function NavGroup({ label, items, view, onGo }) {
  return (
    <div>
      <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)", letterSpacing: 1, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        {items.map((n) => (
          <span
            key={n.key}
            onClick={() => onGo(n.key)}
            style={{
              fontFamily: "'Exo 2', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
              color: view === n.key ? "var(--accent)" : "#d8d8d8",
            }}
          >
            {n.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [groupKey, setGroupKey] = useState("cliente");
  const [view, setView] = useState("inicio-categorias");
  const [orderId, setOrderId] = useState(null);
  const [restauranteId, setRestauranteId] = useState(null);
  const [oauthErro, setOauthErro] = useState("");

  // Ao carregar, verifica se voltamos de um login OAuth (Google/Facebook).
  // O oauth_controller redireciona para "/?oauth_token=<jwt>" (sucesso)
  // ou "/?oauth_erro=<mensagem>" (falha) depois do callback.
  useEffect(() => {
    const { token, erro } = consumeOAuthResultFromQuery();
    if (token) {
      setGroupKey("cliente");
      setView("pagina-principal");
    } else if (erro) {
      setOauthErro(erro);
      setGroupKey("cliente");
      setView("login");
    } else if (isLoggedIn()) {
      setGroupKey("cliente");
      setView("pagina-principal");
    }
  }, []);

  const openOrder = (id) => {
    setOrderId(id);
    setView("pedido-detalhe");
  };

  const openRestaurante = (id) => {
    setRestauranteId(id);
    setView("cardapio-restaurante");
  };

  const goTo = (key) => {
    setView(key);
    if (NAV_CLIENTE.some((n) => n.key === key) || NAV_CLIENTE_HIDDEN.some((n) => n.key === key)) setGroupKey("cliente");
    else if (NAV_PARCEIRO.some((n) => n.key === key)) setGroupKey("parceiro");
    else setGroupKey("admin");
  };

  const renderView = () => {
    switch (view) {
      case "inicio-categorias": return <InicioCategoriasView onGo={goTo} />;
      case "login": return <LoginView onGo={goTo} erroInicial={oauthErro} />;
      case "cadastro-dados": return <CadastroDadosView onGo={goTo} />;
      case "cadastro-telefone": return <CadastroTelefoneView onGo={goTo} />;
      case "cadastro-endereco": return <CadastroEnderecoView onGo={goTo} />;
      case "pagina-principal": return <PaginaPrincipalView onGo={goTo} onSelectRestaurante={openRestaurante} />;
      case "restaurantes-cliente": return <RestaurantesListaView onSelect={openRestaurante} />;
      case "cardapio-restaurante": return <CardapioRestauranteView restauranteId={restauranteId} onBack={() => setView("restaurantes-cliente")} />;
      case "pagamento": return <PagamentoView />;
      case "historico": return <HistoricoView onOpenOrder={openOrder} />;
      case "area-parceiro": return <AreaParceiroView onGo={goTo} />;
      case "cardapios": return <CardapiosView />;
      case "avaliacoes": return <AvaliacoesView />;
      case "dashboard": return <DashboardView onOpenOrder={openOrder} />;
      case "restaurantes": return <RestaurantesView />;
      case "pedidos": return <PedidosView onOpenOrder={openOrder} />;
      case "pedido-detalhe": return <PedidoDetalheView orderId={orderId} onBack={() => setView("pedidos")} />;
      case "entregas": return <EntregasView />;
      case "funcionalidades": return <FuncionalidadesView />;
      default: return <EmptyState title="EM CONSTRUÃ‡ÃƒO" subtitle="Essa Ã¡rea ainda nÃ£o foi implementada." />;
    }
  };

  const isAdmin = groupKey === "admin";
  const adminTitle = ADMIN_TITLES[view] || ADMIN_TITLES.dashboard;

  return (
    <div style={{ minHeight: "100vh" }}>
      {!isAdmin && (
        <header style={{ borderBottom: "1px solid var(--border)", background: "var(--panel)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px" }}>
            <div className="ef-logo" style={{ fontSize: 17 }}>
              ENTREGA<span style={{ color: "var(--accent)" }}>FOOD</span>
            </div>
          </div>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 12px", display: "flex", gap: 28, flexWrap: "wrap" }}>
            <NavGroup label="CLIENTE" items={NAV_CLIENTE} view={view} onGo={goTo} />
            <NavGroup label="PARCEIRO" items={NAV_PARCEIRO} view={view} onGo={goTo} />
          </div>
        </header>
      )}

      {isAdmin ? (
        <div style={{ display: "flex" }}>
          <aside
            style={{
              width: 224, background: "var(--panel)", borderRight: "1px solid var(--border)",
              padding: 18, display: "flex", flexDirection: "column", gap: 16, minHeight: "100vh", flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Truck size={18} color="var(--accent)" />
              <span className="ef-logo" style={{ fontSize: 11 }}>ENTREGAFOOD</span>
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_ADMIN_SIDEBAR.map((n) => (
                <button
                  key={n.key}
                  onClick={() => setView(n.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8,
                    background: view === n.key || (n.key === "pedidos" && view === "pedido-detalhe") ? "var(--accent2-bg)" : "transparent",
                    border: "none", color: view === n.key ? "var(--accent2)" : "#c7c7c7",
                    fontFamily: "'Exo 2', sans-serif", fontSize: 12.5, cursor: "pointer", textAlign: "left",
                  }}
                >
                  <n.Icon size={15} /> {n.label}
                </button>
              ))}
            </nav>
            <button onClick={() => goTo("inicio-categorias")} className="ef-btn-outline" style={{ marginTop: "auto", justifyContent: "center" }}>
              <ArrowLeft size={14} /> SAIR DO ADMIN
            </button>
          </aside>

          <main style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{adminTitle[0]}</span>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>{adminTitle[1]}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="ef-card" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", width: 300 }}>
                  <Search size={14} color="var(--muted)" />
                  <input placeholder="Buscar pedidos, restaurantes, usuÃ¡rios..." className="ef-input" style={{ border: "none", padding: 0, background: "transparent" }} />
                </div>
                <Bell size={17} color="var(--muted)" />
                <MessageCircle size={17} color="var(--muted)" />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>L</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Leticia</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>ADMIN</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: "24px 28px" }}>{renderView()}</div>
          </main>
        </div>
      ) : (
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>{renderView()}</main>
      )}
    </div>
  );
}
