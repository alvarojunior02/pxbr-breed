# PXBR Breed

![Status](https://img.shields.io/badge/status-active-success)
![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-blue)
![Frontend](https://img.shields.io/badge/frontend-HTML5%20%2B%20CSS3%20%2B%20Vanilla%20JS-yellow)
![API](https://img.shields.io/badge/api-NestJS-red)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)
![Deploy](https://img.shields.io/badge/deploy-Vercel%20%2B%20Render%20%2B%20Supabase-black)
[![Frontend CI](https://github.com/alvarojunior02/pxbr-breed/actions/workflows/ci.yml/badge.svg)](https://github.com/alvarojunior02/pxbr-breed/actions/workflows/ci.yml)

Sistema web para gerenciamento de encomendas de breeds Pixelmon, clientes, Pokemons próprios, Hidden Abilities, financeiro, relatórios e backup.

O projeto nasceu como uma aplicação em HTML, CSS e JavaScript puro com persistência local, e evoluiu para uma solução full-stack com autenticação JWT, API REST em NestJS e banco PostgreSQL.

## Status

Projeto em desenvolvimento ativo.

Ambientes atuais:

Produção:
Frontend Vercel -> API Render -> PostgreSQL Supabase

Desenvolvimento local:
Frontend Live Server -> API Docker/local -> PostgreSQL Docker

## Links

Frontend produção:
https://pxbr-breed.vercel.app

API produção:
https://pxbr-breed-api.onrender.com/api

Swagger produção:
https://pxbr-breed-api.onrender.com/api/docs

## Funcionalidades

### Autenticação

- Tela de login dedicada
- Autenticação via JWT
- Refresh token via cookie HTTP-only
- Opção "manter-me logado"
- Bloqueio da aplicação para usuários não autenticados

### Dashboard

- Resumo geral da operação
- Encomendas ativas
- Valores recebidos e pendentes
- Últimas encomendas
- Últimas transações
- Indicadores de status
- Integração com dados vindos da API

### Clientes

- Cadastro de clientes
- Edição de clientes
- Avatar automático por nick Minecraft
- Histórico de encomendas por cliente
- = Histórico de transações por cliente
- Resumo financeiro do cliente

### Encomendas

- Criação de encomendas com múltiplos Pokemons
- Seleção de cliente
- Seleção de Pokemon, nature, ability, valor e forma regional
- Suporte a Hidden Ability
- Identificação de Pokemon próprio já cadastrado
- Identificação de breed base/evolução
- Detalhes completos da encomenda
- Avanço de status por Pokemon
- Histórico de status
- Registro de pagamento
- Arquivamento lógico

### Pokemons

- Pokedex integrada
- Busca por nome ou número
- Filtros por HA, região, Egg Group e forma regional
- Paginação
- Detalhes do Pokemon
- Linha evolutiva
- Sprites/thumbnails
- Cadastro em "Meus Pokemons"
- Cadastro em "Meus HAs"

### Meus Pokemons

- Gerenciamento de Pokemons próprios/capturados
- Status de breed: F6, F5 PFT, F5, F4 etc.
- Gênero
- Nature
- Forma regional
- Egg Groups
- Linha evolutiva
- Observações
- Filtros por nome, status, gênero, nature e forma

### Meus HAs

- Cadastro manual de HAs
- Edição de HAs
- Nature opcional
- Valores castrado/breedável
- Linha evolutiva completa
- Forma regional
- Filtros por busca, nature e forma
- Integração com encomendas

### Financeiro

- Transações vinculadas a players e encomendas
- Pagamentos de encomenda
- Histórico financeiro
- Valores pagos e pendentes
- Exportação CSV

### Relatórios

- Pokemons mais vendidos
- HAs mais vendidas
- Players que mais compraram
- Players que mais devem
- Gráficos com Chart.js
- Filtros por período
- Filtro customizado por data inicial/final
- Exportação CSV

### Configurações e Backup

- Configurações do sistema
- Exportação de backup JSON
- Importação de backup JSON
- Prévia de backup antes da importação
- Integração com API/backend

### Tecnologias

- HTML5
- CSS3
- JavaScript Vanilla
- Fetch API
- Chart.js
- Toastify
- Vercel
- API REST NestJS
- PostgreSQL

## Estrutura do Projeto

pxbr-breed/
assets/
src/
css/
auth.css
buttons.css
dashboard.css
finance.css
forms.css
global.css
layout.css
modals.css
orders.css
players.css
pokemon.css
reports.css
responsive.css
settings.css
tables.css
js/
api/
api-client.js
auth-service.js
auth-ui.js
backup-api-service.js
order-status-history-api-service.js
orders-api-service.js
owned-has-api-service.js
owned-pokemon-api-service.js
players-api-service.js
reports-api-service.js
settings-api-service.js
transactions-api-service.js
core/
modules/
dashboard-module.js
finance-module.js
players-module.js
pokemon-module.js
reports-module.js
settings-module.js
orders/
services/
index.html
package.json

## Configuração Local

Instale as dependências:
npm install

Abra o index.html com Live Server.
URL recomendada:
http://127.0.0.1:5500/index.html

Quando aberto em localhost ou 127.0.0.1, o frontend usa automaticamente:
http://127.0.0.1:3001/api

Em produção, usa automaticamente:
https://pxbr-breed-api.onrender.com/api

### Alternar API Manualmente

Usar API de produção no frontend local:
localStorage.setItem("pxbrApiBaseUrl", "https://pxbr-breed-api.onrender.com/api");
location.reload();

Voltar para API local:
localStorage.removeItem("pxbrApiBaseUrl");
location.reload();

## Scripts

Formatar arquivos:
npm run format

Checar formatação:
npm run format:check

Executar lint:
npm run lint

## Backend

O backend fica em um projeto separado:
pxbr-breed-api

Ele fornece autenticação, persistência, relatórios, backup, financeiro e demais dados consumidos pelo frontend.

## Deploy

O frontend está publicado na Vercel.

A API precisa permitir o domínio do frontend via CORS:
https://pxbr-breed.vercel.app

## Licença

GPL-3.0.

## Autor

Desenvolvido por Alvaro Carneiro Junior.
LinkedIn: https://www.linkedin.com/in/alvaro-carneiro-junior-9a376038a/
