# 🌿 IREST – Plataforma de Busca por Serviços Funerários

## 📌 Sobre o Projeto

O **IREST** é uma plataforma web desenvolvida como Projeto Integrador (PIT), com o objetivo de auxiliar usuários em momentos delicados de luto, permitindo:

* 🔎 Busca por funerárias
* ⭐ Avaliação de serviços
* 📍 Visualização por geolocalização
* ❤️ Favoritar estabelecimentos
* 🤖 Chatbot para dúvidas

O sistema foi projetado com foco em usabilidade, organização das informações e experiência do usuário.

---

## 🏗️ Arquitetura do Projeto

O projeto está dividido em dois módulos principais:

```
IREST
│
├── IREST.API        → Backend (.NET 8 + SQL Server)
└── irest-app        → Frontend (Angular)
```

### 🔹 Backend

* .NET 8
* Entity Framework Core
* SQL Server
* Migrations
* API RESTful
* CORS configurado

### 🔹 Frontend

* Angular
* HttpClient
* Componentização
* Consumo de API REST

---

## 🗄️ Banco de Dados

O banco foi modelado com base em um DER contendo as seguintes entidades:

* Usuario
* Admin
* Funeraria
* Servico
* Review
* Favorito
* ChatbotSession
* ChatbotMessage

Relacionamentos incluem:

* Usuário → Reviews
* Funerária → Serviços
* Usuário → Favoritos
* Usuário → Sessões de Chatbot

---

## 🚀 Como Executar o Projeto

### 🔹 1. Backend

```bash
cd IREST.API
dotnet restore
dotnet ef database update
dotnet run
```

A API ficará disponível em:

```
https://localhost:5019
```

---

### 🔹 2. Frontend

```bash
cd irest-app
npm install
ng serve
```

Aplicação disponível em:

```
http://localhost:4200
```

---

## 🔐 Funcionalidades Implementadas

✔ Cadastro e listagem de usuários
✔ Cadastro de funerárias
✔ Avaliações com comentários
✔ Sistema de favoritos
✔ Estrutura de chatbot
✔ Integração Frontend ↔ Backend
✔ Migrations do banco
✔ CORS configurado

---

## 📍 Funcionalidades Futuras

* Integração com API de mapas (Google Maps / OpenStreetMap)
* Cálculo automático de distância
* Sistema de autenticação JWT
* Dashboard administrativo
* Deploy em ambiente cloud

---

## 👨‍💻 Desenvolvedores

* Gabriel Andrade Dutra de Oliveira
* Matheus Rodigues de Paula

Projeto de Inovação Tecnológica II – Ciência da Computação
2026

---

## 📄 Licença

Projeto acadêmico desenvolvido para fins educacionais.
