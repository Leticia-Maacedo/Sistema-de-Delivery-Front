import { useState } from "react";
import { Smartphone } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { usuarios, obterUsuarioSalvo, ApiError } from "../../api/client";

export default function CadastroTelefoneView({ onGo }) {
  const [telefone, setTelefone] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [codigo, setCodigo] = useState(["", "", "", ""]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const confirmar = async () => {
    setErro("");
    const usuario = obterUsuarioSalvo();
    if (!usuario) {
      setErro("Sessão expirada. Refaça o cadastro.");
      return onGo("cadastro-dados");
    }
    setCarregando(true);
    try {
      await usuarios.atualizar(usuario.id, { telefone });
      onGo("cadastro-endereco");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto" }}>
      <PageHeader Icon={Smartphone} title="VALIDAÇÃO" subtitle="Cadastro e verificação por celular (autenticação de dois fatores)" />
      <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {!enviado ? (
          <>
            <Field label="NÚMERO DE CELULAR" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            <button className="ef-btn-solid" onClick={() => setEnviado(true)} disabled={!telefone.trim()}>ENVIAR CÓDIGO</button>
          </>
        ) : (
          <>
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)" }}>
              Enviamos um código de 4 dígitos para {telefone}
            </span>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {codigo.map((v, i) => (
                <input key={i} maxLength={1} value={v} onChange={(e) => {
                  const arr = [...codigo]; arr[i] = e.target.value.replace(/\D/g, ""); setCodigo(arr);
                }} className="ef-input" style={{ width: 44, height: 50, textAlign: "center", fontFamily: "'Press Start 2P', monospace", fontSize: 16 }} />
              ))}
            </div>
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
              Não recebeu? <span style={{ color: "var(--accent)", cursor: "pointer" }}>Reenviar código (00:59)</span>
            </span>
            {erro && (
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--bad, #e05c5c)" }}>{erro}</span>
            )}
            <button className="ef-btn-solid" onClick={confirmar} disabled={carregando}>
              {carregando ? "CONFIRMANDO..." : "CONFIRMAR"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
