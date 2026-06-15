# Roteiro de Apresentação — IREST (tela a tela)

Roteiro para demonstrar o sistema ao vivo, percorrendo os **4 perfis**:
**Visitante** (sem login) → **Usuário** → **Funerária** → **Administrador**.

A ordem conta uma história: primeiro o que qualquer pessoa vê, depois o que cada papel
desbloqueia. Duração sugerida: **12–15 min**.

---

## 0. Preparação (antes de começar)

- [ ] Backend no ar (`http://olvrgabriel-001-site1.ktempurl.com/api/funerarias` responde)
- [ ] Frontend aberto (Vercel) em aba anônima/limpa (sem sessão)
- [ ] 3 contas prontas para login rápido:
  - **Usuário** comum
  - **Funerária** (prestador)
  - **Admin** (credenciais do AdminSeed)
- [ ] Pelo menos 1 funerária com serviços, avaliações e endereço (para o mapa aparecer)
- [ ] Frase de abertura: *"O IREST conecta famílias a funerárias com transparência — buscar,
      comparar e avaliar serviços funerários num momento delicado, com calma."*

---

## PARTE 1 — VISITANTE (público, sem login)

### Tela 1 — Home `/`
- **Objetivo:** mostrar a porta de entrada e a proposta de valor.
- **O que fazer:** apontar o título, usar os **filtros** (cidade, tipo de serviço, texto,
  preço mín/máx) e mostrar os cards atualizando.
- **Fala:** *"Logo de cara o usuário encontra funerárias e filtra por cidade, serviço e faixa de
  preço. Os filtros rodam na hora, sem recarregar a página."*
- **Destaque:** SPA Angular; a filtragem acontece no próprio navegador.

### Tela 2 — Detalhes da funerária `/detalhes/:id`
- **Objetivo:** mostrar a ficha completa.
- **O que fazer:** clicar em **Ver detalhes** e percorrer as seções:
  **Sobre** → **Serviços** (com preços) → **Localização** (mapa **Leaflet/OpenStreetMap**) →
  **Avaliações** (estrelas + comentários).
- **Fala:** *"Aqui está tudo para decidir: descrição, serviços com preço, o mapa com a localização
  e as avaliações reais de quem já usou."*
- **Destaque:** o mapa usa as coordenadas que o **backend gerou via geocoding** ao cadastrar a
  funerária. Mostrar o botão **"Entrar para Avaliar"** — avaliar exige login (gancho para a próxima parte).

### Tela 3 — Busca `/busca`
- **Objetivo:** reforçar a descoberta.
- **O que fazer:** mostrar a listagem/resultados de busca.
- **Fala:** *"Uma visão dedicada de busca para comparar opções lado a lado."*

### Tela 4 — Como funciona `/como-funciona` e Ajuda `/ajuda`
- **Objetivo:** mostrar o conteúdo de apoio.
- **Fala:** *"Páginas explicativas e central de ajuda para quem está chegando."*

---

## PARTE 2 — CADASTRO E LOGIN

### Tela 5 — Cadastro `/cadastro` e `/cadastro-funeraria`
- **Objetivo:** mostrar os dois tipos de conta.
- **O que fazer:** abrir o cadastro de usuário (nome, e-mail, senha, **pergunta de segurança**)
  e citar o cadastro de funerária (com cidade, estado, telefone, endereço).
- **Fala:** *"Há dois cadastros: o usuário comum e a funerária — que informa endereço, usado depois
  para o mapa. Toda senha é guardada com hash; a pergunta de segurança serve para recuperação."*
- **Destaque:** senha nunca é salva em texto puro (**BCrypt** no backend).

### Tela 6 — Login `/login` e Esqueci a senha `/esqueci-senha`
- **Objetivo:** mostrar o acesso unificado.
- **O que fazer:** fazer login; mostrar rapidamente o fluxo de **esqueci a senha** (devolve a
  pergunta de segurança, valida a resposta e redefine).
- **Fala:** *"Um login só para os três perfis — o sistema identifica se é usuário, funerária ou
  admin e libera as telas certas."*
- **Destaque:** no login o backend emite um **JWT** com o papel; o app guarda o token e o envia
  em toda requisição seguinte.

---

## PARTE 3 — PERFIL USUÁRIO

> Logar como **usuário**. O menu do topo muda conforme o papel.

### Tela 7 — Meu Painel `/meu-painel`
- **Objetivo:** mostrar a área pessoal.
- **O que fazer:** percorrer as abas **Visão Geral** (cartões *Favoritos* e *Avaliações Feitas* +
  **Minha Conta** com nome/e-mail), **Favoritos** e **Minhas Avaliações**.
- **Fala:** *"O usuário acompanha aqui o que salvou e o que avaliou, e gerencia a própria conta."*

### Tela 8 — Favoritar (na página de detalhes)
- **O que fazer:** voltar a uma funerária e clicar em **Favoritar**; mostrar que ela aparece em
  *Meus Favoritos*.
- **Fala:** *"Com um clique a família guarda as opções que está considerando."*

### Tela 9 — Avaliar `/avaliar/:id`
- **Objetivo:** mostrar a criação de avaliação (exclusivo do usuário).
- **O que fazer:** dar uma nota (1–5 estrelas) + comentário e enviar; mostrar a avaliação
  aparecendo na funerária e em *Minhas Avaliações*.
- **Fala:** *"Só usuários logados avaliam, garantindo que as notas vêm de pessoas reais."*
- **Destaque:** o backend exige **papel `usuario`** para criar a avaliação — controle de verdade,
  não só na tela.

### Tela 10 — Chat `/chat`
- **Objetivo:** mostrar o assistente de IA.
- **O que fazer:** perguntar algo como *"quais documentos preciso para o funeral?"* e mostrar a
  resposta.
- **Fala:** *"Um assistente que orienta sobre a plataforma e a burocracia pós-óbito, com tom
  acolhedor — útil num momento de luto."*
- **Destaque:** integração com **Google Gemini**, com histórico da conversa e limite de uso para
  controlar custo.

---

## PARTE 4 — PERFIL FUNERÁRIA (prestador)

> Logar como **funerária**. Observe que o menu agora mostra *Painel da Funerária*.

### Tela 11 — Painel da Funerária `/painel-funeraria`
- **Objetivo:** mostrar a gestão do próprio negócio.
- **O que fazer:** percorrer as abas:
  - **Serviços** — listar, **Novo Serviço**, **Editar/Excluir**, alternar **Ativo/Inativo**.
  - **Avaliações** — ver as notas recebidas dos usuários.
  - **Perfil** — editar dados (nome, telefone, endereço…).
  - **Relatórios** — visão consolidada.
- **Fala:** *"A funerária administra o próprio catálogo de serviços e preços, acompanha suas
  avaliações e mantém os dados atualizados."*
- **Destaque:** ao salvar o endereço no **Perfil**, o backend **re-geocodifica** e atualiza o
  ponto no mapa. A funerália só acessa os **próprios** dados — o backend amarra isso pelo
  usuário do token.

---

## PARTE 5 — PERFIL ADMINISTRADOR

> Logar como **admin**. Menu mostra *Painel Admin*.

### Tela 12 — Painel Admin — Visão Geral `/painel-admin`
- **Objetivo:** mostrar o panorama do sistema.
- **O que fazer:** apontar os contadores (**Funerárias, Usuários, Avaliações, Serviços, Nota
  Média, Admins**) e a lista **Avaliações Recentes** (com botão **Remover**).
- **Fala:** *"O admin tem a visão geral do sistema e pode moderar conteúdo — por exemplo, remover
  uma avaliação imprópria."*

### Tela 13 — Painel Admin — Abas de CRUD
- **Objetivo:** mostrar o controle total.
- **O que fazer:** passar pelas abas **Funerárias**, **Usuários**, **Avaliações**, **Serviços**,
  **Admins** — demonstrando criar/editar/excluir em uma delas.
- **Fala:** *"Aqui está o CRUD completo: o admin gerencia funerárias, usuários, serviços,
  avaliações e outros administradores."*
- **Destaque:** todos esses endpoints exigem **papel `admin`** no backend; sem o token correto,
  a API recusa — mesmo que alguém tente burlar a tela.

---

## Encerramento — pontos técnicos (1 min)

Frase de fecho + destaques de engenharia (caso a banca/cliente seja técnico):

- **Arquitetura:** Angular (Vercel) + ASP.NET Core (SmarterASP.NET) + SQL Server.
- **Proxy inteligente:** o front chama `/api` e a Vercel reescreve para o backend, evitando
  *mixed content* (HTTPS × HTTP).
- **Segurança:** JWT por papel, senhas com BCrypt, CORS restrito, **rate limiting**
  (anti brute-force no login, controle de custo no chat) e *security headers*.
- **Integrações:** geocoding (OpenStreetMap) para o mapa e Google Gemini para o assistente.
- **Frase final:** *"Tudo pensado para que a família encontre o serviço certo com transparência e
  tranquilidade — e para que funerárias e administradores tenham controle sobre o que publicam."*

---

## Resumo do fluxo (cola rápida)

| # | Tela | Rota | Perfil |
|---|---|---|---|
| 1 | Home | `/` | Visitante |
| 2 | Detalhes + mapa | `/detalhes/:id` | Visitante |
| 3 | Busca | `/busca` | Visitante |
| 4 | Como funciona / Ajuda | `/como-funciona` · `/ajuda` | Visitante |
| 5 | Cadastros | `/cadastro` · `/cadastro-funeraria` | — |
| 6 | Login / Esqueci senha | `/login` · `/esqueci-senha` | — |
| 7 | Meu Painel | `/meu-painel` | Usuário |
| 8 | Favoritar | `/detalhes/:id` | Usuário |
| 9 | Avaliar | `/avaliar/:id` | Usuário |
| 10 | Chat IA | `/chat` | Usuário |
| 11 | Painel da Funerária | `/painel-funeraria` | Funerária |
| 12 | Painel Admin — Visão Geral | `/painel-admin` | Admin |
| 13 | Painel Admin — CRUD | `/painel-admin` | Admin |

> Mapa técnico completo de cada tela/arquivo: ver [ARQUITETURA.md](ARQUITETURA.md).
