import { useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { auth, salvarSessao, ApiError } from "../../api/client";

export default function LoginView({ onGo }) {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    setErro("");
    setCarregando(true);
    try {
      const { access_token, usuario } = await auth.login(email, senha);
      salvarSessao(access_token, usuario);
      onGo("pagina-principal");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto" }}>
      <PageHeader Icon={LogIn} title="ACESSO" subtitle="Entre na sua conta EntregaFood" />
      <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <Field
          label="E-MAIL"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'Exo 2', sans-serif" }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>SENHA</span>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className="ef-input"
              style={{ width: "100%" }}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button onClick={() => setShowPw((s) => !s)} style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", cursor: "pointer" }}>
              {showPw ? <EyeOff size={15} color="var(--muted)" /> : <Eye size={15} color="var(--muted)" />}
            </button>
          </div>
        </label>
        {erro && (
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--bad, #e05c5c)" }}>{erro}</span>
        )}
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--accent)", cursor: "pointer" }}>Esqueceu sua senha?</span>
        <button className="ef-btn-solid" onClick={entrar} disabled={carregando}>
          {carregando ? "ENTRANDO..." : "ENTRAR"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)" }}>OU CONTINUE COM</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Google", "Facebook", "Apple"].map((s) => (
            <button key={s} className="ef-btn-outline" style={{ flex: 1, justifyContent: "center" }}>{s}</button>
          ))}
        </div>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          Ainda não tem conta? <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => onGo("cadastro-dados")}>CADASTRE-SE</span>
        </span>
      </div>
    </div>
  );
}
