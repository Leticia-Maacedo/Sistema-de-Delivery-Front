import React, { useState, useEffect } from "react";
import { Truck, ArrowLeft, Search, Bell, MessageCircle } from "lucide-react";

import { NAV_ADMIN_SIDEBAR, ADMIN_TITLES, telaPermitida } from "./data/navigation";
import { consumeOAuthResultFromQuery, isLoggedIn, cesta, ApiError, getUsuario, getTokenUsuarioId, fetchUsuarioLogado, logout } from "./api/client";
import ClientSidebar from "./components/ClientSidebar";
import { exibicaoUsuario } from "./data/usuarioExibicao";
import { desativarNotificacoes, suportaPush } from "./api/push";
import SystemStatus from "./components/SystemStatus";

import InicioCategoriasView from "./views/cliente/InicioCategoriasView";
import LoginView from "./views/cliente/LoginView";
import CadastroDadosView from "./views/cliente/CadastroDadosView";
import CadastroTelefoneView from "./views/cliente/CadastroTelefoneView";
import CadastroEnderecoView from "./views/cliente/CadastroEnderecoView";
import PaginaPrincipalView from "./views/cliente/PaginaPrincipalView";
import RestaurantesListaView from "./views/cliente/RestaurantesListaView";
import CardapioRestauranteView from "./views/cliente/CardapioRestauranteView";
import ProdutoDetalheView from "./views/cliente/ProdutoDetalheView";
import CestaView from "./views/cliente/CestaView";
import TipoPagamentoView from "./views/cliente/TipoPagamentoView";
import FormularioCartaoView from "./views/cliente/FormularioCartaoView";
import PedidoConfirmadoView from "./views/cliente/PedidoConfirmadoView";
import PagamentoPixView from "./views/cliente/PagamentoPixView";
import EnderecosView from "./views/cliente/EnderecosView";
import MinhaContaView from "./views/cliente/MinhaContaView";
import HistoricoView from "./views/cliente/HistoricoView";
import AcompanharPedidoView from "./views/cliente/AcompanharPedidoView";

import AreaParceiroView from "./views/parceiro/AreaParceiroView";
import CadastroRestauranteView from "./views/parceiro/CadastroRestauranteView";
import CardapiosView from "./views/parceiro/CardapiosView";

import DashboardView from "./views/admin/DashboardView";
import RestaurantesView from "./views/admin/RestaurantesView";
import PedidosView from "./views/admin/PedidosView";
import PedidoDetalheView from "./views/admin/PedidoDetalheView";
import EntregasView from "./views/admin/EntregasView";
import FuncionalidadesView from "./views/admin/FuncionalidadesView";
import EmptyState from "./components/EmptyState";

const CHAVE_ENDERECO = "entregafood_endereco_entrega";

export default function App() {
  // O site abre no login: sem conta, nenhuma outra tela é liberada.
  const [view, setView] = useState("login");
  const [orderId, setOrderId] = useState(null);
  const [restauranteId, setRestauranteId] = useState(null);
  const [editRestauranteId, setEditRestauranteId] = useState(null);
  const [produtoId, setProdutoId] = useState(null);
  const [oauthErro, setOauthErro] = useState("");
  // Usuário logado (nome e tipo) mostrado no menu e na saudação.
  const [usuario, setUsuario] = useState(() => {
    const salvo = isLoggedIn() ? getUsuario() : null;
    return salvo && salvo.id === getTokenUsuarioId() ? salvo : null;
  });

  // Mantém o usuário em dia a cada troca de tela: usa o salvo no login
  // quando ele é o dono do token; senão (login social, ou o token trocou
  // e ficou o usuário de outra sessão) busca em GET /auth/eu.
  useEffect(() => {
    if (!isLoggedIn()) {
      if (usuario) setUsuario(null);
      return;
    }
    const salvo = getUsuario();
    if (salvo && salvo.id === getTokenUsuarioId()) {
      if (salvo.id !== usuario?.id) setUsuario(salvo);
    } else {
      fetchUsuarioLogado().then(setUsuario);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Cesta (carrinho) do cliente, vindo de verdade do back (GET /cesta).
  // Toda mutação (+ / - / excluir) devolve a sacola inteira atualizada,
  // então basta substituir este estado pela resposta — nunca calculamos
  // quantidade/total na mão no front.
  const [sacola, setSacola] = useState(null);
  const [pedidoAtual, setPedidoAtual] = useState(null);
  // Fechar Pedido (Sprint 3): tipo de entrega escolhido na cesta e o
  // resumo (subtotal/taxa/total) calculado pelo back para esse tipo.
  const [tipoEntrega, setTipoEntrega] = useState("delivery");
  const [resumoCesta, setResumoCesta] = useState(null);
  // Acompanhar Entrega (Sprint 3): pedido aberto na tela de acompanhamento.
  const [pedidoAcompanhadoId, setPedidoAcompanhadoId] = useState(null);
  // Endereço escolhido para a entrega (Endereços / cesta). null = o último cadastrado.
  const [enderecoEntregaId, setEnderecoEntregaIdState] = useState(() => {
    try { return Number(localStorage.getItem(CHAVE_ENDERECO)) || null; } catch { return null; }
  });
  const setEnderecoEntregaId = (id) => {
    setEnderecoEntregaIdState(id);
    try {
      if (id) localStorage.setItem(CHAVE_ENDERECO, String(id));
      else localStorage.removeItem(CHAVE_ENDERECO);
    } catch { /* navegador sem localStorage: a escolha vale só nesta aba */ }
  };
  // Formulário de endereço aberto por "Endereços" ou pela cesta: qual
  // endereço alterar (null = novo) e para qual tela voltar depois.
  const [enderecoEditando, setEnderecoEditando] = useState(null);
  const [voltarDoEndereco, setVoltarDoEndereco] = useState(null);
  const [carregandoCesta, setCarregandoCesta] = useState(false);
  const [erroCesta, setErroCesta] = useState("");

  // "carrinho" no formato { produtoId: quantidade } — é só uma projeção
  // da sacola, pra CardapioRestauranteView e ProdutoDetalheView (que já
  // sabiam renderizar esse formato) não precisarem mudar nada.
  const carrinho = {};
  (sacola?.itens || []).forEach((i) => { carrinho[i.produto_id] = i.quantidade; });

  const carregarCesta = async () => {
    if (!isLoggedIn()) return;
    setCarregandoCesta(true);
    setErroCesta("");
    try {
      setSacola(await cesta.obter());
    } catch (e) {
      setErroCesta(e instanceof ApiError ? e.message : "Não foi possível carregar sua cesta.");
    } finally {
      setCarregandoCesta(false);
    }
  };

  // Carrega a cesta assim que a pessoa loga (view muda pra algo que não é
  // login/cadastro) — não dá pra depender só do [] porque o login acontece
  // bem depois do primeiro render.
  useEffect(() => {
    if (isLoggedIn() && usuario?.tipo === "cliente" && !sacola) carregarCesta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, usuario]);

  // Inclusão de produto na cesta — POST /cesta/itens (autenticado, sem
  // precisar saber o id da sacola: o back acha/cria pelo token).
  const adicionarAoCarrinho = async (produtoId) => {
    if (!isLoggedIn()) {
      goTo("login");
      return;
    }
    setErroCesta("");
    try {
      setSacola(await cesta.adicionarItem(produtoId, 1));
    } catch (e) {
      setErroCesta(e instanceof ApiError ? e.message : "Não foi possível adicionar o item na cesta.");
    }
  };

  // Alteração de quantidade / exclusão — usado pelo "-" no cardápio e no detalhe do produto.
  // Se a quantidade cai a zero, o item é excluído em vez de ficar com quantidade 0.
  // As rotas do back usam produto_id (não um id de item separado).
  const removerDoCarrinho = async (produtoId) => {
    const item = sacola?.itens.find((i) => i.produto_id === produtoId);
    if (!item) return;
    setErroCesta("");
    try {
      const atualizado =
        item.quantidade <= 1
          ? await cesta.removerItem(produtoId)
          : await cesta.atualizarItem(produtoId, item.quantidade - 1);
      setSacola(atualizado);
    } catch (e) {
      setErroCesta(e instanceof ApiError ? e.message : "Não foi possível atualizar o item.");
    }
  };

  // Os três handlers abaixo são usados dentro da própria tela da Cesta
  // (CestaView), que já mostra os itens com o objeto inteiro.
  const aumentarItemCesta = async (item) => {
    setErroCesta("");
    try {
      setSacola(await cesta.atualizarItem(item.produto_id, item.quantidade + 1));
    } catch (e) {
      setErroCesta(e instanceof ApiError ? e.message : "Não foi possível atualizar o item.");
    }
  };

  const diminuirItemCesta = async (item) => {
    setErroCesta("");
    try {
      const atualizado =
        item.quantidade <= 1
          ? await cesta.removerItem(item.produto_id)
          : await cesta.atualizarItem(item.produto_id, item.quantidade - 1);
      setSacola(atualizado);
    } catch (e) {
      setErroCesta(e instanceof ApiError ? e.message : "Não foi possível atualizar o item.");
    }
  };

  const removerItemCesta = async (produtoId) => {
    setErroCesta("");
    try {
      setSacola(await cesta.removerItem(produtoId));
    } catch (e) {
      setErroCesta(e instanceof ApiError ? e.message : "Não foi possível remover o item.");
    }
  };

  // Ao carregar, verifica se voltamos de um login OAuth (Google/Facebook).
  // O oauth_controller redireciona para "/?oauth_token=<jwt>" (sucesso)
  // ou "/?oauth_erro=<mensagem>" (falha) depois do callback.
  useEffect(() => {
    const { token, erro } = consumeOAuthResultFromQuery();
    if (token) {
      setView("pagina-principal");
    } else if (erro) {
      setOauthErro(erro);
      setView("login");
    } else if (isLoggedIn()) {
      setView("pagina-principal");
    }
  }, []);

  const openOrder = (id) => {
    setOrderId(id);
    setView("pedido-detalhe");
  };

  const openRestaurante = (id) => {
    setRestauranteId(id);
    setView("cardapio-restaurante");
  };

  const acompanharPedido = (id) => {
    setPedidoAcompanhadoId(id);
    goTo("acompanhar-pedido");
  };

  const openProdutoDetalhe = (id) => {
    setProdutoId(id);
    setView("produto-detalhe");
  };

  // Abre o formulário de restaurante em modo edição (id existente) —
  // usado pelo botão "Editar" na Área do Parceiro. Pra modo criação,
  // basta goTo("cadastro-restaurante") direto, sem passar por aqui.
  const editarRestaurante = (id) => {
    setEditRestauranteId(id);
    setView("cadastro-restaurante");
  };

  const abrirFormularioEndereco = (local, voltarPara) => {
    setEnderecoEditando(local);
    setVoltarDoEndereco(voltarPara);
    setView("cadastro-endereco");
  };

  const goTo = (key) => {
    // "cadastro-endereco" pelo fluxo de cadastro da conta: endereço novo, depois o início.
    if (key === "cadastro-endereco") {
      setEnderecoEditando(null);
      setVoltarDoEndereco(null);
    }
    // Zera o id de edição sempre que se navega por aqui — evita que um
    // "cadastro-restaurante" acessado direto do menu abra em modo edição
    // por acidente, com o id de uma navegação anterior.
    if (key === "cadastro-restaurante") setEditRestauranteId(null);
    // A regra de papel (efeito abaixo) corrige telas que o usuário não pode abrir.
    setView(key);
  };

  // Papel de quem está usando: visitante, cliente, restaurante, entregador
  // ou admin. null = logado, mas o usuário ainda está carregando.
  const papel = !isLoggedIn() ? "visitante" : usuario?.tipo || null;

  // Cada papel só abre as próprias telas (data/navigation.js). Ex.: depois
  // do login, o restaurante vai direto para o painel de pedidos; o cliente
  // não abre o Portal do Parceiro; o visitante que abre a cesta vai ao login.
  useEffect(() => {
    if (!papel) return;
    const destino = telaPermitida(papel, view);
    if (destino !== view) setView(destino);
  }, [papel, view]);

  const sair = async () => {
    // Antes de apagar a sessão: este navegador para de receber os avisos deste usuário.
    if (suportaPush()) await desativarNotificacoes().catch(() => {});
    logout();
    setUsuario(null);
    setSacola(null);
    setPedidoAtual(null);
    setResumoCesta(null);
    setEnderecoEntregaId(null);
    setView("login");
  };

  const renderView = () => {
    switch (view) {
      case "inicio-categorias": return <InicioCategoriasView onGo={goTo} />;
      case "login": return <LoginView onGo={goTo} erroInicial={oauthErro} />;
      case "login-parceiro": return <LoginView onGo={goTo} parceiro />;
      case "cadastro-dados": return <CadastroDadosView onGo={goTo} />;
      case "cadastro-parceiro": return <CadastroDadosView key="parceiro" onGo={goTo} parceiro />;
      case "cadastro-telefone": return <CadastroTelefoneView onGo={goTo} />;
      case "cadastro-endereco":
        return voltarDoEndereco ? (
          <CadastroEnderecoView
            key={enderecoEditando?.id ?? "novo"}
            onGo={goTo}
            local={enderecoEditando}
            onCancelar={() => setView(voltarDoEndereco)}
            onConcluir={(local) => {
              // Endereço novo cadastrado pela cesta já vira o da entrega.
              if (!enderecoEditando && voltarDoEndereco === "cesta") setEnderecoEntregaId(local.id);
              setView(voltarDoEndereco);
            }}
          />
        ) : (
          <CadastroEnderecoView onGo={goTo} />
        );
      case "enderecos":
        return (
          <EnderecosView
            selecionadoId={enderecoEntregaId}
            onSelecionar={setEnderecoEntregaId}
            onNovo={() => abrirFormularioEndereco(null, "enderecos")}
            onAlterar={(local) => abrirFormularioEndereco(local, "enderecos")}
          />
        );
      case "minha-conta": return <MinhaContaView onUsuarioAtualizado={setUsuario} />;
      case "pagina-principal": return <PaginaPrincipalView usuario={usuario} onGo={goTo} onSelectRestaurante={openRestaurante} />;
      case "restaurantes-cliente": return <RestaurantesListaView onSelect={openRestaurante} />;
      case "cardapio-restaurante":
        return (
          <CardapioRestauranteView
            restauranteId={restauranteId}
            onBack={() => setView("restaurantes-cliente")}
            onSelectProduto={openProdutoDetalhe}
            carrinho={carrinho}
            onAdicionar={adicionarAoCarrinho}
            onRemover={removerDoCarrinho}
            onVerCarrinho={() => goTo("cesta")}
          />
        );
      case "produto-detalhe":
        return (
          <ProdutoDetalheView
            produtoId={produtoId}
            onBack={() => setView("cardapio-restaurante")}
            carrinho={carrinho}
            onAdicionar={adicionarAoCarrinho}
            onRemover={removerDoCarrinho}
            onVerCarrinho={() => goTo("cesta")}
          />
        );
      case "cesta":
        return (
          <CestaView
            sacola={sacola}
            carregando={carregandoCesta}
            erro={erroCesta}
            tipoEntrega={tipoEntrega}
            onTipoEntregaChange={setTipoEntrega}
            onAumentar={aumentarItemCesta}
            onDiminuir={diminuirItemCesta}
            onRemoverItem={removerItemCesta}
            onBack={() => setView("restaurantes-cliente")}
            onContinuarComprando={() => setView(restauranteId ? "cardapio-restaurante" : "restaurantes-cliente")}
            localId={enderecoEntregaId}
            onTrocarEndereco={setEnderecoEntregaId}
            onNovoEndereco={() => abrirFormularioEndereco(null, "cesta")}
            onIrParaPagamento={(resumo) => {
              setResumoCesta(resumo);
              goTo("pedido-tipo-pagamento");
            }}
          />
        );
      case "pedido-tipo-pagamento":
        return (
          <TipoPagamentoView
            sacola={sacola}
            resumo={resumoCesta}
            tipoEntrega={tipoEntrega}
            onBack={() => setView("cesta")}
            onPedidoPronto={(pedido, metodo) => {
              setPedidoAtual(pedido);
              if (metodo === "dinheiro") {
                setSacola(null);
                setView("pedido-confirmado");
              } else {
                setView(metodo === "pix" ? "pedido-pix" : "pedido-cartao");
              }
            }}
          />
        );
      case "pedido-cartao":
        return (
          <FormularioCartaoView
            pedido={pedidoAtual}
            onBack={() => setView("pedido-tipo-pagamento")}
            onPagamentoConfirmado={(pagamento) => {
              setPedidoAtual((atual) => ({ ...atual, cupom_fiscal: pagamento?.nota_fiscal ?? null }));
              setSacola(null);
              setView("pedido-confirmado");
            }}
          />
        );
      case "pedido-pix":
        return (
          <PagamentoPixView
            pedido={pedidoAtual}
            onBack={() => setView("pedido-tipo-pagamento")}
            onPagamentoConfirmado={(pagamento) => {
              setPedidoAtual((atual) => ({ ...atual, cupom_fiscal: pagamento?.nota_fiscal ?? null }));
              setSacola(null);
              setView("pedido-confirmado");
            }}
          />
        );
      case "pedido-confirmado":
        return (
          <PedidoConfirmadoView
            pedido={pedidoAtual}
            onAcompanhar={acompanharPedido}
            onVoltarInicio={() => goTo("pagina-principal")}
          />
        );
      case "acompanhar-pedido":
        return <AcompanharPedidoView pedidoId={pedidoAcompanhadoId} onBack={() => goTo("historico")} />;
      case "historico": return <HistoricoView onAcompanhar={acompanharPedido} onGo={goTo} />;
      case "area-parceiro": return <AreaParceiroView onGo={goTo} onEditRestaurante={editarRestaurante} />;
      case "cadastro-restaurante": return <CadastroRestauranteView restauranteId={editRestauranteId} onGo={goTo} />;
      case "painel-entregas": return <EntregasView titulo={papel === "entregador" ? "ENTREGAS" : "PEDIDOS"} />;
      case "cardapios": return <CardapiosView onGo={goTo} />;
      case "dashboard": return <DashboardView onOpenOrder={openOrder} />;
      case "restaurantes": return <RestaurantesView />;
      case "pedidos": return <PedidosView onOpenOrder={openOrder} />;
      case "pedido-detalhe": return <PedidoDetalheView orderId={orderId} onBack={() => setView("pedidos")} />;
      case "entregas": return <EntregasView />;
      case "funcionalidades": return <FuncionalidadesView />;
      default: return <EmptyState title="EM CONSTRUÇÃO" subtitle="Essa área ainda não foi implementada." />;
    }
  };

  const isAdmin = papel === "admin";
  const adminTitle = ADMIN_TITLES[view] || ADMIN_TITLES.dashboard;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {isAdmin ? (
        <>
          <aside
            style={{
              width: 224, background: "var(--panel)", borderRight: "1px solid var(--border)",
              padding: 18, display: "flex", flexDirection: "column", gap: 16, minHeight: "100vh", flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Truck size={18} color="var(--accent)" />
              <span className="ef-logo" style={{ fontSize: 11 }}>ENTREGAFOOD</span>
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_ADMIN_SIDEBAR.map((n) => (
                <button
                  key={n.key}
                  onClick={() => setView(n.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8,
                    background: view === n.key || (n.key === "pedidos" && view === "pedido-detalhe") ? "var(--accent2-bg)" : "transparent",
                    border: "none", color: view === n.key ? "var(--accent2)" : "#c7c7c7",
                    fontFamily: "'Exo 2', sans-serif", fontSize: 12.5, cursor: "pointer", textAlign: "left",
                  }}
                >
                  <n.Icon size={15} /> {n.label}
                </button>
              ))}
            </nav>
            <button onClick={sair} className="ef-btn-outline" style={{ marginTop: "auto", justifyContent: "center" }}>
              <ArrowLeft size={14} /> SAIR
            </button>
          </aside>

          <main style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{adminTitle[0]}</span>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>{adminTitle[1]}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="ef-card" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", width: 300 }}>
                  <Search size={14} color="var(--muted)" />
                  <input placeholder="Buscar pedidos, restaurantes, usuários..." className="ef-input" style={{ border: "none", padding: 0, background: "transparent" }} />
                </div>
                <Bell size={17} color="var(--muted)" />
                <MessageCircle size={17} color="var(--muted)" />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{exibicaoUsuario(usuario).inicial}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{exibicaoUsuario(usuario).primeiroNome || "Visitante"}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{exibicaoUsuario(usuario).tipo.toUpperCase()}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: "24px 28px" }}>{renderView()}</div>
          </main>
        </>
      ) : papel === "visitante" ? (
        // Sem login: só a entrada (login, cadastro e Portal do Parceiro), sem menu.
        <main style={{ flex: 1, position: "relative", padding: "28px 20px" }}>
          {renderView()}
          <SystemStatus />
        </main>
      ) : (
        <>
          <ClientSidebar view={view} onGo={goTo} usuario={usuario} papel={papel || "visitante"} onSair={sair} />
          <main style={{ flex: 1, position: "relative", padding: "28px 32px" }}>
            {renderView()}
            <SystemStatus />
          </main>
        </>
      )}
    </div>
  );
}