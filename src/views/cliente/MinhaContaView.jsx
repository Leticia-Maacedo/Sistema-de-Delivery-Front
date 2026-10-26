import React, { useState, useEffect } from "react";
import { UserCircle, KeyRound, Save, UserX } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { usuarios, fetchUsuarioLogado, saveUsuario, ApiError } from "../../api/client";

const TIPOS = { cliente: "Cliente", restaurante: "Restaurante", entregador: "Entregador", admin: "Administrador" };

function formatarTelefone(valor) {
  const d = (valor || "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

/**
 * Minha conta — alteração dos dados cadastrais e da senha.
 *
 * Dados: GET /auth/eu e PUT /usuarios/{id} (nome, e-mail e telefone;
 * e-mail ou telefone de outra conta volta 409).
 * Senha: PUT /usuarios/{id}/senha, que confere a senha atual.
 * Serve para todos os papéis (cliente, restaurante e entregador).
 */
export default function MinhaContaView({ onUsuarioAtualizado, onContaEncerrada }) {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [msgDados, setMsgDados] = useState(null);
  const [salvandoDados, setSalvandoDados] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirma, setSenhaConfirma] = useState("");
  const [msgSenha, setMsgSenha] = useState(null);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const [confirmandoEncerrar, setConfirmandoEncerrar] = useState(false);
  const [encerrando, setEncerrando] = useState(false);
  const [msgEncerrar, setMsgEncerrar] = useState(null);

  useEffect(() => {
    fetchUsuarioLogado().then((u) => {
      if (!u) return;
      setUsuario(u);
      setNome(u.nome || "");
      setEmail(u.email || "");
      setTelefone(formatarTelefone(u.telefone));
    });
  }, []);

  const salvarDados = async () => {
    setMsgDados(null);
    if (nome.trim().length < 3) return setMsgDados({ erro: true, texto: "O nome precisa ter pelo menos 3 caracteres." });
    const digitos = telefone.replace(/\D/g, "");
    if (digitos && (digitos.length < 10 || digitos.length > 11)) {
      return setMsgDados({ erro: true, texto: "Informe o telefone com DDD (10 ou 11 dígitos)." });
    }
    setSalvandoDados(true);
    try {
      const dados = { nome: nome.trim() };
      if (email.trim()) dados.email = email.trim();
      if (digitos) dados.telefone = digitos;
      const atualizado = await usuarios.atualizar(usuario.id, dados);
      saveUsuario(atualizado);
      setUsuario(atualizado);
      onUsuarioAtualizado?.(atualizado);
      setMsgDados({ erro: false, texto: "Dados atualizados." });
    } catch (e) {
      setMsgDados({ erro: true, texto: e instanceof ApiError ? e.message : "Não foi possível salvar os dados." });
    } finally {
      setSalvandoDados(false);
    }
  };

  const salvarSenha = async () => {
    setMsgSenha(null);
    if (senhaNova.length < 6) return setMsgSenha({ erro: true, texto: "A nova senha precisa ter pelo menos 6 caracteres." });
    if (senhaNova !== senhaConfirma) return setMsgSenha({ erro: true, texto: "A confirmação não confere com a nova senha." });
    setSalvandoSenha(true);
    try {
      await usuarios.alterarSenha(usuario.id, senhaAtual, senhaNova);
      setSenhaAtual(""); setSenhaNova(""); setSenhaConfirma("");
      setMsgSenha({ erro: false, texto: "Senha alterada. Use a nova senha no próximo login." });
    } catch (e) {
      setMsgSenha({ erro: true, texto: e instanceof ApiError ? e.message : "Não foi possível alterar a senha." });
    } finally {
      setSalvandoSenha(false);
    }
  };

  const Mensagem = ({ msg }) =>
    msg && (
      <span role={msg.erro ? "alert" : "status"} style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: msg.erro ? "#E6534C" : "var(--accent)" }}>
        {msg.texto}
      </span>
    );

  // DELETE /usuarios/{id} (RF06): sem histórico a conta é apagada; com pedidos ela é anonimizada.
  const encerrarConta = async () => {
    setEncerrando(true);
    setMsgEncerrar(null);
    try {
      await usuarios.remover(usuario.id);
      onContaEncerrada?.();
    } catch (e) {
      setMsgEncerrar({ erro: true, texto: e instanceof ApiError ? e.message : "Não foi possível encerrar a conta." });
      setEncerrando(false);
    }
  };

  if (!usuario) {
    return <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando seus dados...</div>;
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <PageHeader Icon={UserCircle} title="MINHA CONTA" subtitle={`Conta de ${TIPOS[usuario.tipo] || usuario.tipo}`} />

      <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "var(--muted)", letterSpacing: 1 }}>
          DADOS CADASTRAIS
        </div>
        <Field label="NOME COMPLETO" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Field label="E-MAIL" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="TELEFONE" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} />
        <Mensagem msg={msgDados} />
        <button className="ef-btn-solid" onClick={salvarDados} disabled={salvandoDados}>
          <Save size={14} /> {salvandoDados ? "SALVANDO..." : "SALVAR DADOS"}
        </button>
      </div>

      <div className="ef-card" style={{ padding: 22, marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "var(--muted)", letterSpacing: 1 }}>
          ALTERAR SENHA
        </div>
        <Field label="SENHA ATUAL" type="password" placeholder="Em branco se você entrou pelo Google/Facebook" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
        <Field label="NOVA SENHA" type="password" placeholder="Mínimo de 6 caracteres" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} />
        <Field label="CONFIRMAR NOVA SENHA" type="password" value={senhaConfirma} onChange={(e) => setSenhaConfirma(e.target.value)} />
        <Mensagem msg={msgSenha} />
        <button className="ef-btn-outline" style={{ justifyContent: "center" }} onClick={salvarSenha} disabled={salvandoSenha}>
          <KeyRound size={14} /> {salvandoSenha ? "ALTERANDO..." : "ALTERAR SENHA"}
        </button>
      </div>

      <div className="ef-card" style={{ padding: 22, marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "var(--muted)", letterSpacing: 1 }}>
          ENCERRAR CONTA
        </div>
        <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", margin: 0 }}>
          Seus dados pessoais, endereços e cesta são apagados e você não consegue mais entrar com esta conta.
          Pedidos já feitos continuam no histórico do restaurante, sem o seu nome.
        </p>
        <Mensagem msg={msgEncerrar} />
        {confirmandoEncerrar ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button className="ef-btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={() => setConfirmandoEncerrar(false)} disabled={encerrando}>
              VOLTAR
            </button>
            <button
              className="ef-btn-solid"
              style={{ flex: 1, justifyContent: "center", background: "#E6534C", borderColor: "#E6534C" }}
              onClick={encerrarConta}
              disabled={encerrando}
            >
              <UserX size={14} /> {encerrando ? "ENCERRANDO..." : "CONFIRMAR ENCERRAMENTO"}
            </button>
          </div>
        ) : (
          <button className="ef-btn-outline" style={{ justifyContent: "center", color: "#E6534C", borderColor: "#E6534C" }} onClick={() => setConfirmandoEncerrar(true)}>
            <UserX size={14} /> ENCERRAR MINHA CONTA
          </button>
        )}
      </div>
    </div>
  );
}
