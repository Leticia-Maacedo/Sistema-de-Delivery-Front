import React, { useState, useEffect } from "react";
import { ArrowLeft, Store } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { parceiro, ApiError } from "../../api/client";
import { buscarEnderecoPorCep, geocodificarEndereco } from "../../api/geo";
import { separarEndereco } from "../cliente/CadastroEnderecoView";

function formatarCnpj(valor) {
  const d = (valor || "").replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

const titulo = { fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "var(--muted)", letterSpacing: 1 };

/**
 * Cadastro e edição do restaurante pelo dono (Portal do Parceiro).
 *
 * POST /parceiro/restaurante (novo, nasce aguardando aprovação) ou
 * PUT /parceiro/restaurante (edição). Inclui endereço pelo CEP com as
 * coordenadas para o Google Maps e o cálculo da entrega, horário de
 * funcionamento e raio de entrega.
 */
export default function CadastroRestauranteView({ restauranteId, onGo }) {
  const editando = Boolean(restauranteId);

  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [taxaEntregaKm, setTaxaEntregaKm] = useState("");
  const [raio, setRaio] = useState("");
  const [abertura, setAbertura] = useState("");
  const [fechamento, setFechamento] = useState("");

  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [rua, setRua] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidadeUf, setCidadeUf] = useState("");
  const [enderecoOriginal, setEnderecoOriginal] = useState("");
  // Na edição, o endereço só é validado e geocodificado de novo se o dono mexer nele.
  const [mexeuNoEndereco, setMexeuNoEndereco] = useState(!editando);
  const endereco_ = (setter) => (e) => { setMexeuNoEndereco(true); setter(e.target.value); };

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [carregando, setCarregando] = useState(editando);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    parceiro
      .restaurante()
      .then((r) => {
        setNomeFantasia(r.nome_fantasia);
        setCnpj(r.cnpj);
        setTaxaEntregaKm(String(r.taxa_entrega_km));
        setRaio(r.raio_entrega_km != null ? String(Number(r.raio_entrega_km)) : "");
        setAbertura(r.horario_abertura ? r.horario_abertura.slice(0, 5) : "");
        setFechamento(r.horario_fechamento ? r.horario_fechamento.slice(0, 5) : "");
        const partes = separarEndereco(r.endereco);
        if (partes.numero) {
          setRua(partes.rua); setNumero(partes.numero); setComplemento(partes.complemento);
          setBairro(partes.bairro); setCidadeUf(partes.cidadeUf);
        }
        setEnderecoOriginal(r.endereco);
      })
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o restaurante."))
      .finally(() => setCarregando(false));
  }, [editando]);

  const handleCepBlur = async () => {
    if (cep.replace(/\D/g, "").length !== 8) return;
    setBuscandoCep(true);
    setErro("");
    try {
      const dados = await buscarEnderecoPorCep(cep);
      setMexeuNoEndereco(true);
      setRua(dados.rua);
      setBairro(dados.bairro);
      setCidadeUf(dados.cidade && dados.uf ? `${dados.cidade} - ${dados.uf}` : "");
    } catch (e) {
      setErro(e.message);
    } finally {
      setBuscandoCep(false);
    }
  };

  const salvar = async () => {
    setErro("");
    const taxa = Number(String(taxaEntregaKm).replace(",", "."));
    const raioKm = raio.trim() ? Number(raio.replace(",", ".")) : null;
    if (nomeFantasia.trim().length < 2) return setErro("Informe o nome do restaurante.");
    if (cnpj.replace(/\D/g, "").length !== 14) return setErro("Informe o CNPJ com 14 dígitos.");
    if (!(taxa > 0)) return setErro("Informe a taxa de entrega por km (maior que zero).");
    if (raioKm !== null && !(raioKm > 0 && raioKm <= 50)) return setErro("O raio de entrega deve ficar entre 0,1 e 50 km.");
    if (Boolean(abertura) !== Boolean(fechamento)) return setErro("Informe o horário de abertura e o de fechamento (ou deixe os dois em branco).");
    if (abertura && abertura === fechamento) return setErro("A abertura e o fechamento não podem ter o mesmo horário.");
    if (mexeuNoEndereco && (!rua.trim() || !numero.trim() || !bairro.trim() || !cidadeUf.trim())) {
      return setErro("Preencha o endereço: CEP, número, rua, bairro e cidade.");
    }

    setSalvando(true);
    try {
      const endereco =
        `${rua.trim()}, ${numero.trim()}${complemento.trim() ? " - " + complemento.trim() : ""}, ` +
        `${bairro.trim()}, ${cidadeUf.trim()}`;
      const dados = {
        nome_fantasia: nomeFantasia.trim(),
        cnpj: formatarCnpj(cnpj),
        taxa_entrega_km: taxa,
        raio_entrega_km: raioKm,
        horario_abertura: abertura || null,
        horario_fechamento: fechamento || null,
      };
      // Coordenadas só quando o endereço é novo ou mudou.
      if (mexeuNoEndereco && endereco !== enderecoOriginal) {
        const { latitude, longitude } = await geocodificarEndereco(endereco, cep);
        Object.assign(dados, { endereco, latitude, longitude });
      }
      if (editando) await parceiro.alterar(dados);
      else await parceiro.cadastrar(dados);
      onGo("area-parceiro");
    } catch (e) {
      setErro(e instanceof ApiError || e instanceof Error ? e.message : "Não foi possível salvar o restaurante.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando dados do restaurante...</div>;
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <button onClick={() => onGo("area-parceiro")} className="ef-btn-outline" style={{ marginBottom: 14 }}>
        <ArrowLeft size={14} /> MEU RESTAURANTE
      </button>
      <PageHeader
        Icon={Store}
        title={editando ? "EDITAR RESTAURANTE" : "CADASTRAR RESTAURANTE"}
        subtitle={editando ? "Dados, endereço, horário e raio de entrega" : "Depois de salvar, o cadastro vai para aprovação da plataforma"}
      />

      <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={titulo}>DADOS</span>
        <Field label="NOME DO RESTAURANTE" placeholder="Cantinho do Chef" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
        <Field label="CNPJ" placeholder="12.345.678/0001-90" value={cnpj} onChange={(e) => setCnpj(formatarCnpj(e.target.value))} />

        <span style={{ ...titulo, marginTop: 6 }}>FUNCIONAMENTO E ENTREGA</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="ABRE ÀS" type="time" value={abertura} onChange={(e) => setAbertura(e.target.value)} />
          <Field label="FECHA ÀS" type="time" value={fechamento} onChange={(e) => setFechamento(e.target.value)} />
        </div>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", marginTop: -6 }}>
          Fechamento antes da abertura vira a meia-noite (ex.: 18:00 às 02:00). Em branco: aberto enquanto não estiver pausado.
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="TAXA POR KM (R$)" placeholder="2,50" inputMode="decimal" value={taxaEntregaKm} onChange={(e) => setTaxaEntregaKm(e.target.value)} />
          <Field label="RAIO DE ENTREGA (KM)" placeholder="Padrão da plataforma" inputMode="decimal" value={raio} onChange={(e) => setRaio(e.target.value)} />
        </div>

        <span style={{ ...titulo, marginTop: 6 }}>ENDEREÇO</span>
        {editando && enderecoOriginal && (
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#d8d8d8", marginTop: -6 }}>
            Atual: {enderecoOriginal}. Preencha o CEP só se quiser trocar o endereço.
          </span>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="CEP" placeholder="05435-000" value={cep} onChange={endereco_(setCep)} onBlur={handleCepBlur} />
          <Field label="NÚMERO" placeholder="123" value={numero} onChange={endereco_(setNumero)} />
        </div>
        {buscandoCep && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>Buscando endereço pelo CEP...</span>}
        <Field label="RUA" placeholder="Preenchido automaticamente pelo CEP" value={rua} onChange={endereco_(setRua)} />
        <Field label="COMPLEMENTO (OPCIONAL)" placeholder="Loja, sala..." value={complemento} onChange={endereco_(setComplemento)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="BAIRRO" value={bairro} onChange={endereco_(setBairro)} />
          <Field label="CIDADE / UF" value={cidadeUf} onChange={endereco_(setCidadeUf)} />
        </div>

        {erro && <span role="alert" style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C" }}>{erro}</span>}

        <button className="ef-btn-solid" onClick={salvar} disabled={salvando || buscandoCep}>
          {salvando ? "SALVANDO..." : editando ? "SALVAR ALTERAÇÕES" : "CADASTRAR RESTAURANTE"}
        </button>
      </div>
    </div>
  );
}
