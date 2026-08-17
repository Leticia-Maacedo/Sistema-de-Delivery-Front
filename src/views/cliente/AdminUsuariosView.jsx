import { useEffect, useState } from "react";
import { Shield, Pencil, Trash2, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { ApiError, usuarios } from "../../api/client";

const TIPOS = ["cliente", "entregador", "restaurante", "admin"];

export default function AdminUsuariosView() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState("cliente");
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    try {
      setLista(await usuarios.listar());
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const limparFormulario = () => {
    setEditandoId(null);
    setNome("");
    setEmail("");
    setTelefone("");
    setTipo("cliente");
  };

  const editar = (usuario) => {
    setEditandoId(usuario.id);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setTelefone(usuario.telefone || "");
    setTipo(usuario.tipo);
    setErro("");
    setMensagem("");
  };

  const salvar = async () => {
    setErro("");
    setMensagem("");
    if (nome.trim().length < 3) return setErro("O nome precisa ter pelo menos 3 caracteres.");

    setSalvando(true);
    try {
      await usuarios.atualizar(editandoId, { nome, email, telefone: telefone || null, tipo });
      setMensagem("Usuário atualizado com sucesso.");
      limparFormulario();
      await carregar();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (usuario) => {
    if (!window.confirm(`Excluir a conta de "${usuario.nome}"? Essa ação não pode ser desfeita.`)) return;
    setErro("");
    try {
      await usuarios.remover(usuario.id);
      if (editandoId === usuario.id) limparFormulario();
      await carregar();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível excluir o usuário.");
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <PageHeader Icon={Shield} title="USUÁRIOS" subtitle="Consultar, editar e excluir qualquer conta da plataforma" />

      {editandoId && (
        <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "var(--accent)" }}>
            EDITANDO USUÁRIO #{editandoId}
          </span>
          <Field label="NOME COMPLETO" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Field label="E-MAIL" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="TELEFONE" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'Exo 2', sans-serif" }}>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>TIPO DE CONTA</span>
            <select className="ef-input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </label>

          {erro && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--bad, #e05c5c)" }}>{erro}</span>}
          {mensagem && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--good)" }}>{mensagem}</span>}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="ef-btn-solid" onClick={salvar} disabled={salvando}>
              {salvando ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
            </button>
            <button className="ef-btn-outline" style={{ width: "auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 6 }} onClick={limparFormulario}>
              <X size={14} /> CANCELAR
            </button>
          </div>
        </div>
      )}

      {!editandoId && erro && (
        <div className="ef-card" style={{ padding: 16, marginTop: 18 }}>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--bad, #e05c5c)" }}>{erro}</span>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#fff", letterSpacing: 1 }}>
          TODOS OS USUÁRIOS {carregando ? "" : `(${lista.length})`}
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {carregando && <span style={{ color: "var(--muted)", fontSize: 13 }}>Carregando...</span>}
          {!carregando && lista.length === 0 && (
            <span style={{ color: "var(--muted)", fontSize: 13 }}>Nenhum usuário cadastrado.</span>
          )}
          {lista.map((u) => (
            <div key={u.id} className="ef-card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff" }}>{u.nome}</span>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "var(--hover)", color: "var(--accent)" }}>
                    {u.tipo.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                  {u.email}{u.telefone ? ` · ${u.telefone}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button className="ef-btn-outline" style={{ width: "auto", padding: "6px 10px" }} onClick={() => editar(u)}>
                  <Pencil size={14} />
                </button>
                <button
                  className="ef-btn-outline"
                  style={{ width: "auto", padding: "6px 10px", borderColor: "var(--bad, #e05c5c)", color: "var(--bad, #e05c5c)" }}
                  onClick={() => excluir(u)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
