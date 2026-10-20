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

export async function geocodificarEndereco(enderecoCompleto) {
  if (!enderecoCompleto || !enderecoCompleto.trim()) {
    throw new Error("Informe um endereço válido.");
  }

  let res;

  try {
    const params = new URLSearchParams({
      q: `${enderecoCompleto}, Brasil`,
      format: "json",
      limit: "1",
      countrycodes: "br",
    });

    res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        "Accept-Language": "pt-BR",
      },
    });
  } catch {
    throw new Error(
      "Não foi possível consultar a localização. Verifique sua conexão."
    );
  }

  if (!res.ok) {
    throw new Error(
      "O serviço de localização está indisponível. Tente novamente."
    );
  }

  let dados;

  try {
    dados = await res.json();
  } catch {
    throw new Error(
      "O serviço de localização retornou uma resposta inválida."
    );
  }

  if (!Array.isArray(dados) || dados.length === 0) {
    throw new Error(
      "Não encontramos as coordenadas desse endereço. Confira rua, número, bairro e cidade."
    );
  }

  const latitude = Number(dados[0].lat);
  const longitude = Number(dados[0].lon);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    (latitude === 0 && longitude === 0) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "As coordenadas encontradas são inválidas. Confira o endereço."
    );
  }

  return {
    latitude,
    longitude,
  };
}