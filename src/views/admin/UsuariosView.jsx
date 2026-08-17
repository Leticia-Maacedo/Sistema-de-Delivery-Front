import { useEffect, useMemo, useState } from "react";
import { Users, Pencil, Plus, Trash2, X, Search } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import EmptyState from "../../components/EmptyState";
import { ApiError, usuarios, obterUsuarioSalvo } from "../../api/client";

const TIPOS_DE_CONTA = [
  { valor: "cliente", label: "Cliente" },
  { valor: "entregador", label: "Motoboy" },
  { valor: "restaurante", label: "Restaurante" },
  { valor: "admin", label: "Admin" },
];

const TIPO_LABEL = Object.fromEntries(TIPOS_DE_CONTA.map((t) => [t.valor, t.label]));

export default function UsuariosView() {
  const eu = obterUsuarioSalvo();

  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");

  const [formularioAberto, setFormularioAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState("cliente");
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    try {
      setLista(await usuarios.listar());
    } catch {
      setErro("Não foi possível carregar os usuários da API.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter(
      (u) => u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
    );
  }, [lista, busca]);

  const limparFormulario = () => {
    setFormularioAberto(false);
    setEditandoId(null);
    setNome("");
    setEmail("");
    setSenha("");
    setTelefone("");
    setTipo("cliente");
    setErro("");
  };

  const abrirNovo = () => {
    limparFormulario();
    setFormularioAberto(true);
  };

  const editar = (usuario) => {
    setFormularioAberto(true);
    setEditandoId(usuario.id);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setSenha("");
    setTelefone(usuario.telefone || "");
    setTipo(usuario.tipo);
    setErro("");
    setMensagem("");
  };

  const salvar = async () => {
    setErro("");
    setMensagem("");
    if (nome.trim().length < 3) return setErro("O nome precisa ter pelo menos 3 caracteres.");
    if (!editandoId && senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");

    setSalvando(true);
    try {
      if (editandoId) {
        await usuarios.atualizar(editandoId, { nome, email, telefone: telefone || null, tipo });
        setMensagem("Usuário atualizado com sucesso.");
      } else {
        await usuarios.criar({ nome, email, senha, telefone: telefone || null, tipo });
        setMensagem("Usuário cadastrado com sucesso.");
      }
      limparFormulario();
      await carregar();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar o usuário.");
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
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <PageHeader Icon={Users} title="USUÁRIOS" subtitle="Gerencie as contas cadastradas na plataforma" />

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <div className="ef-card" style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}>
          <Search size={16} color="var(--muted)" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="ef-input"
            style={{ border: "none", padding: 0, flex: 1 }}
          />
        </div>
        <button
          className="ef-btn-solid"
          style={{ width: "auto", padding: "0 18px", display: "flex", alignItems: "center", gap: 6 }}
          onClick={abrirNovo}
        >
          <Plus size={14} /> NOVO USUÁRIO
        </button>
      </div>

      {formularioAberto && (
        <div className="ef-card" style={{ padding: 22, marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "var(--accent)" }}>
              {editandoId ? `EDITANDO USUÁRIO #${editandoId}` : "NOVO USUÁRIO"}
            </span>
            <button className="ef-icon-btn" onClick={limparFormulario}>
              <X size={14} />
            </button>
          </div>

          <Field label="NOME COMPLETO" placeholder="Nome do usuário" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Field label="E-MAIL" placeholder="usuario@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          {!editandoId && (
            <Field label="SENHA" type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} />
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="TELEFONE (OPCIONAL)" placeholder="11999998888" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'Exo 2', sans-serif" }}>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>TIPO DE CONTA</span>
              <select className="ef-input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS_DE_CONTA.map((t) => (
                  <option key={t.valor} value={t.valor}>{t.label}</option>
                ))}
              </select>
            </label>
          </div>

          {erro && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--bad, #e05c5c)" }}>{erro}</span>}
          {mensagem && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--good)" }}>{mensagem}</span>}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="ef-btn-solid" onClick={salvar} disabled={salvando}>
              {salvando ? "SALVANDO..." : editandoId ? "SALVAR ALTERAÇÕES" : "CADASTRAR USUÁRIO"}
            </button>
            <button
              className="ef-btn-outline"
              style={{ width: "auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 6 }}
              onClick={limparFormulario}
            >
              <X size={14} /> CANCELAR
            </button>
          </div>
        </div>
      )}

      {!formularioAberto && erro && (
        <span style={{ display: "block", marginTop: 14, fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--bad, #e05c5c)" }}>{erro}</span>
      )}
      {!formularioAberto && mensagem && (
        <span style={{ display: "block", marginTop: 14, fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--good)" }}>{mensagem}</span>
      )}

      <div style={{ marginTop: 24 }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#fff", letterSpacing: 1 }}>
          USUÁRIOS CADASTRADOS {carregando ? "" : `(${filtrada.length})`}
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {carregando && <span style={{ color: "var(--muted)", fontSize: 13 }}>Carregando...</span>}
          {!carregando && filtrada.length === 0 && (
            <EmptyState title="NENHUM USUÁRIO" subtitle="Não encontramos usuários para essa busca." />
          )}
          {filtrada.map((u) => (
            <div key={u.id} className="ef-card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff" }}>{u.nome}</span>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "var(--hover)", color: "var(--accent)" }}>
                    {(TIPO_LABEL[u.tipo] || u.tipo).toUpperCase()}
                  </span>
                  {eu?.id === u.id && (
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "var(--panel)", color: "var(--muted)" }}>VOCÊ</span>
                  )}
                </div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
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
                  disabled={eu?.id === u.id}
                  title={eu?.id === u.id ? "Você não pode excluir a própria conta por aqui." : "Excluir"}
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
