import { useState } from "react";
import { Truck, Circle, Menu as MenuIcon } from "lucide-react";

import { GROUPS } from "./data/navigation";
import EmptyState from "./components/EmptyState";

import InicioCategoriasView from "./views/cliente/InicioCategoriasView";
import LoginView from "./views/cliente/LoginView";
import CadastroDadosView from "./views/cliente/CadastroDadosView";
import CadastroTelefoneView from "./views/cliente/CadastroTelefoneView";
import CadastroEnderecoView from "./views/cliente/CadastroEnderecoView";
import PaginaPrincipalView from "./views/cliente/PaginaPrincipalView";
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

import "./styles/global.css";

export default function App() {
  const [groupKey, setGroupKey] = useState("cliente");
  const [view, setView] = useState("inicio-categorias");
  const [orderId, setOrderId] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openOrder = (id) => { setOrderId(id); setView("pedido-detalhe"); };
  const goTo = (key) => {
    setView(key);
    const g = GROUPS.find((g) => g.nav.some((n) => n.key === key));
    if (g) setGroupKey(g.key);
  };
  const switchGroup = (key) => {
    setGroupKey(key);
    setView(GROUPS.find((g) => g.key === key).nav[0].key);
  };

  const renderView = () => {
    switch (view) {
      case "inicio-categorias": return <InicioCategoriasView onGo={goTo} />;
      case "login": return <LoginView onGo={goTo} />;
      case "cadastro-dados": return <CadastroDadosView onGo={goTo} />;
      case "cadastro-telefone": return <CadastroTelefoneView onGo={goTo} />;
      case "cadastro-endereco": return <CadastroEnderecoView onGo={goTo} />;
      case "pagina-principal": return <PaginaPrincipalView onGo={goTo} />;
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
      default: return <EmptyState title="EM CONSTRUÇÃO" subtitle="Essa área ainda não foi implementada." />;
    }
  };

  const currentGroup = GROUPS.find((g) => g.key === groupKey);

  return (
    <div style={{ fontFamily: "'Exo 2', sans-serif", minHeight: "100vh", background: "var(--bg)", display: "flex", color: "#fff" }}>
      <aside className={`ef-sidebar${mobileNavOpen ? " open" : ""}`} style={{
        width: 240, background: "var(--panel)", borderRight: "1px solid var(--border)",
        padding: 18, display: "flex", flexDirection: "column", gap: 16, flexShrink: 0,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Truck size={18} color="var(--accent)" />
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "var(--accent)" }}>ENTREGAFOOD</span>
          </div>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)", marginLeft: 26 }}>sistema de delivery</span>
        </div>

        <div style={{ display: "flex", background: "var(--card)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
          {GROUPS.map((g) => (
            <button key={g.key} onClick={() => switchGroup(g.key)} style={{
              flex: 1, padding: "7px 4px", borderRadius: 6, border: "none", cursor: "pointer",
              fontFamily: "'Orbitron', sans-serif", fontSize: 9, letterSpacing: 0.3,
              background: groupKey === g.key ? "var(--accent)" : "transparent",
              color: groupKey === g.key ? "#0D0D0D" : "var(--muted)",
            }}>{g.label}</button>
          ))}
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {currentGroup.nav.map((n) => (
            <button key={n.key} onClick={() => { setView(n.key); setMobileNavOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 6,
                background: view === n.key || (n.key === "pedidos" && view === "pedido-detalhe") ? "var(--hover)" : "transparent",
                border: "none", color: view === n.key ? "var(--accent)" : "#c7c7c7",
                fontFamily: "'Exo 2', sans-serif", fontSize: 12.5, cursor: "pointer", textAlign: "left",
                borderLeft: view === n.key ? "2px solid var(--accent)" : "2px solid transparent",
              }}>
              <n.Icon size={15} /> {n.label}
            </button>
          ))}
        </nav>

        <div className="ef-card" style={{ padding: 12, marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#0D0D0D" }}>L</div>
          <div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#fff" }}>Leticia</div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)" }}>ADMIN</div>
          </div>
        </div>
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--good)", display: "flex", alignItems: "center", gap: 6 }}>
          <Circle size={7} fill="var(--good)" color="var(--good)" /> ONLINE · v1.1.0
        </div>
      </aside>

      <main style={{ flex: 1, padding: "24px 28px", overflowX: "hidden" }}>
        <button className="ef-btn-outline" style={{ marginBottom: 16, display: "none" }} onClick={() => setMobileNavOpen(true)}>
          <MenuIcon size={14} /> MENU
        </button>
        {renderView()}
      </main>
    </div>
  );
}
