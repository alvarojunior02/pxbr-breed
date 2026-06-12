# 🎮 PXBR Breed

![Version](https://img.shields.io/badge/version-1.2-blue)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-GPL--3.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![Storage](https://img.shields.io/badge/storage-LocalStorage-green)

Sistema web para gerenciamento completo de encomendas, breeds, Hidden Abilities, clientes e controle financeiro em servidores Pixelmon.

---

# 📦 Versão Atual

**Versão:** 1.2.x

**Status:** Em desenvolvimento ativo

**Última atualização:** Junho/2026

---

# 📖 Sobre o Projeto

O **PXBR Breed** foi desenvolvido para auxiliar breeders e vendedores de Pokémon em servidores Pixelmon.

O objetivo do projeto é centralizar todo o fluxo operacional de uma encomenda, desde o primeiro contato com o cliente até a entrega final do Pokémon.

O sistema substitui controles realizados através de:

- Discord
- Planilhas
- Blocos de notas
- Mensagens privadas

Concentrando todas as informações em uma única aplicação.

---

# 🚀 Principais Funcionalidades

## 📊 Dashboard

- Resumo geral do sistema
- Clientes cadastrados
- Encomendas ativas
- Receita total
- Valores pendentes
- Últimas encomendas
- Últimas transações
- Estatísticas operacionais

---

## 👥 Clientes

- Cadastro de clientes
- Edição de clientes
- Avatar Minecraft automático
- Histórico de encomendas
- Histórico financeiro
- Resumo de compras
- Controle de pendências
- Validação de nickname Minecraft

---

## 📦 Encomendas

- Cadastro de encomendas
- Múltiplos Pokémon por pedido
- Controle individual de status
- Registro de pagamentos
- Observações
- Arquivamento
- Detalhamento completo
- Integração com Hidden Abilities

### Status disponíveis

| Status                    | Descrição                       |
| ------------------------- | ------------------------------- |
| 🟣 Precisa Capturar Fêmea | Necessário obter matriz inicial |
| 🟡 A Começar              | Breed ainda não iniciada        |
| 🔵 Em Andamento           | Breed sendo produzida           |
| 🟢 Pronto                 | Pokémon finalizado              |
| ✅ Entregue               | Pokémon entregue                |

---

## 🧬 Hidden Abilities

Sistema completo de gerenciamento de HAs.

### Recursos

- Cadastro manual
- Edição
- Exclusão
- Gerenciamento centralizado
- Integração automática com Pokédex
- Integração com encomendas
- Linha evolutiva completa
- Preenchimento automático de valores
- Controle de Pokémon castrados
- Controle de breedáveis

---

## 📚 Pokédex Integrada

Pokédex local completa até a Geração 9.

### Recursos

- Busca por nome
- Busca por número
- Filtro por geração
- Filtro por Egg Group
- Filtro por Hidden Ability cadastrada
- Informações detalhadas
- Base Stats
- Linha evolutiva
- Navegação sequencial
- Sprites e thumbnails

---

## 💰 Financeiro

- Histórico financeiro completo
- Controle de receitas
- Controle de pagamentos
- Valores pendentes
- Filtros por período
- Receita diária
- Receita mensal
- Receita total

---

## 📈 Relatórios

Sistema completo de relatórios operacionais.

### Disponíveis

- Pokémon mais vendidos
- Hidden Abilities mais vendidas
- Clientes que mais compraram
- Clientes que mais devem

### Recursos

- Filtro por período
- Ranking automático
- Exportação CSV
- Métricas agregadas

---

## ⚙️ Configurações

- Configurações persistentes
- Confirmação de alterações
- Comparação Antes → Depois
- Controle de comportamento do sistema
- Integração com Hidden Abilities

---

## 💾 Backup

Sistema completo de backup local.

### Recursos

- Exportação JSON
- Importação JSON
- Histórico de backups
- Validação básica de integridade

---

# 🏗️ Arquitetura

O projeto segue arquitetura modular baseada em JavaScript Vanilla.

## Core

Responsável por:

- Storage
- Utilitários
- Toasts
- Modais
- Exportações CSV
- Helpers globais

## Services

Responsável pelas regras de negócio.

## Modules

Responsável pelas telas da aplicação.

### Módulos atuais

- Dashboard
- Clientes
- Encomendas
- Pokémon
- Hidden Abilities
- Financeiro
- Relatórios
- Configurações

---

# 🛠️ Tecnologias

## Front-end

- HTML5
- CSS3
- JavaScript (Vanilla)

## Persistência

- LocalStorage

## Ferramentas

- Node.js
- JSON

## Serviços Externos

- PokéAPI (manutenção da Pokédex)
- mc-heads.net (avatar Minecraft)

---

# 📱 Responsividade

O sistema possui suporte para:

- Desktop
- Notebook
- Tablet
- Smartphone

### Recursos

- Sidebar responsiva
- Menu mobile
- Auto-collapse
- Modais adaptativos
- Layout mobile-first

---

# 📊 Estado Atual

## Concluído

- Dashboard
- Clientes
- Encomendas
- Pokémon
- Hidden Abilities
- Financeiro
- Relatórios
- Configurações
- Backup

## Em evolução

- UX operacional
- Histórico de status
- Gestão avançada de breeds

---

# 🗺️ Roadmap

## Próxima Versão

### 📦 Encomendas

- Histórico de mudanças de status
- Modal de encomendas por cliente
- Melhorias visuais dos cards

### 📚 Pokédex

- Paginação
- Otimização de busca
- Correção de sprites específicos

### 📈 Relatórios

- Novas métricas financeiras
- Evolução temporal
- Dashboards avançados

### 🧬 Breed Management

- Controle de Pokémon capturados
- Sugestões automáticas de breed
- Integração com encomendas

---

# 🌐 Futuro

- Backend próprio
- API REST
- Banco de dados relacional
- Multiusuário
- Sistema de permissões
- Sincronização online
- Login
- Deploy web

---

# 🎯 Objetivos do Projeto

- Centralizar informações
- Melhorar produtividade
- Facilitar acompanhamento de breeds
- Melhorar controle financeiro
- Reduzir perda de informações
- Escalar operação de breeders Pixelmon

---

# 📜 Licença

Este projeto está licenciado sob a:

**GNU General Public License v3.0 (GPL-3.0)**

---

# 👨‍💻 Autor

Desenvolvido por **Alvaro Carneiro Junior**

## 📬 Contato

[![linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/alvaro-carneiro-junior-9a376038a/)

[![mail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:alvarojunior02.dev@gmail.com)

---

⭐ Caso o projeto tenha sido útil para você, considere deixar uma estrela no repositório.
