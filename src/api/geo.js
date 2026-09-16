/**
 * Utilitários de endereço que NÃO passam pelo back do EntregaFood —
 * são serviços públicos externos usados só no front pra facilitar o
 * preenchimento do formulário de endereço.
 *
 *   ViaCEP    -> preenche rua/bairro/cidade a partir do CEP (grátis, sem chave)
 *   Nominatim -> converte o endereço em latitude/longitude (OpenStreetMap,
 *                grátis, sem chave, mas com limite de uso — trocar por
 *                Google Maps Geocoding API se o volume de cadastros crescer)
 */

const VIACEP_URL = "https://viacep.com.br/ws";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/** Busca rua/bairro/cidade/UF a partir de um CEP. Lança erro se inválido. */
export async function buscarEnderecoPorCep(cep) {
  const limpo = (cep || "").replace(/\D/g, "");
  if (limpo.length !== 8) {
    throw new Error("CEP inválido — digite os 8 números.");
  }

  let res;
  try {
    res = await fetch(`${VIACEP_URL}/${limpo}/json/`);
  } catch {
    throw new Error("Não foi possível consultar o CEP agora. Tente de novo.");
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
 * Converte um endereço em texto para { latitude, longitude }.
 * Se não conseguir geocodificar (endereço incompleto, serviço fora do ar),
 * devolve 0/0 em vez de travar o cadastro — o back exige esses campos
 * como NOT NULL, então preferimos salvar sem coordenada exata a bloquear
 * o usuário no meio do fluxo.
 */
export async function geocodificarEndereco(enderecoCompleto) {
  try {
    const params = new URLSearchParams({
      q: `${enderecoCompleto}, Brasil`,
      format: "json",
      limit: "1",
    });
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { "Accept-Language": "pt-BR" },
    });
    const dados = await res.json();
    if (dados && dados[0]) {
      return { latitude: parseFloat(dados[0].lat), longitude: parseFloat(dados[0].lon) };
    }
  } catch {
    // segue pro fallback abaixo
  }
  return { latitude: 0, longitude: 0 };
}