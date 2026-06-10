# 🎮 PXBR Breed

![Version](https://img.shields.io/badge/version-1.1-blue)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-GPL--3.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![Storage](https://img.shields.io/badge/storage-LocalStorage-green)

Sistema web para gerenciamento de encomendas, breeds, capturas e controle financeiro de Pokémon em servidores Pixelmon.

## 📦 Versão Atual

Versão: **1.1.0**

Última atualização: **Junho/2026**

---

## 📖 Sobre o Projeto

O **PXBR Breed** foi desenvolvido para auxiliar breeders, vendedores e criadores de Pokémon em servidores Pixelmon a gerenciar clientes, encomendas, pagamentos e o progresso de cada Pokémon solicitado.

O projeto surgiu da necessidade de substituir controles manuais realizados por mensagens, planilhas ou anotações, centralizando todas as informações em uma única aplicação simples, rápida e organizada.

Atualmente o sistema já permite acompanhar todo o fluxo operacional de uma encomenda, desde a solicitação do cliente até a entrega final dos Pokémon.

---

## 🚀 Como Executar

### Clonar o projeto

```bash
git clone https://github.com/alvarojunior02/pxbr-breed.git
```

### Entrar na pasta

```bash
cd pxbr-breed
```

### Instalar dependências

```bash
npm install
```

### Executar servidor local

```bash
npm run dev
```

Ou simplesmente abrir o arquivo `index.html` utilizando uma extensão como Live Server no VSCode.

---

## ✅ Funcionalidades Implementadas

### Sistema Base

- [x] Dashboard operacional
- [x] Gerenciamento de clientes
- [x] Gerenciamento de encomendas
- [x] Controle financeiro
- [x] Persistência via LocalStorage

### Pokédex

- [x] Pokédex até a Geração 9
- [x] Busca por nome e ID
- [x] Filtro por região
- [x] Filtro por Egg Group
- [x] Filtro por Hidden Ability cadastrada
- [x] Visualização de linha evolutiva

### Hidden Abilities

- [x] Cadastro manual
- [x] Edição
- [x] Exclusão
- [x] Integração com encomendas
- [x] Preenchimento automático de valores
- [x] Gerenciamento centralizado

### Configurações

- [x] Configurações persistentes
- [x] Comparação Antes → Depois
- [x] Confirmação de alterações

### Backup

- [x] Exportação JSON
- [x] Importação JSON
- [x] Backup local completo
- [x] Validação básica de integridade

### Interface

- [x] Responsividade mobile
- [x] Menu recolhível
- [x] Toasts globais
- [x] Modais reutilizáveis
- [x] UX otimizada para fluxo de encomendas

---

## ✨ Principais Funcionalidades

### 📊 Dashboard

- Resumo geral do sistema
- Quantidade de encomendas ativas
- Quantidade de clientes cadastrados
- Receita total recebida
- Valores pendentes
- Status das breeds
- Top compradores
- Últimas encomendas
- Últimas transações

### 📦 Encomendas

- Cadastro de encomendas
- Múltiplos Pokémon por pedido
- Controle individual de status
- Controle de pagamento
- Sistema de arquivamento
- Observações por encomenda
- Filtros de pesquisa

### 👥 Clientes

- Cadastro de clientes
- Avatar Minecraft automático
- Histórico de encomendas
- Histórico financeiro
- Resumo de compras
- Consulta rápida de transações

### 💰 Financeiro

- Registro automático de pagamentos
- Controle de transações
- Receita total
- Receita mensal
- Receita diária
- Histórico financeiro completo

### 📚 Pokédex Integrada

- Pokédex local até a Geração 9
- Busca por nome ou ID
- Informações completas dos Pokémon
- Hidden Abilities (HA)
- Egg Groups
- Evoluções
- Sprites e miniaturas

---

## 🔄 Fluxo de Trabalho

```text
Cliente
   ↓
Nova Encomenda
   ↓
Adicionar Pokémon
   ↓
Definir Nature e Ability
   ↓
Registrar Pagamento Inicial (Opcional)
   ↓
Acompanhar Status da Breed
   ↓
Registrar Pagamentos Adicionais
   ↓
Entregar Pokémon
   ↓
Arquivar Encomenda
```

---

## 📊 Status dos Pokémon

Cada Pokémon possui um controle independente de progresso:

| Status                    | Descrição                                           |
| ------------------------- | --------------------------------------------------- |
| 🟣 Precisa Capturar Fêmea | Necessário obter uma fêmea antes de iniciar a breed |
| 🟡 A Começar              | Breed ainda não iniciada                            |
| 🔵 Em Andamento           | Processo de breed em execução                       |
| 🟢 Pronto                 | Pokémon finalizado                                  |
| ✅ Entregue               | Pokémon entregue ao cliente                         |

---

## 🛠️ Tecnologias Utilizadas

### Front-end

- HTML5
- CSS3
- JavaScript (Vanilla)

### Persistência

- LocalStorage

### Ferramentas

- Node.js
- PokéAPI (apenas para manutenção da Pokédex)

### Serviços Externos

- mc-heads.net (Avatar Minecraft)

---

## 🏗️ Arquitetura

O sistema segue uma arquitetura modular baseada em JavaScript Vanilla.

### Core

Responsável por:

- Persistência
- Configurações
- Utilitários globais

### Services

Responsável por:

- Manipulação de LocalStorage
- Operações de negócio

### Modules

Responsável por:

- Dashboard
- Clientes
- Encomendas
- Financeiro
- Pokédex
- Configurações

### UI

Responsável por:

- Modais
- Toasts
- Navegação
- Responsividade

## 💾 Dados Persistidos

O sistema utiliza LocalStorage para armazenar:

- Clientes
- Encomendas
- Transações
- Hidden Abilities
- Configurações
- Backups exportados/importados

Nenhum dado é enviado para servidores externos.

---

## 📁 Estrutura do Projeto

```text
PXBR-Breed/
│
├── data/
│   ├── pokedex.json
│   └── pokedex.updated.json
│
├── scripts/
│   └── update-pokedex.js
│
├── css/
│   ├── global.css
│   ├── layout.css
│   ├── forms.css
│   ├── buttons.css
│   ├── modals.css
│   ├── tables.css
│   ├── dashboard.css
│   ├── orders.css
│   ├── players.css
│   ├── finance.css
│   └── responsive.css
│
├── js/
│   ├── core/
│   ├── services/
│   ├── modules/
│   ├── orders/
│   ├── navigation.js
│   ├── orders.js
│   └── main.js
│
├── index.html
├── LICENSE
└── README.md
```

---

## 🚀 Status do Projeto

O PXBR Breed encontra-se em desenvolvimento ativo e já possui todas as funcionalidades essenciais para gerenciamento de clientes, encomendas, pagamentos e acompanhamento de breeds em servidores Pixelmon.

O sistema já está apto para uso real e continua recebendo melhorias voltadas para produtividade, relatórios financeiros e gerenciamento de dados.

---

## 🗺️ Roadmap

### 🔜 Próxima Versão

#### 💰 Financeiro

- [x] Filtro por período

    - [x] Hoje
    - [x] Últimos 7 dias
    - [x] Últimos 30 dias
    - [x] Mês Atual
    - [x] Tudo

- [ ] Exportação CSV de transações

- [ ] Importação CSV de transações

- [ ] Validação de duplicidade de transações

---

#### ⚙️ Configurações

- [x] Sistema de configurações persistentes

- [x] Confirmação de alterações

- [x] Comparação Antes → Depois

- [x] Sistema de backup local (JSON)

- [x] Restauração de backup local (JSON)

- [x] Configuração de preenchimento automático de valores de HA

- [x] Configuração de exibição de avisos de HA não cadastrada

- [ ] Configurações de interface

- [ ] Configurações de comportamento de modais

---

#### 🧬 Hidden Abilities

- [x] Cadastro manual de HAs

- [x] Gerenciamento de HAs cadastradas

- [x] Edição de HAs

- [x] Exclusão de HAs

- [x] Integração com Nova Encomenda

- [x] Linha evolutiva completa

- [x] Filtro "Possui HA cadastrada"

- [ ] Histórico de obtenção

- [ ] Categorias de HAs

- [ ] Estatísticas de utilização

---

### 📈 Relatórios

- [ ] Ticket médio
- [ ] Maior comprador
- [ ] Receita por período
- [ ] Relatórios mensais
- [ ] Evolução financeira
- [ ] Ranking de clientes
- [ ] Ranking de Pokémon mais vendidos
- [ ] Ranking de HAs mais utilizadas

---

### ⚙️ Gestão

- [ ] Edição de clientes
- [ ] Edição de encomendas
- [ ] Exclusão controlada
- [ ] Histórico de alterações
- [ ] Log de ações
- [ ] Controle de estoque de HAs
- [ ] Controle de estoque de Breedables

---

### 🎨 Interface

- [x] Sistema global de Toasts

- [x] Sidebar responsiva

- [x] Menu mobile recolhível

- [x] Ícones de navegação

- [x] Dashboard reorganizada

- [ ] Busca global

- [ ] Gráficos financeiros

- [ ] Tema claro/escuro

- [ ] Atalhos de teclado

- [ ] Modo compacto

- [ ] Sistema de notificações

---

### 📦 Exportação e Dados

- [x] Exportação JSON

- [x] Importação JSON

- [x] Sistema de backup local

- [ ] Exportação CSV

- [ ] Importação CSV

- [ ] Backup automático

- [ ] Histórico de backups

- [ ] Validação avançada de integridade

---

### 🌐 Futuro

- [ ] Backend próprio
- [ ] API REST
- [ ] Banco de dados
- [ ] Multiusuário
- [ ] Controle de permissões
- [ ] Deploy online
- [ ] Sistema de autenticação
- [ ] Login via Discord
- [ ] Sincronização entre dispositivos

---

## 🎯 Objetivos do Projeto

- Centralizar informações de clientes e encomendas
- Facilitar o acompanhamento de breeds
- Melhorar o controle financeiro
- Evitar perda de informações
- Aumentar a produtividade durante o gerenciamento de pedidos
- Servir como ferramenta prática para servidores Pixelmon

---

## 📜 Licença

Este projeto está licenciado sob os termos da **GNU General Public License v3.0 (GPL-3.0)**.

Você pode:

- Utilizar o projeto livremente;
- Estudar o código-fonte;
- Modificar o código;
- Distribuir versões modificadas;

Desde que qualquer trabalho derivado também seja distribuído sob a mesma licença GPL.

Consulte o arquivo **LICENSE** para mais informações.

---

## 👨‍💻 Autor

Desenvolvido por **Alvaro Carneiro Junior**.

---

## 📬 Entre em Contato

Caso tenha sugestões, dúvidas ou queira acompanhar o desenvolvimento do projeto:

[![linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/alvaro-carneiro-junior-9a376038a/)

[![mail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:alvarojunior02.dev@gmail.com)

---

⭐ Se este projeto foi útil para você, considere deixar uma estrela no repositório.
