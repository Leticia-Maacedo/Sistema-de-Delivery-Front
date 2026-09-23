import React, { useState, useEffect } from "react";
import { Store } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { locais, restaurantes, getUsuarioId, saveRestauranteAtivo, ApiError } from "../../api/client";
import { buscarEnderecoPorCep, geocodificarEndereco } from "../../api/geo";

/**
 * Cadastro e edição de restaurante.
 *
 * Um restaurante precisa de um Local (endereço) — como o local_controller
 * não tem busca por "endereço do restaurante X", cada restaurante ganha
 * o seu próprio registro em `local` (tipo "Restaurante"), criado junto
 * na hora do cadastro.
 *
 * - Modo criação (sem restauranteId): cria o Local e o Restaurante em
 *   sequência, e guarda o resultado como "restaurante ativo" (ver
 *   getRestauranteAtivoId em api/client.js), usado depois na tela de
 *   cardápio pra saber de quem são os produtos.
 * - Modo edição (com restauranteId): carrega o restaurante e o local
 *   dele, preenche o formulário, e no salvar atualiza os dois.
 */
export default function CadastroRestauranteView({ restauranteId, onGo }) {
  const editando = Boolean(restauranteId);

  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [taxaEntregaKm, setTaxaEntregaKm] = useState("");

  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [rua, setRua] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidadeUf, setCidadeUf] = useState("");

  const [localIdAtual, setLocalIdAtual] = useState(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(editando);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    (async () => {
      try {
        const r = await restaurantes.obter(restauranteId);
        setNomeFantasia(r.nome_fantasia);
        setCnpj(r.cnpj);
        setTaxaEntregaKm(String(r.taxa_entrega_km));
        setLocalIdAtual(r.local_id);

        const l = await locais.obter(r.local_id);
        // O endereço foi salvo como uma string única — mostramos ela
        // inteira no campo "Rua" pra edição simples (não dá pra separar
        // rua/número/bairro de volta com segurança).
        setRua(l.endereco);
        setNumero("");
        setBairro("");
        setCidadeUf("");
      } catch (e) {
        setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o restaurante.");
      } finally {
        setCarregandoDados(false);
      }
    })();
  }, [editando, restauranteId]);

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
    if (!nomeFantasia.trim() || !cnpj.trim() || !taxaEntregaKm) {
      setErro("Preencha nome fantasia, CNPJ e taxa de entrega.");
      return;
    }
    if (!editando && (!rua.trim() || !numero.trim() || !bairro.trim() || !cidadeUf.trim())) {
      setErro("Preencha o CEP e o número do endereço do restaurante.");
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        const restauranteAtualizado = await restaurantes.atualizar(restauranteId, {
          nome_fantasia: nomeFantasia,
          cnpj,
          taxa_entrega_km: Number(taxaEntregaKm),
        });
        if (rua.trim()) {
          await locais.atualizar(localIdAtual, { endereco: rua });
        }
        saveRestauranteAtivo(restauranteAtualizado);
      } else {
        const usuarioId = getUsuarioId();
        if (!usuarioId) {
          setErro("Não encontramos seu usuário logado. Faça login de novo antes de cadastrar o restaurante.");
          setSalvando(false);
          return;
        }
        const enderecoCompleto = `${rua}, ${numero}${complemento ? " - " + complemento : ""}, ${bairro}, ${cidadeUf}`;
        const { latitude, longitude } = await geocodificarEndereco(enderecoCompleto);
        const local = await locais.criar({
          usuario_id: usuarioId,
          endereco: enderecoCompleto,
          tipo: "Restaurante",
          latitude,
          longitude,
        });
        const restaurante = await restaurantes.criar({
          local_id: local.id,
          nome_fantasia: nomeFantasia,
          cnpj,
          taxa_entrega_km: Number(taxaEntregaKm),
        });
        saveRestauranteAtivo(restaurante);
      }
      onGo?.("area-parceiro");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar o restaurante. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregandoDados) {
    return (
      <div style={{ maxWidth: 460, margin: "40px auto 0", textAlign: "center", fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>
        Carregando restaurante...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 460, margin: "0 auto" }}>
      <PageHeader
        Icon={Store}
        title={editando ? "EDITAR RESTAURANTE" : "CADASTRAR RESTAURANTE"}
        subtitle={editando ? "Atualize os dados do seu restaurante" : "Cadastre seu restaurante parceiro"}
      />
      <div className="ef-card" style={{ padding: 24, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="NOME FANTASIA" placeholder="Cantinho do Chef" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
        <Field label="CNPJ" placeholder="12.345.678/0001-90" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
        <Field
          label="TAXA DE ENTREGA POR KM (R$)"
          placeholder="2.50"
          inputMode="decimal"
          value={taxaEntregaKm}
          onChange={(e) => setTaxaEntregaKm(e.target.value.replace(",", "."))}
        />

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "#fff" }}>
            Endereço do restaurante
          </span>
        </div>

        {editando ? (
          <Field label="ENDEREÇO" value={rua} onChange={(e) => setRua(e.target.value)} />
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="CEP" placeholder="05435-000" value={cep} onChange={(e) => setCep(e.target.value)} onBlur={handleCepBlur} />
              <Field label="NÚMERO" placeholder="123" value={numero} onChange={(e) => setNumero(e.target.value)} />
            </div>
            {buscandoCep && (
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>
                Buscando endereço pelo CEP...
              </span>
            )}
            <Field label="RUA" placeholder="Preenchido automaticamente pelo CEP" value={rua} onChange={(e) => setRua(e.target.value)} />
            <Field label="COMPLEMENTO (OPCIONAL)" placeholder="Loja, sala..." value={complemento} onChange={(e) => setComplemento(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="BAIRRO" value={bairro} onChange={(e) => setBairro(e.target.value)} />
              <Field label="CIDADE / UF" value={cidadeUf} onChange={(e) => setCidadeUf(e.target.value)} />
            </div>
          </>
        )}

        {erro && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#E6534C" }}>{erro}</span>}

        <button className="ef-btn-solid" onClick={handleSalvar} disabled={salvando}>
          {salvando ? "SALVANDO..." : editando ? "SALVAR ALTERAÇÕES" : "CADASTRAR RESTAURANTE"}
        </button>
      </div>
    </div>
  );
}