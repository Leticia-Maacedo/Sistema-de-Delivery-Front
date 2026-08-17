import { useEffect, useState } from "react";
import { Truck, LogOut } from "lucide-react";

import { completarLoginSocial, limparSessao, obterUsuarioSalvo } from "./api/client";

import LoginView from "./views/cliente/LoginView";
import CadastroDadosView from "./views/cliente/CadastroDadosView";
import PerfilView from "./views/cliente/PerfilView";

import "./styles/global.css";

// Sprint 1 é só o domínio Usuário: sem estar logado só existe Login/Cadastro
// (sem menu nenhum); depois de logar, só existe a tela do próprio usuário.
export default function App() {
  const [view, setView] = useState("login");
  const [oauthErro, setOauthErro] = useState("");
  const [cadastroMensagem, setCadastroMensagem] = useState("");
  // Contador "burro" só pra forçar um novo render quando a sessão muda
  // (login, logout, editar perfil) — obterUsuarioSalvo() lê do
  // localStorage, que o React não observa sozinho.
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
        .then(() => notificarSessaoAtualizada())
        .catch(() => setOauthErro("Não foi possível concluir o login social."))
        .finally(() => window.history.replaceState({}, "", window.location.pathname));
    } else if (erro) {
      setOauthErro(erro);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Truck size={18} color="var(--accent)" />
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "var(--accent)" }}>ENTREGAFOOD</span>
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
            <PerfilView aoAtualizarSessao={notificarSessaoAtualizada} />
          </main>
        </>
      ) : (
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          {view === "cadastro-dados" ? (
            <CadastroDadosView onGo={goTo} aoCadastrar={aoCadastrar} />
          ) : (
            <LoginView onGo={goTo} onEntrar={entrar} erroInicial={oauthErro} mensagemInicial={cadastroMensagem} />
          )}
        </main>
      )}
    </div>
  );
}
