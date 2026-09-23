import React, { useState, useEffect } from "react";
import { Truck, ArrowLeft, Search, Bell, MessageCircle } from "lucide-react";

import { NAV_CLIENTE, NAV_CLIENTE_HIDDEN, NAV_PARCEIRO, NAV_ADMIN_SIDEBAR, ADMIN_TITLES } from "./data/navigation";
import { consumeOAuthResultFromQuery, isLoggedIn } from "./api/client";
import ClientSidebar from "./components/ClientSidebar";
import SystemStatus from "./components/SystemStatus";

import InicioCategoriasView from "./views/cliente/InicioCategoriasView";
import LoginView from "./views/cliente/LoginView";
import CadastroDadosView from "./views/cliente/CadastroDadosView";
import CadastroEnderecoView from "./views/cliente/CadastroEnderecoView";
import PaginaPrincipalView from "./views/cliente/PaginaPrincipalView";
import RestaurantesListaView from "./views/cliente/RestaurantesListaView";
import CardapioRestauranteView from "./views/cliente/CardapioRestauranteView";
import ProdutoDetalheView from "./views/cliente/ProdutoDetalheView";
import PagamentoView from "./views/cliente/PagamentoView";
import HistoricoView from "./views/cliente/HistoricoView";

import AreaParceiroView from "./views/parceiro/AreaParceiroView";
import CadastroRestauranteView from "./views/parceiro/CadastroRestauranteView";
import CardapiosView from "./views/parceiro/CardapiosView";
import AvaliacoesView from "./views/parceiro/AvaliacoesView";

import DashboardView from "./views/admin/DashboardView";
import RestaurantesView from "./views/admin/RestaurantesView";
import PedidosView from "./views/admin/PedidosView";
import PedidoDetalheView from "./views/admin/PedidoDetalheView";
import EntregasView from "./views/admin/EntregasView";
import FuncionalidadesView from "./views/admin/FuncionalidadesView";
import EmptyState from "./components/EmptyState";

export default function App() {
  const [groupKey, setGroupKey] = useState("cliente");
  const [view, setView] = useState("inicio-categorias");
  const [orderId, setOrderId] = useState(null);
  const [restauranteId, setRestauranteId] = useState(null);
  const [editRestauranteId, setEditRestauranteId] = useState(null);
  const [produtoId, setProdutoId] = useState(null);
  const [oauthErro, setOauthErro] = useState("");

  // Carrinho do cliente: { produtoId: quantidade }. Fica aqui (não dentro
  // de CardapioRestauranteView) porque a tela de detalhes do produto
  // precisa ler/alterar o mesmo carrinho quando o usuário navega pra lá
  // e volta — se ficasse só no estado local da tela de cardápio, ele
  // seria perdido a cada troca de tela.
  const [carrinho, setCarrinho] = useState({});

  const adicionarAoCarrinho = (id) => setCarrinho((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removerDoCarrinho = (id) =>
    setCarrinho((c) => {
      const atual = (c[id] || 0) - 1;
      const novo = { ...c };
      if (atual <= 0) delete novo[id];
      else novo[id] = atual;
      return novo;
    });

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

  const openProdutoDetalhe = (id) => {
    setProdutoId(id);
    setView("produto-detalhe");
  };

  // Abre o formulário de restaurante em modo edição (id existente) —
  // usado pelo botão "Editar" na Área do Parceiro. Pra modo criação,
  // basta goTo("cadastro-restaurante") direto, sem passar por aqui.
  const editarRestaurante = (id) => {
    setEditRestauranteId(id);
    setView("cadastro-restaurante");
  };

  const goTo = (key) => {
    // Zera o id de edição sempre que se navega por aqui — evita que um
    // "cadastro-restaurante" acessado direto do menu abra em modo edição
    // por acidente, com o id de uma navegação anterior.
    if (key === "cadastro-restaurante") setEditRestauranteId(null);
    setView(key);
    if (NAV_CLIENTE.some((n) => n.key === key) || NAV_CLIENTE_HIDDEN.some((n) => n.key === key)) setGroupKey("cliente");
    else if (NAV_PARCEIRO.some((n) => n.key === key)) setGroupKey("parceiro");
    else setGroupKey("admin");
  };

  const renderView = () => {
    switch (view) {
      case "inicio-categorias": return <InicioCategoriasView onGo={goTo} />;
      case "login": return <LoginView onGo={goTo} erroInicial={oauthErro} />;
      case "cadastro-dados": return <CadastroDadosView onGo={goTo} aoCadastrar={() => goTo("cadastro-endereco")} />;
      case "cadastro-endereco": return <CadastroEnderecoView onGo={goTo} />;
      case "pagina-principal": return <PaginaPrincipalView onGo={goTo} onSelectRestaurante={openRestaurante} />;
      case "restaurantes-cliente": return <RestaurantesListaView onSelect={openRestaurante} />;
      case "cardapio-restaurante":
        return (
          <CardapioRestauranteView
            restauranteId={restauranteId}
            onBack={() => setView("restaurantes-cliente")}
            onSelectProduto={openProdutoDetalhe}
            carrinho={carrinho}
            onAdicionar={adicionarAoCarrinho}
            onRemover={removerDoCarrinho}
          />
        );
      case "produto-detalhe":
        return (
          <ProdutoDetalheView
            produtoId={produtoId}
            onBack={() => setView("cardapio-restaurante")}
            carrinho={carrinho}
            onAdicionar={adicionarAoCarrinho}
            onRemover={removerDoCarrinho}
          />
        );
      case "pagamento": return <PagamentoView />;
      case "historico": return <HistoricoView onOpenOrder={openOrder} />;
      case "area-parceiro": return <AreaParceiroView onGo={goTo} onEditRestaurante={editarRestaurante} />;
      case "cadastro-restaurante": return <CadastroRestauranteView restauranteId={editRestauranteId} onGo={goTo} />;
      case "cardapios": return <CardapiosView onGo={goTo} />;
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

  const isAdmin = groupKey === "admin";
  const adminTitle = ADMIN_TITLES[view] || ADMIN_TITLES.dashboard;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {isAdmin ? (
        <>
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
                  <input placeholder="Buscar pedidos, restaurantes, usuários..." className="ef-input" style={{ border: "none", padding: 0, background: "transparent" }} />
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
        </>
      ) : (
        <>
          <ClientSidebar view={view} onGo={goTo} />
          <main style={{ flex: 1, position: "relative", padding: "28px 32px" }}>
            {renderView()}
            <SystemStatus />
          </main>
        </>
      )}
    </div>
  );
}