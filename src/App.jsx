import { useEffect, useState } from "react";
import { Truck, Circle, Menu as MenuIcon, UserCircle } from "lucide-react";

import { GROUPS } from "./data/navigation";
import EmptyState from "./components/EmptyState";
import { completarLoginSocial, obterUsuarioSalvo } from "./api/client";

import InicioCategoriasView from "./views/cliente/InicioCategoriasView";
import LoginView from "./views/cliente/LoginView";
import CadastroDadosView from "./views/cliente/CadastroDadosView";
import CadastroTelefoneView from "./views/cliente/CadastroTelefoneView";
import CadastroEnderecoView from "./views/cliente/CadastroEnderecoView";
import PaginaPrincipalView from "./views/cliente/PaginaPrincipalView";
import PagamentoView from "./views/cliente/PagamentoView";
import HistoricoView from "./views/cliente/HistoricoView";
import PerfilView from "./views/cliente/PerfilView";
import PedidoDetalheView from "./views/admin/PedidoDetalheView";

import "./styles/global.css";

// Sprint 1 cobre só o domínio Usuário — Parceiro e Admin ficam pra
// próximas sprints, então nem aparecem na navegação por enquanto.
const NAV_CLIENTE = [
  ...GROUPS.find((g) => g.key === "cliente").nav,
  { key: "perfil", label: "Meu Perfil", Icon: UserCircle },
];

export default function App() {
  const [view, setView] = useState("inicio-categorias");
  const [orderId, setOrderId] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [oauthErro, setOauthErro] = useState("");
  // Contador "burro" só pra forçar um novo render quando a sessão muda
  // sem trocar de tela (ex: editar o próprio perfil) — obterUsuarioSalvo()
  // lê do localStorage, que o React não observa sozinho.
  const [, setSessaoVersao] = useState(0);
  const notificarSessaoAtualizada = () => setSessaoVersao((v) => v + 1);
  const usuarioLogado = obterUsuarioSalvo();

  // Volta do redirect do Google/Facebook: /?oauth_token=... ou /?oauth_erro=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("oauth_token");
    const erro = params.get("oauth_erro");

    if (token) {
      completarLoginSocial(token)
        .then(() => setView("pagina-principal"))
        .catch(() => setOauthErro("Não foi possível concluir o login social."))
        .finally(() => window.history.replaceState({}, "", window.location.pathname));
    } else if (erro) {
      setOauthErro(erro);
      setView("login");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const openOrder = (id) => { setOrderId(id); setView("pedido-detalhe"); };
  const goTo = (key) => setView(key);

  const renderView = () => {
    switch (view) {
      case "inicio-categorias": return <InicioCategoriasView onGo={goTo} />;
      case "login": return <LoginView onGo={goTo} erroInicial={oauthErro} />;
      case "cadastro-dados": return <CadastroDadosView onGo={goTo} />;
      case "cadastro-telefone": return <CadastroTelefoneView onGo={goTo} />;
      case "cadastro-endereco": return <CadastroEnderecoView onGo={goTo} />;
      case "pagina-principal": return <PaginaPrincipalView onGo={goTo} />;
      case "pagamento": return <PagamentoView />;
      case "historico": return <HistoricoView onOpenOrder={openOrder} />;
      case "perfil": return <PerfilView onGo={goTo} aoAtualizarSessao={notificarSessaoAtualizada} />;
      case "pedido-detalhe": return <PedidoDetalheView orderId={orderId} onBack={() => setView("historico")} />;
      default: return <EmptyState title="EM CONSTRUÇÃO" subtitle="Essa área ainda não foi implementada." />;
    }
  };

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

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_CLIENTE.map((n) => (
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

        <div
          className="ef-card"
          style={{ padding: 12, marginTop: "auto", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => setView(usuarioLogado ? "perfil" : "login")}
        >
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#0D0D0D" }}>
            {usuarioLogado ? usuarioLogado.nome.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#fff" }}>
              {usuarioLogado ? usuarioLogado.nome : "Visitante"}
            </div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)" }}>
              {usuarioLogado ? usuarioLogado.tipo.toUpperCase() : "ENTRAR"}
            </div>
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
