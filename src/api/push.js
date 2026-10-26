/**
 * Notificações push no navegador (Web Push).
 * Fluxo: registra o service worker (public/sw.js) → pede permissão →
 * inscreve o navegador com a chave pública do back → envia a inscrição
 * para POST /notificacoes/inscricao. Os avisos chegam pelo sw.js.
 */
import { notificacoes } from "./client";

export function suportaPush() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function chaveParaBytes(base64url) {
  const preenchido = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(preenchido), (c) => c.charCodeAt(0));
}

async function registro() {
  return navigator.serviceWorker.register("/sw.js");
}

/** "ativo", "inativo", "bloqueado" ou "indisponivel". */
export async function estadoNotificacoes() {
  if (!suportaPush()) return "indisponivel";
  if (Notification.permission === "denied") return "bloqueado";
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const inscricao = reg ? await reg.pushManager.getSubscription() : null;
  return inscricao && Notification.permission === "granted" ? "ativo" : "inativo";
}

export async function ativarNotificacoes() {
  if (!suportaPush()) throw new Error("Este navegador não suporta notificações push.");
  const { ativo, chave_publica: chave } = await notificacoes.chavePublica();
  if (!ativo || !chave) throw new Error("As notificações ainda não foram configuradas no servidor.");

  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") throw new Error("Permissão de notificação negada no navegador.");

  const reg = await registro();
  await navigator.serviceWorker.ready;
  let inscricao = await reg.pushManager.getSubscription();
  if (!inscricao) {
    // No modo anônimo/privado o navegador não oferece push e pode nem responder.
    const limite = new Promise((_, rejeita) =>
      setTimeout(() => rejeita(new Error("O navegador não respondeu. Em janela anônima as notificações não funcionam.")), 15000));
    inscricao = await Promise.race([
      reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chaveParaBytes(chave) }),
      limite,
    ]);
  }
  const json = inscricao.toJSON();
  await notificacoes.inscrever({ endpoint: json.endpoint, keys: json.keys });
  return "ativo";
}

export async function desativarNotificacoes() {
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const inscricao = reg ? await reg.pushManager.getSubscription() : null;
  if (inscricao) {
    await notificacoes.cancelar(inscricao.endpoint).catch(() => {});
    await inscricao.unsubscribe();
  }
  return "inativo";
}
