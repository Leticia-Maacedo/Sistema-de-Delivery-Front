# 🍔 EntregaFood — Front-end

Interface web da plataforma EntregaFood, construída em **React 18 + Vite 5**. Consome a API REST do back-end ([Sistema-de-Delivery-Back](https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back)).

**Publicado em:** https://entregafood-front.onrender.com (API em `https://entregafood-api.onrender.com`).

**Sprint 1** — Login, Cadastro e Perfil do Usuário, integrados de ponta a ponta com a API real.
**Sprint 2** — Consulta de restaurantes e cardápio; cadastro com endereço (ViaCEP/Nominatim) e login por telefone (código).
**Sprint 3** — Cesta, fechamento do pedido com taxa de entrega, pagamento (cartão, PIX e dinheiro), acompanhamento com mapa e notificações, Portal do Parceiro e Minha conta.
**Sprint 4** — Cancelamento pelo cliente, relatórios, estoque no cardápio do parceiro e sugestões de produtos.
**Backlog final** — Painel de chamada, QR Code do código de entrega lido pela câmera, rota otimizada do entregador, código de barras dos produtos, compartilhamento nas redes sociais e avisos pelo Telegram.
**Grupo:** Amigos do Gilberto · Turma A · Faculdade Impacta

**Repositórios do projeto:** [back-end (API FastAPI)](https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back) · este front-end · [aplicativo Android](https://github.com/annahigaf/EntregaFood-Mobile) e [API do aplicativo](https://github.com/annahigaf/entregafood-api) (o app usa a própria API em Node.js, separada da API do site).

**📚 Documentação completa:** o Documento do Projeto (v6) descreve telas, rotas, banco, testes e o aplicativo Android. Os arquivos em `docs/` (`ARQUITETURA.md`, `TELAS_E_COMPONENTES.md`) são do início do projeto e foram mantidos como histórico — para o estado atual, use este README.

---

## Como rodar

### Opção rápida — tudo em Docker (banco + API + front-end)

Não precisa instalar Node nem Python, só o [Docker Desktop](https://www.docker.com/products/docker-desktop/). Clone este repositório e o do back-end lado a lado (mesma pasta-pai):

```bash
git clone https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back.git
git clone https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Front.git
cd Sistema-de-Delivery-Back
cp .env.example .env        # no Windows: copy .env.example .env
docker compose -f docker-compose.full.yml up -d --build
```

Front em **http://localhost:5173**, API em `http://localhost:8000`. Detalhes (volumes, hot-reload, como derrubar) estão no [README do back-end](https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back#opção-rápida--tudo-em-docker-banco--api--front-end).

### 1. Suba o back-end primeiro (rodando sem Docker)

Esse front não funciona sozinho — ele depende da API rodando. Veja o [README do back-end](https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back) pra subir o Postgres e a API em `http://localhost:8000`.

### 2. Instale as dependências e rode o front

```bash
npm install
npm run dev
```

Fica em **http://localhost:5173**.

Por padrão, o front conversa com a API em `http://localhost:8000`. Se a sua API estiver em outro endereço, crie um `.env` na raiz do projeto:

```
VITE_API_URL=http://localhost:8000
```

Para usar a API publicada no Render (sem subir o back-end local), coloque `VITE_API_URL=https://entregafood-api.onrender.com`.

---

## Publicar o front (Render, site estático gratuito)

O arquivo [`render.yaml`](render.yaml) já tem toda a configuração: build com `npm ci && npm run build`, publicação da pasta `dist`, branch `DEV` e a variável `VITE_API_URL` apontando para a API do Render. A cada push na `DEV`, o Render publica de novo sozinho.

### 1. Criar o site (quem tiver conta no Render; o site estático é gratuito)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Conectar o GitHub e escolher o repositório **Sistema-de-Delivery-Front**, branch **DEV**.
3. O Render lê o `render.yaml` e mostra o serviço **entregafood-front** (Static Site). Clicar em **Apply**.
4. Ao terminar, o endereço aparece no topo do serviço, algo como `https://entregafood-front.onrender.com`. (Se o nome já estiver em uso, o Render acrescenta um sufixo; use o endereço que ele mostrar.)

> O front pode ficar na conta de qualquer membro do grupo: ele só precisa do endereço público da API, não de acesso ao serviço da API.

### 2. Liberar o endereço novo na API (quem administra o serviço da API no Render)

No serviço **entregafood-api** → **Environment**:

| Variável | Valor |
|---|---|
| `CORS_ORIGINS` | `http://localhost:5173,https://entregafood-front.onrender.com` (o endereço do passo 1; separado por vírgula, sem barra no final) |
| `FRONTEND_URL` | `https://entregafood-front.onrender.com` (para onde o login com Google/Facebook devolve o usuário) |

Salvar → a API reinicia sozinha. Sem o `CORS_ORIGINS`, o site abre mas não consegue falar com a API (erro de CORS no console do navegador).

### 3. Login social (só se for usar Google/Facebook)

Os retornos do OAuth continuam na API (`/auth/google/callback` e `/auth/facebook/callback`), então não mudam. Mas, como o `FRONTEND_URL` agora é o site publicado, quem rodar o front local e entrar pelo Google/Facebook volta para o site publicado.

### 4. Conferir

Abrir o endereço do site, entrar com uma conta e fazer um pedido. A primeira chamada pode levar até 1 minuto, porque a API gratuita do Render "dorme" quando fica parada.

---

## Fluxo da aplicação

A navegação **não usa React Router**: `src/App.jsx` guarda a tela atual num `useState` (`view`) e troca de tela com um `switch`.
`src/data/navigation.js` define, para cada tipo de conta, o menu e as telas permitidas; `telaPermitida(papel, view)` devolve a tela inicial do papel quando alguém tenta abrir uma tela que não é dele.
Sem sessão, só abrem as telas de login e cadastro. O link `/?restaurante={id}` (compartilhado nas redes) abre direto o cardápio daquele restaurante, depois do login.

| Conta | Tela inicial | Menu |
|---|---|---|
| visitante | Login | login, login do parceiro e cadastros |
| cliente | Explorar | Início, Explorar, Restaurantes, Pedidos, Endereços, Minha conta |
| restaurante | Meu restaurante | Meu restaurante, Pedidos, Painel de chamada, Relatórios, Cardápio, Minha conta |
| entregador | Entregas | Entregas, Minha conta |
| admin | Dashboard | Dashboard, Usuários, Restaurantes, Produtos, Pedidos, Relatórios, Entregas |

A sessão (token JWT + dados do usuário) fica no `localStorage` (`entregafood_token` e `entregafood_usuario`). `src/api/client.js` centraliza todas as chamadas à API — nenhuma tela chama `fetch` direto — e transforma erros HTTP em `ApiError` com a mensagem da API. `public/sw.js` é o service worker das notificações.

---

## Funcionalidades implementadas

Todas as telas usam a API real (não há mais dados fictícios).

| Área | Telas (`src/views/...`) | O que fazem |
|---|---|---|
| **Acesso** | `cliente/LoginView`, `CadastroDadosView`, `CadastroTelefoneView`, `CadastroEnderecoView` | Login por e-mail/telefone e senha, código por e-mail, Google e Facebook; cadastro de cliente e de parceiro com endereço (ViaCEP, Nominatim, AwesomeAPI) |
| **Cliente** | `PaginaPrincipalView`, `InicioCategoriasView`, `RestaurantesListaView`, `CardapioRestauranteView`, `ProdutoDetalheView` | Restaurantes que entregam no endereço, cardápio com selo de funcionamento, sugestões de produtos e botão de compartilhar (WhatsApp, Facebook, X, link) |
| | `CestaView`, `TipoPagamentoView`, `FormularioCartaoView`, `PagamentoPixView`, `PedidoConfirmadoView` | Cesta com subtotal, taxa de entrega e total; entrega ou retirada; cartão e PIX (Asaas sandbox) ou dinheiro; trocar a forma de pagamento reaproveita o mesmo pedido |
| | `HistoricoView`, `AcompanharPedidoView`, `EnderecosView`, `MinhaContaView` | Pedidos, linha do tempo, mapa com o entregador, código e QR Code de entrega, cancelamento; endereços; dados, senha, avisos no Telegram e encerrar conta |
| **Parceiro** | `parceiro/AreaParceiroView`, `CadastroRestauranteView`, `CardapiosView`, `PainelChamadaView` | Restaurante (horário, raio, pausa), pedidos e números do dia; cardápio com estoque e código de barras lido pela câmera; painel de chamada para a TV do balcão |
| **Entregador** | `admin/EntregasView` | Entregas, saída para entrega, localização, confirmação pelo código ou pelo QR Code do cliente e rota otimizada no Google Maps |
| **Admin** | `admin/DashboardView`, `UsuariosView`, `RestaurantesView`, `ProdutosView`, `PedidosView`, `PedidoDetalheView`, `RelatoriosView` | Dashboard com dados reais, aprovação de restaurantes, usuários, produtos, pedidos e relatórios (também para o restaurante) |

Componentes de destaque (`src/components/`): `LeitorCodigo` (câmera, html5-qrcode), `QrCodeEntrega` (qrcode), `RotaEntregas` (+ `data/rota.js`, caminho mínimo), `CompartilharRestaurante`, `AvisosTelegram`, `SugestoesProdutos`, `GoogleMapa`, `BotaoNotificacoes`.

---

## Limitações conhecidas

- **Login social (Google/Facebook)**: implementado. Como os aplicativos OAuth estão em modo de teste nos provedores, só entram as contas cadastradas como testadoras; para testar, use e-mail e senha.
- **API gratuita do Render**: depois de um tempo parada, a primeira chamada pode levar até 1 minuto.
- **Câmera (QR Code e código de barras)**: precisa de HTTPS (ou localhost) e da permissão do navegador.
- **Pagamento**: Asaas em modo sandbox, sem dinheiro de verdade (cartões de teste do Asaas).
- **Controle de acesso**: o front esconde as telas de outros tipos de conta, mas quem protege de verdade é a API (`401`/`403`).
- **Avaliações**: ainda não implementadas.

---

## 👥 Equipe

* Leticia da Silva Macedo
* Anna Julia Higa Farincho
* Geovane Soares da Silva
* Richard Ferreira do Nascimento Santos

## 📚 Contexto acadêmico

Projeto desenvolvido para a disciplina de **Desenvolvimento de Sistemas de Informação — Sistemas de Informação**, utilizando metodologia baseada em **Scrum e Sprints**.
