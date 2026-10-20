
import React, { useState } from "react";
import { MapPin } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { locais, getUsuarioId } from "../../api/client";
import {
  buscarEnderecoPorCep,
  geocodificarEndereco,
} from "../../api/geo";

const TIPOS = ["Casa", "Trabalho", "Outro"];

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
      setCidadeUf(
        dados.cidade && dados.uf
          ? `${dados.cidade} - ${dados.uf}`
          : ""
      );
    } catch (e) {
      console.error("Erro ao consultar CEP:", e);

      setErro(
        e?.message ||
          "Não foi possível consultar o CEP. Tente novamente."
      );
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSalvar = async () => {
    setErro("");

    if (
      !rua.trim() ||
      !numero.trim() ||
      !bairro.trim() ||
      !cidadeUf.trim()
    ) {
      setErro(
        "Preencha o CEP e o número. Confira rua, bairro e cidade."
      );
      return;
    }

    if (buscandoCep) {
      setErro("Aguarde a consulta do CEP terminar.");
      return;
    }

    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      setErro(
        "Não encontramos seu usuário logado. Faça login novamente antes de salvar o endereço."
      );
      return;
    }

    setCarregando(true);

    try {
      const enderecoCompleto =
        `${rua.trim()}, ${numero.trim()}` +
        `${complemento.trim() ? " - " + complemento.trim() : ""}, ` +
        `${bairro.trim()}, ${cidadeUf.trim()}`;

      console.log("Iniciando cadastro de endereço...");

      // Obtém coordenadas reais do endereço.
      // A função lança um erro caso a localização não seja encontrada.
      const { latitude, longitude } =
        await geocodificarEndereco(enderecoCompleto);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        (latitude === 0 && longitude === 0)
      ) {
        throw new Error(
          "Não foi possível identificar uma localização válida para este endereço."
        );
      }

      console.log("Coordenadas obtidas:", {
        latitude,
        longitude,
      });

      // Salva o endereço no backend.
      await locais.criar({
        usuario_id: usuarioId,
        endereco: enderecoCompleto,
        tipo,
        latitude,
        longitude,
      });

      console.log("Endereço salvo com sucesso.");

      onGo("pagina-principal");
    } catch (e) {
      console.error("Erro ao salvar endereço:", e);

      setErro(
        e?.message ||
          "Não foi possível salvar o endereço. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: "40px auto 0" }}>
      <PageHeader
        Icon={MapPin}
        title="ENDEREÇO"
        subtitle="Cadastro e seleção do endereço de entrega"
      />

      <div
        className="ef-card"
        style={{
          padding: 24,
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Field
            label="CEP"
            placeholder="05435-000"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            onBlur={handleCepBlur}
          />

          <Field
            label="NÚMERO"
            placeholder="123"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>

        {buscandoCep && (
          <span
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            Buscando endereço pelo CEP...
          </span>
        )}

        <Field
          label="RUA"
          placeholder="Preenchido automaticamente pelo CEP"
          value={rua}
          onChange={(e) => setRua(e.target.value)}
        />

        <Field
          label="COMPLEMENTO (OPCIONAL)"
          placeholder="Apto, bloco..."
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Field
            label="BAIRRO"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />

          <Field
            label="CIDADE / UF"
            value={cidadeUf}
            onChange={(e) => setCidadeUf(e.target.value)}
          />
        </div>

        <div>
          <span
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            TIPO DE ENDEREÇO
          </span>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
            }}
          >
            {TIPOS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                style={{
                  flex: 1,
                  padding: "8px 6px",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 12,
                  border: `1px solid ${
                    tipo === t
                      ? "var(--accent)"
                      : "var(--border)"
                  }`,
                  background:
                    tipo === t
                      ? "var(--hover)"
                      : "transparent",
                  color:
                    tipo === t
                      ? "var(--accent)"
                      : "#d8d8d8",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {erro && (
          <span
            role="alert"
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 12,
              color: "#E6534C",
            }}
          >
            {erro}
          </span>
        )}

        <button
          className="ef-btn-solid"
          type="button"
          onClick={handleSalvar}
          disabled={carregando || buscandoCep}
        >
          {carregando
            ? "SALVANDO..."
            : "SALVAR ENDEREÇO E CONTINUAR"}
        </button>
      </div>
    </div>
  );
}
