/**
 * Utilitários de endereço do EntregaFood.
 *
 * ViaCEP: consulta CEP e preenche endereço.
 * Nominatim: converte endereço em latitude e longitude.
 *
 * Nunca salva coordenadas 0,0 quando a geocodificação falha.
 */

const VIACEP_URL = "https://viacep.com.br/ws";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function buscarEnderecoPorCep(cep) {
  const limpo = (cep || "").replace(/\D/g, "");

  if (limpo.length !== 8) {
    throw new Error("CEP inválido. Digite os 8 números.");
  }

  let res;

  try {
    res = await fetch(`${VIACEP_URL}/${limpo}/json/`);
  } catch {
    throw new Error(
      "Não foi possível consultar o CEP agora. Tente novamente."
    );
  }

  if (!res.ok) {
    throw new Error(
      "O serviço de consulta de CEP está indisponível."
    );
  }

  const dados = await res.json();

  if (dados.erro) {
    throw new Error("CEP não encontrado.");
  }

  return {
    rua: dados.logradouro || "",
    bairro: dados.bairro || "",
    cidade: dados.localidade || "",
    uf: dados.uf || "",
  };
}

/**
 * Coordenadas da rua pelo CEP (AwesomeAPI, base dos Correios com
 * localização). Cobre ruas que ainda não estão no OpenStreetMap.
 */
async function coordenadasPorCep(cep) {
  const limpo = (cep || "").replace(/\D/g, "");
  if (limpo.length !== 8) return null;
  try {
    const res = await fetch(`https://cep.awesomeapi.com.br/json/${limpo}`);
    if (!res.ok) return null;
    const dados = await res.json();
    const latitude = Number(dados.lat);
    const longitude = Number(dados.lng);
    return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude && longitude ? { latitude, longitude } : null;
  } catch {
    return null;
  }
}

/** Uma busca no Nominatim; devolve { latitude, longitude } ou null. */
async function buscarNominatim(parametros) {
  let res;
  try {
    const params = new URLSearchParams({ ...parametros, format: "json", limit: "1", countrycodes: "br" });
    res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, { headers: { "Accept-Language": "pt-BR" } });
  } catch {
    throw new Error("Não foi possível consultar a localização. Verifique sua conexão.");
  }
  if (!res.ok) {
    throw new Error("O serviço de localização está indisponível. Tente novamente.");
  }

  let dados;
  try {
    dados = await res.json();
  } catch {
    throw new Error("O serviço de localização retornou uma resposta inválida.");
  }
  if (!Array.isArray(dados) || dados.length === 0) return null;

  const latitude = Number(dados[0].lat);
  const longitude = Number(dados[0].lon);
  const valida =
    Number.isFinite(latitude) && Number.isFinite(longitude) && !(latitude === 0 && longitude === 0) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  return valida ? { latitude, longitude } : null;
}

/**
 * Coordenadas de um endereço no formato salvo pelo sistema:
 * "Rua, 123 - Complemento, Bairro, Cidade - UF".
 *
 * A busca por texto do Nominatim costuma falhar com complemento e bairro,
 * e há ruas que nem estão no OpenStreetMap. Tentamos em ordem: busca
 * estruturada (número + rua, cidade, UF), coordenadas da rua pelo CEP,
 * texto sem complemento/bairro, só a rua na cidade e o CEP no Nominatim.
 */
export async function geocodificarEndereco(enderecoCompleto, cep = "") {
  if (!enderecoCompleto || !enderecoCompleto.trim()) {
    throw new Error("Informe um endereço válido.");
  }

  const partes = enderecoCompleto.split(", ");
  const tentativas = [];
  if (partes.length >= 4) {
    const [rua, numeroCompl, , ...resto] = partes;
    const numero = numeroCompl.split(" - ")[0].trim();
    const [cidade, uf = ""] = resto.join(", ").split(" - ").map((x) => x.trim());
    tentativas.push({ street: `${numero} ${rua}`, city: cidade, state: uf });
    tentativas.push({ q: `${rua}, ${numero}, ${cidade}, ${uf}, Brasil` });
    tentativas.push({ street: rua, city: cidade, state: uf });
  }
  tentativas.push({ q: `${enderecoCompleto}, Brasil` });
  const cepDigitos = (cep || "").replace(/\D/g, "");
  if (cepDigitos.length === 8) {
    tentativas.push({ postalcode: `${cepDigitos.slice(0, 5)}-${cepDigitos.slice(5)}`, country: "Brasil" });
  }

  for (const [i, parametros] of tentativas.entries()) {
    const ponto = await buscarNominatim(parametros);
    if (ponto) return ponto;
    if (i === 0) {
      const pelaRua = await coordenadasPorCep(cep);
      if (pelaRua) return pelaRua;
    }
  }
  const pelaRua = await coordenadasPorCep(cep);
  if (pelaRua) return pelaRua;
  throw new Error(
    "Não encontramos as coordenadas desse endereço. Confira rua, número, bairro e cidade."
  );
}
