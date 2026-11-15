/**
 * Caminho mínimo de entrega (Backlog — Cálculo de caminho mínimo de entrega integrado com o Google Maps).
 *
 * Problema: o entregador parte de um ponto (a posição dele ou o restaurante) e
 * precisa passar por N endereços. É o problema do caixeiro-viajante com
 * caminho aberto (não volta ao início).
 *  - Até 8 paradas: testa todas as ordens (8! = 40.320) e devolve a ótima.
 *  - Acima disso: vizinho mais próximo + melhoria 2-opt (boa e rápida).
 * A distância usada é a linha reta (fórmula de Haversine), a mesma estimativa
 * da taxa de entrega; o trajeto pelas ruas é traçado pelo Google Maps no link.
 */

const RAIO_TERRA_KM = 6371;
const rad = (g) => (Number(g) * Math.PI) / 180;

export function distanciaKm(a, b) {
  const dLat = rad(b.latitude) - rad(a.latitude);
  const dLon = rad(b.longitude) - rad(a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(h));
}

/** Distância total partindo de `origem` e passando pelas paradas na ordem dada. */
export function totalKm(origem, paradas) {
  let total = 0;
  let atual = origem;
  for (const p of paradas) {
    total += distanciaKm(atual, p);
    atual = p;
  }
  return total;
}

function* permutacoes(lista) {
  if (lista.length <= 1) {
    yield lista;
    return;
  }
  for (let i = 0; i < lista.length; i += 1) {
    const resto = [...lista.slice(0, i), ...lista.slice(i + 1)];
    for (const p of permutacoes(resto)) yield [lista[i], ...p];
  }
}

function vizinhoMaisProximo(origem, paradas) {
  const faltam = [...paradas];
  const ordem = [];
  let atual = origem;
  while (faltam.length) {
    let melhor = 0;
    for (let i = 1; i < faltam.length; i += 1) if (distanciaKm(atual, faltam[i]) < distanciaKm(atual, faltam[melhor])) melhor = i;
    atual = faltam.splice(melhor, 1)[0];
    ordem.push(atual);
  }
  return ordem;
}

function doisOpt(origem, ordem) {
  let melhor = ordem;
  let melhorou = true;
  while (melhorou) {
    melhorou = false;
    for (let i = 0; i < melhor.length - 1; i += 1) {
      for (let k = i + 1; k < melhor.length; k += 1) {
        const nova = [...melhor.slice(0, i), ...melhor.slice(i, k + 1).reverse(), ...melhor.slice(k + 1)];
        if (totalKm(origem, nova) + 1e-9 < totalKm(origem, melhor)) {
          melhor = nova;
          melhorou = true;
        }
      }
    }
  }
  return melhor;
}

/** Ordem das paradas com a menor distância total. */
export function melhorRota(origem, paradas) {
  if (paradas.length <= 1) return [...paradas];
  if (paradas.length <= 8) {
    let melhor = null;
    let menor = Infinity;
    for (const p of permutacoes(paradas)) {
      const d = totalKm(origem, p);
      if (d < menor) {
        menor = d;
        melhor = p;
      }
    }
    return melhor;
  }
  return doisOpt(origem, vizinhoMaisProximo(origem, paradas));
}

const ponto = (p) => `${Number(p.latitude).toFixed(6)},${Number(p.longitude).toFixed(6)}`;

/** Link do Google Maps com o trajeto pelas ruas (sem chave de API): origem → paradas na ordem. */
export function linkGoogleMaps(origem, ordem) {
  const params = new URLSearchParams({ api: "1", origin: ponto(origem), destination: ponto(ordem[ordem.length - 1]), travelmode: "driving" });
  if (ordem.length > 1) params.set("waypoints", ordem.slice(0, -1).map(ponto).join("|"));
  return `https://www.google.com/maps/dir/?${params}`;
}
