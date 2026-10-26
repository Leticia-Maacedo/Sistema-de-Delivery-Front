import React, { useState } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import GoogleMapa from "../../components/GoogleMapa";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { locais, getUsuarioId } from "../../api/client";
import { buscarEnderecoPorCep, geocodificarEndereco } from "../../api/geo";

const TIPOS = ["Casa", "Trabalho", "Outro"];

/**
 * Separa o texto salvo ("Rua, 123 - Apto 4, Bairro, Cidade - UF") nos
 * campos do formulário, para alterar um endereço existente.
 */
export function separarEndereco(texto = "") {
  const partes = texto.split(", ");
  if (partes.length < 4) return { rua: texto, numero: "", complemento: "", bairro: "", cidadeUf: "" };
  const [rua, numeroCompl, bairro, ...resto] = partes;
  const [numero, ...compl] = numeroCompl.split(" - ");
  return { rua, numero, complemento: compl.join(" - "), bairro, cidadeUf: resto.join(", ") };
}

/**
 * Cadastro e alteração de endereço (Cadastro de Locais).
 *
 * - Depois do cadastro da conta: sem props extras, segue para o início.
 * - Em "Endereços" ou na cesta: `onConcluir(local)` volta para quem abriu;
 *   com `local`, o formulário altera esse endereço (PUT /locais/{id}).
 *
 * O CEP preenche rua, bairro e cidade (ViaCEP); as coordenadas vêm da
 * geocodificação e o endereço salvo aparece no Google Maps para conferir.
 */
export default function CadastroEnderecoView({ onGo, local = null, onConcluir, onCancelar }) {
  const inicial = local ? separarEndereco(local.endereco) : {};
  const [tipo, setTipo] = useState(local?.tipo && TIPOS.includes(local.tipo) ? local.tipo : "Casa");
  const [salvo, setSalvo] = useState(null);
  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState(inicial.numero || "");
  const [rua, setRua] = useState(inicial.rua || "");
  const [complemento, setComplemento] = useState(inicial.complemento || "");
  const [bairro, setBairro] = useState(inicial.bairro || "");
  const [cidadeUf, setCidadeUf] = useState(inicial.cidadeUf || "");
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
      setErro(e?.message || "Não foi possível consultar o CEP. Tente novamente.");
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSalvar = async () => {
    setErro("");
    if (!rua.trim() || !numero.trim() || !bairro.trim() || !cidadeUf.trim()) {
      setErro("Preencha o CEP e o número. Confira rua, bairro e cidade.");
      return;
    }
    if (buscandoCep) {
      setErro("Aguarde a consulta do CEP terminar.");
      return;
    }
    const usuarioId = getUsuarioId();
    if (!usuarioId) {
      setErro("Não encontramos seu usuário logado. Faça login novamente antes de salvar o endereço.");
      return;
    }

    setCarregando(true);
    try {
      const enderecoCompleto =
        `${rua.trim()}, ${numero.trim()}` +
        `${complemento.trim() ? " - " + complemento.trim() : ""}, ` +
        `${bairro.trim()}, ${cidadeUf.trim()}`;

      // Coordenadas reais do endereço (lança erro se não encontrar).
      const { latitude, longitude } = await geocodificarEndereco(enderecoCompleto, cep);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) {
        throw new Error("Não foi possível identificar uma localização válida para este endereço.");
      }

      const dados = { endereco: enderecoCompleto, tipo, latitude, longitude };
      const resposta = local
        ? await locais.atualizar(local.id, dados)
        : await locais.criar({ ...dados, usuario_id: usuarioId });
      setSalvo(resposta);
    } catch (e) {
      setErro(e?.message || "Não foi possível salvar o endereço. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const continuar = () => (onConcluir ? onConcluir(salvo) : onGo("pagina-principal"));

  if (salvo) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <PageHeader Icon={MapPin} title="ENDEREÇO SALVO" subtitle="Confira no mapa se a localização está certa" />
        <div className="ef-card" style={{ padding: 18, marginTop: 16 }}>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#fff", marginBottom: 4 }}>{salvo.endereco}</div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
            {salvo.tipo} · {Number(salvo.latitude).toFixed(5)}, {Number(salvo.longitude).toFixed(5)}
          </div>
          <GoogleMapa ponto={salvo} altura={300} titulo="Endereço no Google Maps" />
        </div>
        <button className="ef-btn-solid" style={{ marginTop: 16 }} onClick={continuar}>
          CONTINUAR
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 460, margin: onCancelar ? "0 auto" : "40px auto 0" }}>
      {onCancelar && (
        <button onClick={onCancelar} className="ef-btn-outline" style={{ marginBottom: 14 }}>
          <ArrowLeft size={14} /> VOLTAR
        </button>
      )}
      <PageHeader
        Icon={MapPin}
        title={local ? "ALTERAR ENDEREÇO" : onCancelar ? "NOVO ENDEREÇO" : "ENDEREÇO"}
        subtitle={local ? local.endereco : "Cadastro do endereço de entrega"}
      />

      <div className="ef-card" style={{ padding: 24, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="CEP" placeholder="05435-000" value={cep} onChange={(e) => setCep(e.target.value)} onBlur={handleCepBlur} />
          <Field label="NÚMERO" placeholder="123" value={numero} onChange={(e) => setNumero(e.target.value)} />
        </div>

        {buscandoCep && (
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>Buscando endereço pelo CEP...</span>
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
                type="button"
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

        {erro && (
          <span role="alert" style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C" }}>{erro}</span>
        )}

        <button className="ef-btn-solid" type="button" onClick={handleSalvar} disabled={carregando || buscandoCep}>
          {carregando ? "SALVANDO..." : local ? "SALVAR ALTERAÇÕES" : "SALVAR ENDEREÇO E CONTINUAR"}
        </button>
      </div>
    </div>
  );
}
