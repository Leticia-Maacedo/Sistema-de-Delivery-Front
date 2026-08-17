import { useState } from "react";
import { UserCircle, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import {
  usuarios,
  auth,
  limparSessao,
  atualizarUsuarioSalvo,
  obterUsuarioSalvo,
  ApiError,
} from "../../api/client";

export default function PerfilView({ onGo, aoAtualizarSessao }) {
  const usuarioSalvo = obterUsuarioSalvo();

  if (!usuarioSalvo) {
    return (
      <div style={{ maxWidth: 380, margin: "0 auto" }}>
        <PageHeader Icon={UserCircle} title="MEU PERFIL" subtitle="Você precisa entrar para ver seus dados" />
        <button className="ef-btn-solid" onClick={() => onGo("login")}>IR PARA O LOGIN</button>
      </div>
    );
  }

  return <FormularioPerfil usuario={usuarioSalvo} onGo={onGo} aoAtualizarSessao={aoAtualizarSessao} />;
}

function FormularioPerfil({ usuario, onGo, aoAtualizarSessao }) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [telefone, setTelefone] = useState(usuario.telefone || "");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const salvar = async () => {
    setErro("");
    setMensagem("");
    if (nome.trim().length < 3) return setErro("O nome precisa ter pelo menos 3 caracteres.");

    setSalvando(true);
    try {
      await usuarios.atualizar(usuario.id, { nome, email, telefone: telefone || null });
      const usuarioAtualizado = await auth.eu();
      atualizarUsuarioSalvo(usuarioAtualizado);
      aoAtualizarSessao?.();
      setMensagem("Dados atualizados com sucesso.");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async () => {
    const confirmou = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
    );
    if (!confirmou) return;

    setErro("");
    setExcluindo(true);
    try {
      await usuarios.remover(usuario.id);
      limparSessao();
      onGo("inicio-categorias");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível excluir a conta.");
      setExcluindo(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto" }}>
      <PageHeader Icon={UserCircle} title="MEU PERFIL" subtitle="Veja e edite os seus dados" />
      <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="NOME COMPLETO" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Field label="E-MAIL" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="TELEFONE"
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>
          TIPO DE CONTA: {usuario.tipo.toUpperCase()}
        </span>

        {erro && (
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--bad, #e05c5c)" }}>{erro}</span>
        )}
        {mensagem && (
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--good)" }}>{mensagem}</span>
        )}

        <button className="ef-btn-solid" onClick={salvar} disabled={salvando}>
          {salvando ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
        </button>

        <button
          className="ef-btn-outline"
          style={{ borderColor: "var(--bad, #e05c5c)", color: "var(--bad, #e05c5c)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={excluir}
          disabled={excluindo}
        >
          <Trash2 size={14} /> {excluindo ? "EXCLUINDO..." : "EXCLUIR CONTA"}
        </button>
      </div>
    </div>
  );
}
