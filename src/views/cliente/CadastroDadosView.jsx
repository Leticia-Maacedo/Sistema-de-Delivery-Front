import { useState } from "react";
import { UserPlus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { usuarios, ApiError } from "../../api/client";

const TIPOS_DE_CONTA = [
  { valor: "cliente", label: "Cliente" },
  { valor: "entregador", label: "Motoboy" },
  { valor: "restaurante", label: "Restaurante" },
];

export default function CadastroDadosView({ onGo, aoCadastrar }) {
  const [tipo, setTipo] = useState("cliente");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const cadastrar = async () => {
    setErro("");

    if (nome.trim().length < 3) return setErro("O nome precisa ter pelo menos 3 caracteres.");
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== confirmarSenha) return setErro("As senhas não conferem.");

    setCarregando(true);
    try {
      await usuarios.criar({ nome, email, senha, tipo });
      aoCadastrar?.();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto" }}>
      <PageHeader Icon={UserPlus} title="SEUS DADOS" subtitle="Crie sua conta EntregaFood" />
      <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>TIPO DE CONTA</span>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {TIPOS_DE_CONTA.map((t) => (
              <button
                key={t.valor}
                onClick={() => setTipo(t.valor)}
                style={{
                  flex: 1, padding: "8px 6px", borderRadius: 6, cursor: "pointer",
                  fontFamily: "'Exo 2', sans-serif", fontSize: 12,
                  border: `1px solid ${tipo === t.valor ? "var(--accent)" : "var(--border)"}`,
                  background: tipo === t.valor ? "var(--hover)" : "transparent",
                  color: tipo === t.valor ? "var(--accent)" : "#d8d8d8",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <Field label="NOME COMPLETO" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Field label="E-MAIL" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="SENHA" type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <Field label="CONFIRMAR SENHA" type="password" placeholder="••••••••" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
        {erro && (
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--bad, #e05c5c)" }}>{erro}</span>
        )}
        <button className="ef-btn-solid" onClick={cadastrar} disabled={carregando}>
          {carregando ? "CRIANDO CONTA..." : "CONTINUAR"}
        </button>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          Já tem conta? <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => onGo("login")}>ENTRAR</span>
        </span>
      </div>
    </div>
  );
}
