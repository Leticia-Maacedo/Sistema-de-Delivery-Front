# Catálogo de Telas e Componentes — EntregaFood (Front-end)

Referência tela a tela e componente a componente. Para entender **como**
tudo se conecta (roteamento, API client, estado), leia primeiro
`docs/ARQUITETURA.md` — este documento é o "o que existe e pra que serve",
aquele é o "como as peças se encaixam".

**Coluna "Dados"**: `API real` (chama `src/api/client.js`, que fala com o
backend), `Mock` (usa `src/data/mockData.js`, dados fictícios fixos no
código) ou `—` (tela sem dado externo, só navegação/UI estática).

**Coluna "Roteada?"**: se a tela aparece em algum `case` do `switch` de
`src/App.jsx` (ou seja, se dá pra chegar nela navegando pelo app). "Não" não
significa quebrada — significa que ninguém a conectou ainda.

---

## Componentes (`src/components/`)

| Componente | Arquivo | Props | Descrição |
|---|---|---|---|
| `ClientSidebar` | `ClientSidebar.jsx` | `view`, `onGo` | Sidebar esquerda das áreas Cliente + Parceiro, com as duas seções de navegação (`NAV_CLIENTE`, `NAV_PARCEIRO`) e o cartão de usuário fixo no rodapé. A área Admin tem sidebar própria, definida direto em `App.jsx`. |
| `ClientTopBar` | `ClientTopBar.jsx` | `searchValue`, `onSearchChange`, `placeholder`, `notifCount` | Barra de busca + sino de notificação + favoritos, usada em telas de listagem do cliente (ex.: `RestaurantesListaView`). |
| `SystemStatus` | `SystemStatus.jsx` | — | Indicador fixo "SYSTEM ONLINE" no canto inferior direito, decorativo, renderizado uma vez em `App.jsx` para as áreas cliente/parceiro. |
| `EmptyState` | `EmptyState.jsx` | `title`, `subtitle` | Placeholder genérico para lista vazia ou tela ainda não implementada (é o que aparece no `default:` do roteador). |
| `PageHeader` | `PageHeader.jsx` | `Icon`, `title`, `subtitle` | Cabeçalho padrão (ícone + título + subtítulo) repetido no topo da maioria das telas. |
| `Field` | `Field.jsx` | `label` + qualquer prop de `<input>` | `<label>` + `<input className="ef-input">` — o campo de formulário padrão do projeto. |
| `StatusBadge` | `StatusBadge.jsx` | `status` | Badge colorido (bolinha + texto) para status de pedido; a cor vem de `STATUS_STYLE` em `data/mockData.js`. |
| `Stars` | `Stars.jsx` | `n` (nota de 1 a 5) | Renderiza 5 ícones de estrela, preenchendo até `n`. |
| `StatCard` | `StatCard.jsx` | `Icon`, ...(ver arquivo) | Cartão de métrica (ícone + número) usado no dashboard admin. |
| `DetailRow` | `DetailRow.jsx` | `Icon`, ...(ver arquivo) | Linha "ícone + label + valor", usada em telas de detalhe (pedido, entrega). |
| `Toggle` | `Toggle.jsx` | `on`, `onClick` | Switch on/off estilizado (usado em `CardapiosView` para disponibilidade de item). |
| `Pagination` | `Pagination.jsx` | `page`, `totalPages`, `onChange` | Paginação numérica simples; não renderiza nada se `totalPages <= 1`. |
| `ViewToggle` | `ViewToggle.jsx` | `view` (`"grid"`\|`"list"`), `onChange` | Alterna entre visualização em grade/lista (usado em `RestaurantesListaView`). |

---

## Área Cliente (`src/views/cliente/`)

| Tela | Arquivo | Roteada? | Dados | Descrição |
|---|---|---|---|---|
| Início / Categorias | `InicioCategoriasView.jsx` | Sim (`inicio-categorias`, tela inicial do app) | Mock (`CATEGORIES`) | Landing com categorias (Restaurantes, Mercados, Bebidas...). |
| Login | `LoginView.jsx` | Sim (`login`) | **API real** | Maior tela do projeto (499 linhas). Login por senha (e-mail ou telefone), login por OTP de telefone, e botões de login social (Google/Facebook, via redirect). Recebe `erroInicial` do `App.jsx` para mostrar um erro vindo do callback OAuth. |
| Cadastro — Dados | `CadastroDadosView.jsx` | Sim (`cadastro-dados`) | **API real** | Primeiro passo do cadastro: nome, e-mail, senha, tipo de conta. Ao concluir, chama `aoCadastrar` (o `App.jsx` avança para `cadastro-endereco`). |
| Cadastro — Endereço | `CadastroEnderecoView.jsx` | Sim (`cadastro-endereco`) | **API real** + ViaCEP/Nominatim | Segundo passo: endereço, com CEP autocompletando via ViaCEP e geocodificação via Nominatim antes de `POST /locais`. |
| Cadastro por telefone | `CadastroTelefoneView.jsx` | **Não** | **API real** | Fluxo alternativo de cadastro só com telefone + OTP (equivalente a `POST /auth/telefone/cadastro/*`). Existe e está funcional isoladamente, mas ainda não foi encaixado no `switch` de `App.jsx` nem em `data/navigation.js`. |
| Página Principal | `PaginaPrincipalView.jsx` | Sim (`pagina-principal`, tela pós-login) | Mock (`CATEGORIES`, `RESTAURANTS`) | Home autenticada: saudação, categorias, restaurantes em destaque. |
| Restaurantes (lista/busca) | `RestaurantesListaView.jsx` | Sim (`restaurantes-cliente`) | Mock (`RESTAURANTS`) | Listagem com busca, alternância grade/lista (`ViewToggle`) e paginação (`Pagination`, 3 por página). Ainda não está ligada em `GET /consultas/restaurantes` — usa a lista fixa de `mockData.js`. |
| Cardápio do restaurante | `CardapioRestauranteView.jsx` | Sim (`cardapio-restaurante`) | Mock (`MENUS_POR_RESTAURANTE`) | Abas Cardápio/Avaliações/Sobre + carrinho **local** (`useState`, não persiste ao sair da tela). Recebe `restauranteId` via prop. Ainda não ligada em `GET /consultas/restaurantes/{id}/cardapio`. |
| Produtos (CRUD) | `ProdutosView.jsx` | **Não** | **API real** | CRUD completo de produto (criar/listar/editar/excluir), já chamando `produtos.*` e `restaurantes.*` de `api/client.js`. Existe e funciona isoladamente, mas não está no roteador — provável destino é a área Parceiro, não Cliente (o nome do arquivo sugere que pode ter sido movido/renomeado em andamento). |
| Endereços | `EnderecosView.jsx` | **Não** | — | Arquivo vazio (0 bytes). Só o nome reservado — nada implementado ainda. |
| Pagamento | `PagamentoView.jsx` | Sim (`pagamento`) | Mock (`PAYMENT_METHODS`) | Lista formas de pagamento salvas e permite marcar uma como padrão (estado só local, não persiste no backend — não existe endpoint de pagamento ainda, ver `docs/BANCO_DE_DADOS.md` do back). |
| Histórico | `HistoricoView.jsx` | Sim (`historico`) | Mock (`ORDERS`) | Lista de pedidos anteriores; clicar num pedido chama `onOpenOrder(id)` (abre `PedidoDetalheView`, do admin — reaproveitado). |
| Perfil | `PerfilView.jsx` | **Não** | **API real** (quebrada) | Edição de dados da conta + exclusão. Importa `auth`, `limparSessao`, `atualizarUsuarioSalvo` e `obterUsuarioSalvo` de `api/client.js` — **nenhuma dessas quatro funções existe lá hoje** (ver "Débitos técnicos" em `docs/ARQUITETURA.md`). Não conectar ao roteador sem antes corrigir esses imports. |

---

## Área Parceiro (`src/views/parceiro/`)

Visão de quem **gerencia** um restaurante (dono/gerente).

| Tela | Arquivo | Roteada? | Dados | Descrição |
|---|---|---|---|---|
| Área do Parceiro | `AreaParceiroView.jsx` | Sim (`area-parceiro`) | Mock (pedidos) + **API real** (dados do restaurante, via `getRestauranteAtivo`/`restaurantesApi`) | Painel do parceiro: métricas, pedidos recentes (mock) e card com os dados reais do restaurante ativo (cache local, ver `saveRestauranteAtivo`/`getRestauranteAtivo` em `api/client.js`). Aceita uma prop `onEditRestaurante` para abrir a edição do restaurante — mas `App.jsx` não a repassa ao renderizar `<AreaParceiroView onGo={goTo} />`, então o botão "editar" hoje não faz nada (chamada opcional, `onEditRestaurante?.(...)`). |
| Cardápios | `CardapiosView.jsx` | Sim (`cardapios`) | Mock (`MENU_INICIAL`) | Gestão do cardápio do parceiro: toggle de disponibilidade, remover item, adicionar item via `window.prompt`. Ainda não ligada em `POST/PUT/DELETE /produtos`. |
| Avaliações | `AvaliacoesView.jsx` | Sim (`avaliacoes`) | Mock (`REVIEWS`) | Lista avaliações recebidas, com campo de resposta por avaliação (estado só local). |
| Cardápio do restaurante | `parceiro/CardapioRestauranteView.jsx` | **Não** (nome duplicado com a versão cliente — ver nota) | **API real** | Cadastro/edição do próprio restaurante: cria um `Local` e um `Restaurante` vinculado (`POST /locais` + `POST /restaurantes`), com CEP/geocodificação como no cadastro do cliente. É o destino natural do `onEditRestaurante` de `AreaParceiroView` acima, mas ainda não foi importado nem ligado em `App.jsx`. Não é a mesma tela que `cliente/CardapioRestauranteView.jsx` (que mostra o cardápio pro cliente pedir) — o nome igual é coincidência de nomenclatura entre duas pastas, preste atenção no caminho de import. |

---

## Área Admin (`src/views/admin/`)

Painel interno (equipe EntregaFood). Layout próprio, definido direto em
`App.jsx` (sidebar com todos os itens de `NAV_ADMIN_SIDEBAR`).

| Tela | Arquivo | Roteada? | Dados | Descrição |
|---|---|---|---|---|
| Dashboard | `DashboardView.jsx` | Sim (`dashboard`) | Mock (`ORDERS`, `DELIVERIES`, `ACTIVITIES`, `INTEGRATIONS`, `REVENUE`) | Visão geral: gráfico de faturamento (SVG desenhado à mão, sem lib de gráfico), pedidos recentes, entregas ativas, atividades, integrações. Também renderiza o fluxo `FLOW` de `data/features.js`. |
| Restaurantes | `RestaurantesView.jsx` | Sim (`restaurantes`) | **API real** | CRUD completo, já integrado com `restaurantes.*` de `api/client.js` (a tela mais recentemente migrada de mock para API real). Busca local por nome/CNPJ/status sobre a lista já carregada (não manda `?busca=` pro backend). |
| Usuários | `UsuariosView.jsx` | **Não** (existe menu "Usuários" em `NAV_ADMIN_SIDEBAR`, mas sem `case` correspondente em `App.jsx`) | **API real** (com um import quebrado — ver `docs/ARQUITETURA.md`) | CRUD completo de usuário, já chamando `usuarios.*`. Precisa: 1) adicionar o `case "usuarios"` no `switch` de `App.jsx`; 2) trocar `obterUsuarioSalvo` por `getUsuario` (ou criar o alias). |
| Pedidos | `PedidosView.jsx` | Sim (`pedidos`) | Mock (`ORDERS`) | Tabela de todos os pedidos; clicar numa linha chama `onOpenOrder`. |
| Detalhe do Pedido | `PedidoDetalheView.jsx` | Sim (`pedido-detalhe`) | Mock (`ORDERS`) | Detalhe de um pedido (itens, subtotal, status), reaproveitado também pelo Histórico do cliente. Recebe `orderId` via prop. |
| Entregas | `EntregasView.jsx` | Sim (`entregas`) | Mock (`DELIVERIES`) | Lista de entregas ativas + detalhe da selecionada (mapa/posição ainda não implementados, só texto). |
| Funcionalidades | `FuncionalidadesView.jsx` | Sim (`funcionalidades`) | `data/features.js` (estático, mas com status real) | Painel mostrando quais funcionalidades do fluxo de atividades já foram implementadas no backend (selo IMPLEMENTADO/PENDENTE por item) — ver `Sistema-de-Delivery-Back/README.md`, seção "Funcionalidades implementadas", para a fonte da verdade. |

**Itens de menu sem tela** (aparecem em `NAV_ADMIN_SIDEBAR` mas caem no
`EmptyState` padrão do roteador ao clicar): `pagamentos`, `relatorios`,
`configuracoes`, `integracoes`, `suporte`. E `usuarios`/`produtos` têm tela
pronta (`UsuariosView`, `ProdutosView`) mas ainda não têm `case` no
`switch` — ver tabela acima.

---

## `src/data/` — dados estáticos

| Arquivo | Exporta | Uso |
|---|---|---|
| `navigation.js` | `NAV_CLIENTE`, `NAV_CLIENTE_HIDDEN`, `NAV_PARCEIRO`, `NAV_ADMIN_SIDEBAR`, `ADMIN_TITLES` | Itens de menu por área + título/subtítulo exibido no topo do layout admin, indexado pela `view` atual. |
| `features.js` | `FEATURES` (usado por `FuncionalidadesView`), `FLOW` (usado por `DashboardView`) | `FEATURES` tem os campos `titulo`, `desc`, `Icon`, `pronto` (bool) e `endpoint` (opcional) — ao implementar uma funcionalidade nova no backend, atualize a entrada correspondente aqui. |
| `mockData.js` | `ORDERS`, `RESTAURANTS`, `CATEGORIES`, `MENUS_POR_RESTAURANTE`, `MENU_INICIAL`, `DELIVERIES`, `ACTIVITIES`, `INTEGRATIONS`, `REVENUE`, `REVIEWS`, `PAYMENT_METHODS`, `STATUS_STYLE`, `fmt` (formatador de moeda) | Dados fictícios usados pelas telas ainda não integradas à API — ver `docs/ARQUITETURA.md`, §6. |
