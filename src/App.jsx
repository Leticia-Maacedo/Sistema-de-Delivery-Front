import { useState } from "react";
import { Truck, LogOut, User, Package } from "lucide-react";

import { limparSessao, obterUsuarioSalvo } from "./api/client";

import LoginView from "./views/cliente/LoginView";
import CadastroDadosView from "./views/cliente/CadastroDadosView";
import PerfilView from "./views/cliente/PerfilView";
import ProdutosView from "./views/cliente/ProdutosView";

import "./styles/global.css";

const ABAS_LOGADO = [
  { key: "perfil", label: "Meu Perfil", Icon: User },
  { key: "produtos", label: "Produtos", Icon: Package },
];

// Sprint 1 é só o domínio Usuário: sem estar logado só existe Login/Cadastro
// (sem menu nenhum). Depois de logar, só existem as telas do próprio
// usuário e o cadastro de Produtos (extra pedido além do Usuário).
export default function App() {
  const [view, setView] = useState("login");
  const [abaLogada, setAbaLogada] = useState("perfil");
  const [cadastroMensagem, setCadastroMensagem] = useState("");
  // Contador "burro" só pra forçar um novo render quando a sessão muda
  // (login, logout, editar perfil) — obterUsuarioSalvo() lê do
  // localStorage, que o React não observa sozinho.
  const [, setSessaoVersao] = useState(0);
  const notificarSessaoAtualizada = () => setSessaoVersao((v) => v + 1);
  const usuarioLogado = obterUsuarioSalvo();

  const goTo = (key) => setView(key);

  const aoCadastrar = () => {
    setCadastroMensagem("Conta criada com sucesso! Faça login para continuar.");
    setView("login");
  };

  const entrar = () => {
    notificarSessaoAtualizada();
  };

  const sair = () => {
    limparSessao();
    notificarSessaoAtualizada();
    setView("login");
  };

  return (
    <div style={{ fontFamily: "'Exo 2', sans-serif", minHeight: "100vh", background: "var(--bg)", color: "#fff" }}>
      {usuarioLogado ? (
        <>
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 24px", borderBottom: "1px solid var(--border)", background: "var(--panel)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Truck size={18} color="var(--accent)" />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "var(--accent)" }}>ENTREGAFOOD</span>
              </div>
              <nav style={{ display: "flex", gap: 4 }}>
                {ABAS_LOGADO.map((a) => (
                  <button
                    key={a.key}
                    onClick={() => setAbaLogada(a.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6,
                      border: "none", cursor: "pointer", fontFamily: "'Exo 2', sans-serif", fontSize: 12.5,
                      background: abaLogada === a.key ? "var(--hover)" : "transparent",
                      color: abaLogada === a.key ? "var(--accent)" : "#c7c7c7",
                    }}
                  >
                    <a.Icon size={14} /> {a.label}
                  </button>
                ))}
              </nav>
            </div>
            <button
              className="ef-btn-outline"
              style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, width: "auto" }}
              onClick={sair}
            >
              <LogOut size={14} /> SAIR
            </button>
          </header>
          <main style={{ padding: "32px 24px" }}>
            {abaLogada === "produtos" ? (
              <ProdutosView />
            ) : (
              <PerfilView aoAtualizarSessao={notificarSessaoAtualizada} />
            )}
          </main>
        </>
      ) : (
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          {view === "cadastro-dados" ? (
            <CadastroDadosView onGo={goTo} aoCadastrar={aoCadastrar} />
          ) : (
            <LoginView onGo={goTo} onEntrar={entrar} mensagemInicial={cadastroMensagem} />
          )}
        </main>
      )}
    </div>
  );
}
