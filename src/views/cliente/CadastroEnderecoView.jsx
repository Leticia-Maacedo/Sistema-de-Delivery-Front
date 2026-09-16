import React, { useState } from "react";
import { MapPin } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { locais, getUsuarioId, ApiError } from "../../api/client";
import { buscarEnderecoPorCep, geocodificarEndereco } from "../../api/geo";

const TIPOS = ["Casa", "Trabalho", "Outro"];

/**
 * Cadastro real de endereço — POST /locais (local_controller).
 * Importante: o local_controller de vocês NÃO usa autenticação — ele
 * espera "usuario_id" explícito no corpo. Por isso pegamos o id do
 * usuário logado em cache (salvo no login/cadastro, ver api/client.js)
 * em vez de depender só do token.
 */
export default function CadastroEnderecoView({ onGo }) {
  const [tipo, setTipo] = useState("Casa");
  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [rua, setRua] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidadeUf, setCidadeUf] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleCepBlur = async () => {
    if (cep.replace(/\D/g, "").length !== 8) return;
    setBuscandoCep(true);
    setErro("");
    try {
      const dados = await buscarEnderecoPorCep(cep);
      setRua(dados.rua);
      setBairro(dados.bairro);
      setCidadeUf(dados.cidade && dados.uf ? `${dados.cidade} - ${dados.uf}` : "");
    } catch (e) {
      setErro(e.message);
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSalvar = async () => {
    setErro("");
    if (!rua.trim() || !numero.trim() || !bairro.trim() || !cidadeUf.trim()) {
      setErro("Preencha o CEP e o número — confira se rua/bairro/cidade vieram certos.");
      return;
    }
    const usuarioId = getUsuarioId();
    if (!usuarioId) {
      setErro("Não encontramos seu usuário logado. Volte e faça login de novo antes de salvar o endereço.");
      return;
    }

    setCarregando(true);
    try {
      const enderecoCompleto = `${rua}, ${numero}${complemento ? " - " + complemento : ""}, ${bairro}, ${cidadeUf}`;
      const { latitude, longitude } = await geocodificarEndereco(enderecoCompleto);
      await locais.criar({ usuario_id: usuarioId, endereco: enderecoCompleto, tipo, latitude, longitude });
      onGo("pagina-principal");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar o endereço. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: "40px auto 0" }}>
      <PageHeader Icon={MapPin} title="ENDEREÇO" subtitle="Cadastro e seleção do endereço de entrega" />
      <div className="ef-card" style={{ padding: 24, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field
            label="CEP"
            placeholder="05435-000"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            onBlur={handleCepBlur}
          />
          <Field label="NÚMERO" placeholder="123" value={numero} onChange={(e) => setNumero(e.target.value)} />
        </div>

        {buscandoCep && (
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>
            Buscando endereço pelo CEP...
          </span>
        )}

        <Field label="RUA" placeholder="Preenchido automaticamente pelo CEP" value={rua} onChange={(e) => setRua(e.target.value)} />
        <Field label="COMPLEMENTO (OPCIONAL)" placeholder="Apto, bloco..." value={complemento} onChange={(e) => setComplemento(e.target.value)} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="BAIRRO" value={bairro} onChange={(e) => setBairro(e.target.value)} />
          <Field label="CIDADE / UF" value={cidadeUf} onChange={(e) => setCidadeUf(e.target.value)} />
        </div>

        <div>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>TIPO DE ENDEREÇO</span>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {TIPOS.map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                style={{
                  flex: 1, padding: "8px 6px", borderRadius: 20, cursor: "pointer",
                  fontFamily: "'Exo 2', sans-serif", fontSize: 12,
                  border: `1px solid ${tipo === t ? "var(--accent)" : "var(--border)"}`,
                  background: tipo === t ? "var(--hover)" : "transparent",
                  color: tipo === t ? "var(--accent)" : "#d8d8d8",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {erro && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C" }}>{erro}</span>}

        <button className="ef-btn-solid" onClick={handleSalvar} disabled={carregando}>
          {carregando ? "SALVANDO..." : "SALVAR ENDEREÇO E CONTINUAR"}
        </button>
      </div>
    </div>
  );
}