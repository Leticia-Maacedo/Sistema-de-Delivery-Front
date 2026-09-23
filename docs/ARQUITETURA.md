# Arquitetura do Front-end — EntregaFood

> Público-alvo deste documento: alguém que acabou de entrar no projeto e
> nunca viu este código. Complementa `docs/TELAS_E_COMPONENTES.md` (catálogo
> tela a tela) com a visão de "como as peças se encaixam".

## 1. Visão geral

Aplicação **React 18 + Vite 5**, sem TypeScript, sem framework de UI
(nenhum Material UI/Chakra/Tailwind — todo o visual é CSS-in-JS via prop
`style={{...}}` inline, mais algumas classes utilitárias globais em
`src/styles/global.css`). Consome a API REST do backend
(`Sistema-de-Delivery-Back`, repositório separado) via `fetch`.

```
package.json → dependencies: react, react-dom, lucide-react (ícones)
             → devDependencies: vite, @vitejs/plugin-react
```

Não há `react-router-dom`, Redux, Zustand, React Query nem nenhuma outra
biblioteca de rota/estado global. Isso é uma escolha deliberada de escopo
(app pequeno, sem necessidade de URL profunda) — ver §2.

## 2. Roteamento: um `switch` em vez de React Router

`src/App.jsx` é o componente raiz e **também o roteador**. Não existe URL por
tela — a "rota atual" é só uma `string` guardada em `useState`:

```jsx
const [view, setView] = useState("inicio-categorias");
const [groupKey, setGroupKey] = useState("cliente"); // "cliente" | "parceiro" | "admin"
```

`renderView()` é um `switch (view)` gigante que devolve o componente da tela
correspondente. Trocar de tela é chamar `setView("outra-chave")` — geralmente
via `goTo(key)`, que além de trocar a view também recalcula `groupKey`
olhando em qual dos arrays de navegação (`NAV_CLIENTE`, `NAV_PARCEIRO`,
`NAV_ADMIN_SIDEBAR`, todos em `src/data/navigation.js`) aquela chave aparece.

**Consequência prática para quem for mexer:** não existe deep link (não dá
pra compartilhar uma URL de uma tela específica), não existe botão
"voltar" do navegador funcional, e navegar entre telas não passa parâmetros
pela URL — passa por **props e callbacks** (`onGo`, `onSelect`,
`onOpenOrder`, etc.) e por pedaços de estado no topo do `App`: `orderId`,
`restauranteId`, `produtoId` e `editRestauranteId`, usados para dizer à
tela de destino *qual* pedido/restaurante/produto abrir (ou, no último
caso, se `cadastro-restaurante` deve abrir em modo criação ou edição).

O **carrinho** (`carrinho`, um objeto `{ produtoId: quantidade }`) também
mora no `App.jsx`, não dentro de uma tela — de propósito: tanto
`CardapioRestauranteView` quanto `ProdutoDetalheView` (ver
`docs/TELAS_E_COMPONENTES.md`) precisam ler e alterar o mesmo carrinho
enquanto o usuário navega entre as duas, o que não seria possível se cada
uma guardasse seu próprio `useState`. `adicionarAoCarrinho`/
`removerDoCarrinho` (definidas no `App.jsx`) são passadas como props para
as duas telas.

```jsx
const openRestaurante = (id) => {
  setRestauranteId(id);
  setView("cardapio-restaurante");
};
// CardapioRestauranteView recebe restauranteId como prop e busca os dados dele
```

Se o projeto crescer, migrar para `react-router-dom` é o caminho natural —
hoje não existe porque nunca foi necessário.

### `groupKey`: três "áreas" com layout próprio

O JSX de `App.jsx` decide o layout (sidebar diferente, topbar diferente)
com base em `groupKey === "admin"` (`if/else`), não com um roteador de
layouts:

| `groupKey` | Sidebar | Quem usa |
|---|---|---|
| `"cliente"` | `ClientSidebar` (compartilhada com parceiro, ver abaixo) | Consumidor final pedindo comida |
| `"parceiro"` | mesma `ClientSidebar` (mostra a seção "PARCEIRO" dela) | Dono de restaurante gerenciando cardápio/avaliações |
| `"admin"` | sidebar própria, inline dentro do próprio `App.jsx` (não é um componente separado) | Painel administrativo (visão da Letícia, ver o avatar fixo "L" no rodapé da sidebar) |

## 3. Estrutura de pastas

```
src/
├── main.jsx                 Bootstrap do React (ReactDOM.createRoot).
├── App.jsx                  Componente raiz + roteador (switch de views) + layout admin inline.
│
├── api/
│   ├── client.js             TODA a comunicação com o backend passa por aqui. Ver §4.
│   └── geo.js                 ViaCEP + Nominatim — serviços externos, NÃO passam pelo backend. Ver §5.
│
├── data/
│   ├── navigation.js          Arrays estáticos: itens de menu por área + títulos do admin.
│   ├── features.js             Lista exibida na tela FuncionalidadesView (admin) — ver docs/TELAS_E_COMPONENTES.md.
│   └── mockData.js             Dados fake (pedidos, restaurantes, status) ainda usados por telas
│                                que não foram integradas à API de verdade. Ver §6.
│
├── styles/
│   └── global.css              Variáveis CSS (cores, tema escuro), reset básico, classes utilitárias
│                                (.ef-card, .ef-input, .ef-btn-solid, .ef-btn-outline, .ef-icon-btn, .ef-logo).
│
├── components/                 Componentes pequenos e reutilizáveis, sem estado de domínio.
│   (catálogo completo em docs/TELAS_E_COMPONENTES.md)
│
└── views/                      Uma pasta por área, um arquivo por tela.
    ├── cliente/                 Telas do consumidor final (login, cadastro, catálogo, pagamento...)
    ├── parceiro/                Telas de quem gerencia um restaurante
    └── admin/                   Telas do painel administrativo
```

## 4. Comunicação com o backend (`src/api/client.js`)

Ponto único de integração — nenhuma `view` chama `fetch` diretamente, todas
importam funções deste arquivo.

- **`apiFetch(path, options)`**: wrapper de `fetch` que já injeta
  `Content-Type: application/json`, o header `Authorization: Bearer <token>`
  quando há sessão salva, e converte respostas de erro em uma `ApiError`
  (com `.status` e `.detail`) em vez de deixar o `catch` genérico. `204 No
  Content` é tratado explicitamente (devolve `null` em vez de tentar
  parsear um corpo vazio como JSON).
- **`API_URL`**: lido de `import.meta.env.VITE_API_URL`, com fallback para a
  instância de produção no Render. Em desenvolvimento local, defina
  `VITE_API_URL=http://localhost:8000` (ver `.env.example`).
- **Sessão**: `saveToken`/`getToken`/`logout` guardam o JWT e o usuário em
  `localStorage` (chaves `entregafood_token`, `entregafood_usuario`) — não
  há cookie de sessão, o front é 100% stateless em relação ao servidor
  entre reloads (a sessão sobrevive a um F5 porque está no `localStorage`,
  não porque o servidor lembra de nada).
- **OAuth**: `consumeOAuthResultFromQuery()` é chamada uma vez, no
  `useEffect` de montagem do `App.jsx` — lê `#oauth_token=...` ou
  `?oauth_erro=...` da URL (é assim que o backend devolve o resultado do
  login Google/Facebook, via redirect), salva o token se houver, e limpa a
  URL com `history.replaceState` para não deixar o token visível na barra
  de endereço depois do primeiro carregamento.
- **Organização das funções**: espelha os domínios do backend — há tanto
  funções soltas (`loginWithPassword`, `registerUsuario`, ...) quanto
  objetos agrupadores (`usuarios.criar/listar/obter/atualizar/remover`,
  `locais.*`, `restaurantes.*`, `produtos.*`) que são só atalhos para as
  mesmas chamadas. Ambos os estilos convivem no arquivo — ao adicionar uma
  função nova para um domínio que já tem objeto agrupador (`usuarios`,
  `locais`, `restaurantes`, `produtos`), siga o padrão do objeto.

## 5. Serviços externos usados só pelo front (`src/api/geo.js`)

Dois serviços públicos, gratuitos, sem chave de API, que **não passam pelo
backend do EntregaFood** — são chamados direto do navegador para ajudar a
preencher o formulário de endereço:

| Serviço | Função | Uso |
|---|---|---|
| [ViaCEP](https://viacep.com.br) | `buscarEnderecoPorCep(cep)` | Preenche rua/bairro/cidade/UF a partir do CEP digitado. |
| [Nominatim](https://nominatim.openstreetmap.org) (OpenStreetMap) | `geocodificarEndereco(enderecoCompleto)` | Converte o endereço em texto para `{latitude, longitude}`, exigidos pelo backend (`local.latitude`/`longitude` são `NOT NULL`). Se falhar, devolve `{0, 0}` em vez de travar o cadastro — comentário no próprio código explica a decisão. |

Se o volume de cadastros crescer, o comentário no código já sinaliza a
Google Maps Geocoding API como substituta mais robusta (paga, com chave).

## 6. Dados mockados vs. dados reais

Nem toda tela está integrada com a API de verdade ainda. `src/data/mockData.js`
contém pedidos, restaurantes e estilos de status **fictícios**, usados pelas
telas que ainda simulam o backend (ex.: dashboard/pedidos do admin,
histórico e pagamento do cliente). Boa parte do fluxo principal do cliente
já foi migrada para a API real: `RestaurantesListaView` e
`CardapioRestauranteView` (cliente) chamam `consultas.*` (que fala com
`GET /consultas/restaurantes*` no backend), e a nova `ProdutoDetalheView`
chama `produtos.obter`. No admin, `RestaurantesView` também já usa
`restaurantes.*` de verdade. Ao mexer numa tela, confira se ela importa de
`../../data/mockData` (ainda mock) ou de `../../api/client` (já real) antes
de assumir de onde os dados vêm — o catálogo tela a tela em
`docs/TELAS_E_COMPONENTES.md` mantém isso atualizado.

## 7. Estilo visual

Tema único, escuro, definido em `src/styles/global.css` via variáveis CSS
(`:root`): `--bg`, `--panel`, `--card`, `--border`, `--accent` (verde-limão,
cor de destaque principal), `--accent2` (roxo, destaque secundário),
`--good` (verde, sucesso), `--muted` (cinza, texto secundário), `--hover`.
Não há alternância claro/escuro — é um único tema fixo, estilo "painel de
controle" (fontes `Orbitron`/`Press Start 2P` para títulos/números,
`Exo 2` para texto corrido, ambas carregadas via Google Fonts no CSS).
Classes utilitárias reaproveitadas em quase toda tela: `.ef-card`,
`.ef-input`, `.ef-btn-solid`, `.ef-btn-outline`, `.ef-icon-btn`, `.ef-logo`.

## 8. Débitos técnicos e inconsistências conhecidas

Vale a pena qualquer um que mexer nestas áreas saber disso de antemão:

- **Imports que não existem em `api/client.js`.** `UsuariosView.jsx` (admin)
  importa e chama `obterUsuarioSalvo` — mas o `client.js` só exporta
  `getUsuario()` (mesmo propósito, nome diferente). `PerfilView.jsx`
  (cliente) vai além: importa `auth`, `limparSessao`, `atualizarUsuarioSalvo`
  **e** `obterUsuarioSalvo`, nenhum dos quatro exportado por `client.js`
  (os equivalentes reais são `getUsuario`, `logout`, e não há hoje uma
  função de "atualizar o usuário em cache" nem um objeto `auth`). Hoje isso
  não quebra nada em produção porque **nenhuma das duas telas está
  conectada no roteador** (próximo item) — mas vai quebrar em runtime
  (`TypeError: ... is not a function`) no dia em que alguém as conectar sem
  notar. Ao integrar essas telas, ajuste as chamadas para as funções que
  realmente existem em `client.js`, ou adicione lá o que estiver faltando.
- **Telas existentes mas não roteadas** (não aparecem em nenhum `case` do
  `switch` de `App.jsx`, nem em `data/navigation.js`): `CadastroTelefoneView`,
  `ProdutosView` (cliente), `PerfilView`. Provavelmente trabalho em
  andamento de outro integrante — existem, foram escritas, mas ainda não
  foram "plugadas". `src/views/cliente/EnderecosView.jsx` é ainda mais cedo
  no processo: é um arquivo vazio (0 bytes), só o nome reservado.
- **Itens do menu admin sem tela por trás**: `NAV_ADMIN_SIDEBAR` (em
  `data/navigation.js`) lista `usuarios`, `produtos`, `pagamentos`,
  `relatorios`, `configuracoes`, `integracoes`, `suporte` — mas o `switch`
  de `App.jsx` só trata `dashboard`, `restaurantes`, `pedidos`,
  `pedido-detalhe`, `entregas` e `funcionalidades`. Clicar nos demais itens
  do menu admin cai no `default` do switch (`EmptyState` "EM CONSTRUÇÃO").
  Isso é esperado hoje, não um bug — mas é fácil confundir com "a tela
  sumiu" se você não souber que o roteamento é manual.
- **`src/views/parceiro/CardapioRestauranteView.jsx` está morto.** Fazia o
  mesmo papel (cadastrar/editar o restaurante do parceiro) que a nova
  `src/views/parceiro/CadastroRestauranteView.jsx` faz hoje — só a segunda
  foi importada em `App.jsx` e ligada à rota `cadastro-restaurante`. A
  primeira continua no repositório, sem nenhum import apontando pra ela;
  ao mexer no cadastro de restaurante do parceiro, confirme que está no
  arquivo certo (`CadastroRestauranteView.jsx`).
- **Mismatch de maiúsculas no nome de um arquivo.** `App.jsx` importa
  `import ProdutoDetalheView from "./views/cliente/ProdutoDetalheView"`,
  mas o arquivo em disco se chama `Produtodetalheview.jsx` (letras "d" e
  "v" minúsculas). Funciona no Windows e no macOS (sistema de arquivos não
  diferencia maiúsculas de minúsculas por padrão), mas **quebra em CI/deploy
  Linux** (case-sensitive) com um erro de módulo não encontrado. Vale
  renomear o arquivo para `ProdutoDetalheView.jsx` assim que possível.
- **`ViewToggle` e `Pagination` (componentes) estão sem nenhum uso.**
  `RestaurantesListaView` era o único consumidor de ambos; na migração
  dessa tela de dado mockado para `consultas.restaurantes` (ver §6), a
  alternância grade/lista e a paginação local foram removidas junto (a
  paginação agora, se existir, seria do backend). Os dois componentes
  continuam em `src/components/`, prontos pra reuso, mas hoje não são
  importados em lugar nenhum.
- **Mistura mock/API real** (ver §6) — não assuma que todo dado exibido vem
  do backend.
