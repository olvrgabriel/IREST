# IREST - Plataforma de Serviços Funerários

## 1. O que é o IREST

O IREST é uma plataforma web que conecta famílias a funerárias avaliadas por outros usuários. O sistema permite buscar, comparar preços, visualizar avaliações e localizar funerárias no mapa, trazendo transparência e calma a um momento delicado.

A plataforma possui três perfis de acesso:
- **Usuário comum** — busca funerárias, avalia, favorita e utiliza o chatbot de ajuda.
- **Funerária** — gerencia seu próprio perfil, serviços e visualiza avaliações recebidas.
- **Administrador** — acessa o CRUD completo de todas as entidades e modera avaliações.

---

## 2. Arquitetura do Projeto

```
IREST/
├── IREST.API/              ← Backend (.NET 8 Web API)
│   ├── Controllers/        ← 10 controllers REST
│   ├── Models/             ← 8 entidades (EF Core)
│   ├── DTOs/               ← Objetos de transferência
│   ├── Extensions/         ← Mapeamento Model → DTO
│   ├── Services/           ← GeocodingService (Nominatim)
│   ├── Data/               ← AppDbContext (SQL Server)
│   └── IREST.API.Tests/    ← 26 testes de integração (xUnit)
│
├── irest-app/              ← Frontend (Angular 21)
│   ├── src/app/
│   │   ├── features/       ← 14 componentes de página
│   │   ├── services/       ← 11 serviços (HTTP + auth)
│   │   ├── core/           ← Header, Guards, Interceptors
│   │   ├── models/         ← Interfaces TypeScript
│   │   └── components/     ← Componentes reutilizáveis
│   └── 8 arquivos .spec.ts ← 51 testes unitários (Vitest)
│
└── DOCUMENTACAO.md          ← Este arquivo
```

### Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Backend | .NET 8, Entity Framework Core, SQL Server |
| Frontend | Angular 21 (standalone components), TypeScript |
| Autenticação | JWT Bearer com 3 roles (admin, funeraria, usuario) |
| Mapa | Leaflet + OpenStreetMap (gratuito, sem API key) |
| Geocoding | Nominatim (OpenStreetMap) — converte endereço em lat/lng |
| Testes backend | xUnit + WebApplicationFactory + InMemory DB |
| Testes frontend | Vitest + Angular TestBed + HttpTestingController |

---

## 3. Backend — Pontos-Chave

### 3.1 Banco de Dados (Entity Framework Core + SQL Server)

O `AppDbContext` define 8 entidades:

| Entidade | Descrição |
|----------|-----------|
| `Usuario` | Usuário comum (nome, email, senha hash) |
| `Admin` | Administrador do sistema |
| `Funeraria` | Funerária com localização, serviços e credenciais |
| `Servico` | Serviço oferecido por uma funerária (nome, preço) |
| `Review` | Avaliação de 1-5 estrelas com comentário |
| `Favorito` | Relação N:N entre usuário e funerária |
| `ChatbotSession` | Sessão de conversa do chatbot |
| `ChatbotMessage` | Mensagem individual dentro de uma sessão |

Relacionamentos principais:
- `Funeraria` 1:N `Review`, 1:N `Servico`, 1:N `Favorito`
- `Usuario` 1:N `Review`, 1:N `Favorito`, 1:N `ChatbotSession`
- `Review` N:1 `Usuario`, N:1 `Funeraria`, N:1 `Admin` (moderação)

### 3.2 Autenticação JWT

O sistema utiliza JWT Bearer tokens com 3 roles:

```
POST /api/auth/register           → Cria usuário, retorna token (role: usuario)
POST /api/auth/register-funeraria → Cria funerária, retorna token (role: funeraria)
POST /api/auth/login              → Login unificado, identifica role automaticamente
```

O token contém claims: `NameIdentifier` (ID), `Name`, `Email`, `Role`.

Cada controller define quais roles têm acesso:
- `[Authorize(Roles = "admin")]` — apenas admin
- `[Authorize(Roles = "usuario")]` — apenas usuário
- `[Authorize(Roles = "admin,funeraria")]` — admin ou funerária
- Sem `[Authorize]` — endpoint público

### 3.3 Controllers REST

| Controller | Rotas | Acesso |
|-----------|-------|--------|
| `AuthController` | register, register-funeraria, login | Público |
| `FunerariasController` | CRUD completo | GET público, POST/PUT/DELETE admin |
| `MinhaFunerariaController` | Perfil + serviços da funerária logada | Funerária |
| `ReviewsController` | CRUD avaliações | GET público, POST usuario, PUT/DELETE admin |
| `ServicosController` | CRUD serviços | GET público, CUD admin/funerária |
| `FavoritosController` | CRUD favoritos | Usuário |
| `AdminsController` | CRUD admins | Admin |
| `UsuariosController` | CRUD usuários | Admin |
| `ChatbotSessionsController` | CRUD sessões de chat | Admin |
| `ChatbotMessagesController` | CRUD mensagens de chat | Admin |

### 3.4 Geocoding Automático (GeocodingService)

Sempre que uma funerária é criada ou atualizada, o sistema converte automaticamente o endereço em coordenadas geográficas:

```csharp
// Services/GeocodingService.cs
public async Task<GeocodingResult?> GeocodeAsync(string? endereco, string cidade, string? estado)
```

**Fluxo:**
1. Monta query: `"Rua X, 123, Belo Horizonte, MG"`
2. Chama API Nominatim: `GET nominatim.openstreetmap.org/search?q=...&countrycodes=br`
3. Recebe lat/lng → grava no banco
4. Frontend carrega e exibe no mapa Leaflet

**Onde atua:**
- `POST /api/auth/register-funeraria` — registro inicial
- `POST /api/funerarias` — admin cria funerária
- `PUT /api/funerarias/:id` — admin edita funerária
- `PUT /api/minhafuneraria` — funerária edita próprio perfil

**Prioridade:** Se lat/lng forem informados manualmente, são usados diretamente. Caso contrário, o sistema geocodifica pelo endereço.

### 3.5 Nullability e DTOs

Todos os DTOs foram configurados com nullability correta para eliminar warnings do compilador C#:
- Propriedades obrigatórias: `string Nome { get; set; } = string.Empty;`
- Propriedades opcionais: `string? Descricao { get; set; }`
- Coleções navegáveis: `List<ReviewDto>? Reviews { get; set; }`
- Métodos ToDto retornam `T?` para indicar possibilidade de null

---

## 4. Frontend — Pontos-Chave

### 4.1 Estrutura de Componentes (Standalone)

O Angular 21 utiliza standalone components (sem NgModule). Cada componente declara seus imports diretamente:

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  ...
})
```

### 4.2 Páginas e Rotas

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/` | HomeComponent | Público |
| `/busca` | SearchResults | Público |
| `/detalhes/:id` | FuneralHomeDetails | Público |
| `/como-funciona` | HowItWorks | Público |
| `/ajuda` | Help | Público |
| `/login` | LoginComponent | Público |
| `/cadastro` | RegisterComponent | Público |
| `/cadastro-funeraria` | RegisterFunerariaComponent | Público |
| `/avaliar/:id` | ReviewForm | Usuário |
| `/chat` | HelpChat | Autenticado |
| `/meu-painel` | DashboardUser | Usuário |
| `/painel-funeraria` | DashboardProvider | Funerária |
| `/painel-admin` | DashboardAdmin | Admin |
| `/admin/crud` | AdminCrudComponent | Admin |

### 4.3 Autenticação no Frontend

**AuthService** gerencia o estado de autenticação:
- Armazena token e dados do usuário no `localStorage`
- Expõe getters: `isLoggedIn`, `isAdmin`, `isFuneraria`, `isUsuario`, `userId`
- Utiliza `BehaviorSubject` para reatividade

**AuthInterceptor** adiciona o header `Authorization: Bearer <token>` a todas as requisições HTTP automaticamente.

**Guards** protegem rotas por role:
- `authGuard` — qualquer usuário logado
- `adminGuard` — somente admin
- `funerariaGuard` — somente funerária
- `usuarioGuard` — somente usuário

### 4.4 Mapa com Leaflet

A página de detalhes da funerária exibe um mapa interativo:

1. **Com coordenadas** — exibe marcador direto no ponto salvo no banco
2. **Sem coordenadas** — faz geocoding no frontend via Nominatim para localizar pelo endereço
3. **Fallback** — centraliza em Belo Horizonte se nada funcionar

```typescript
// Leaflet + OpenStreetMap (gratuito)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker([lat, lng]).addTo(map).bindPopup('Nome da Funerária');
```

### 4.5 ChangeDetectorRef

Componentes standalone do Angular exigem `ChangeDetectorRef.detectChanges()` dentro de callbacks assíncronos (subscribe) para atualizar a view. Todos os componentes que fazem chamadas HTTP utilizam este padrão:

```typescript
this.service.getData().subscribe({
  next: (data) => {
    this.data = data;
    this.cdr.detectChanges(); // Obrigatório para atualizar a view
  }
});
```

### 4.6 Chatbot de Ajuda

O chatbot (`HelpChat`) utiliza respostas baseadas em palavras-chave (sem IA externa):
- Reconhece temas: plataforma, avaliação, urgência, valores, documentação
- Interface de chat com sugestões rápidas clicáveis
- Scroll automático para última mensagem

---

## 5. Testes

### 5.1 Testes Backend (26 testes — xUnit)

Utilizam `WebApplicationFactory<Program>` com banco InMemory para testes de integração reais via HTTP:

**AuthControllerTests (14 testes):**
- Registro com dados válidos retorna token
- Registro sem nome retorna BadRequest
- Registro com email duplicado retorna BadRequest
- Registro de funerária com dados válidos
- Login com credenciais válidas/inválidas
- Login com email inexistente
- Login de funerária retorna role correta

**FunerariasControllerTests (7 testes):**
- GET público sem autenticação retorna OK
- GET retorna lista JSON
- POST sem autenticação retorna Unauthorized
- POST com token de usuário retorna Forbidden
- POST com token de admin retorna Created
- DELETE sem autenticação retorna Unauthorized
- GET por ID inexistente retorna NotFound

**ReviewsControllerTests (5 testes):**
- CRUD de avaliações com diferentes roles

### 5.2 Testes Frontend (51 testes — Vitest)

**AuthService (13 testes):** login, register, logout, roles, localStorage

**FunerariaService (10 testes):** getAll, getById, create, delete, média de avaliação, erros

**ReviewService (7 testes):** CRUD e tratamento de erros

**AuthGuard (10 testes):** bloqueio de acesso, redirect para login, permissão por role

**HeaderComponent (5 testes):** criação, menu toggle, estado de login

**HomeComponent (1 teste):** criação do componente

**SearchResults (3 testes):** criação, lista vazia, filtros iniciais

**AppComponent (2 testes):** criação e renderização

---

## 6. Segurança

- **Senhas** — hash com BCrypt (nunca armazenadas em texto puro)
- **JWT** — tokens assinados com HMAC-SHA256, validação de issuer/audience/lifetime
- **CORS** — restrito a `http://localhost:4200` (frontend Angular)
- **Roles** — cada endpoint define explicitamente quais roles têm acesso
- **Guards** — rotas protegidas no frontend impedem acesso visual a áreas restritas

---

## 7. Como Executar

### Backend
```bash
cd IREST.API/IREST.API
dotnet run
# API disponível em http://localhost:5019
# Swagger em http://localhost:5019/swagger
```

### Frontend
```bash
cd irest-app
npm install
ng serve
# App disponível em http://localhost:4200
```

### Testes
```bash
# Backend
cd IREST.API/IREST.API.Tests
dotnet test

# Frontend
cd irest-app
ng test
```

---

## 8. Fluxos Principais

### Registro e Login
```
Usuário acessa /cadastro → preenche formulário → POST /api/auth/register
→ Recebe token JWT → armazena no localStorage → redirecionado ao home
```

### Busca e Detalhes
```
Home → filtro por cidade → /busca → cards com avaliação média
→ "Ver detalhes" → /detalhes/:id → mapa, serviços, avaliações
```

### Avaliação
```
Usuário logado → /detalhes/:id → "Avaliar Funerária" → /avaliar/:id
→ Seleciona nota (1-5 estrelas) → comentário opcional → POST /api/Reviews
→ Redireciona para detalhes com avaliação exibida
```

### Favoritos
```
Usuário logado → /detalhes/:id → "Adicionar Favorito"
→ POST /api/Favoritos → botão muda para "Remover Favorito"
```

### Cadastro de Funerária com Geocoding
```
Funerária acessa /cadastro-funeraria → preenche endereço, cidade, estado
→ POST /api/auth/register-funeraria → Backend chama Nominatim API
→ Recebe lat/lng → grava no banco → mapa exibe localização correta
```
