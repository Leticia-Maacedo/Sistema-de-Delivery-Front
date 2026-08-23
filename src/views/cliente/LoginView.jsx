import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Field from "../../components/Field";
import { loginWithGoogle, loginWithFacebook, loginWithPassword } from "../../api/client";

export default function LoginView({ onGo, erroInicial = "" }) {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(erroInicial);
  const [carregando, setCarregando] = useState(false);

  const handleEntrar = async () => {
    setErro("");
    setCarregando(true);
    try {
      await loginWithPassword(email, senha);
      onGo("pagina-principal");
    } catch (e) {
      setErro(e.message || "Não foi possível entrar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto 0" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="ef-logo" style={{ fontSize: 26 }}>
          ENTREGA<span style={{ color: "var(--accent)" }}>FOOD</span>
        </div>
        <p style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)", fontSize: 12, marginTop: 8, letterSpacing: 1 }}>
          SISTEMA DE DELIVERY
        </p>
      </div>
      <div className="ef-card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <Field
          label="E-MAIL OU TELEFONE"
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
            <button
              onClick={() => setShowPw((s) => !s)}
              style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", cursor: "pointer" }}
              type="button"
            >
              {showPw ? <EyeOff size={15} color="var(--muted)" /> : <Eye size={15} color="var(--muted)" />}
            </button>
          </div>
        </label>

        {erro && (
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C" }}>{erro}</span>
        )}

        <button className="ef-btn-solid" onClick={handleEntrar} disabled={carregando}>
          {carregando ? "ENTRANDO..." : "ENTRAR"}
        </button>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--accent)", textAlign: "center", cursor: "pointer" }}>
          Esqueceu sua senha?
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)" }}>OU CONTINUE COM</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="ef-btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={loginWithGoogle}>
            GOOGLE
          </button>
          <button className="ef-btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={loginWithFacebook}>
            FACEBOOK
          </button>
        </div>

        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          Ainda não tem conta?{" "}
          <span
            style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => onGo("cadastro-dados")}
          >
            Cadastre-se
          </span>
        </span>
      </div>
    </div>
  );
}
