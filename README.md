# 🎮 PXBR Breed

![Version](https://img.shields.io/badge/version-1.0-blue)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-GPL--3.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![Storage](https://img.shields.io/badge/storage-LocalStorage-green)

Sistema web para gerenciamento de encomendas, breeds, capturas e controle financeiro de Pokémon em servidores Pixelmon.

---

## 📖 Sobre o Projeto

O **PXBR Breed** foi desenvolvido para auxiliar breeders, vendedores e criadores de Pokémon em servidores Pixelmon a gerenciar clientes, encomendas, pagamentos e o progresso de cada Pokémon solicitado.

O projeto surgiu da necessidade de substituir controles manuais realizados por mensagens, planilhas ou anotações, centralizando todas as informações em uma única aplicação simples, rápida e organizada.

Atualmente o sistema já permite acompanhar todo o fluxo operacional de uma encomenda, desde a solicitação do cliente até a entrega final dos Pokémon.

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
| 🔵 A Começar              | Breed ainda não iniciada                            |
| 🟡 Em Andamento           | Processo de breed em execução                       |
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

- [ ] Filtro por período

    - [ ] Hoje
    - [ ] Últimos 7 dias
    - [ ] Últimos 30 dias
    - [ ] Mês Atual
    - [ ] Tudo

#### 📄 Exportação e Importação

- [ ] Exportação CSV
- [ ] Importação CSV
- [ ] Validação de duplicidade
- [ ] Exportação JSON
- [ ] Importação JSON
- [ ] Sistema de backup local

---

### 📈 Relatórios

- [ ] Ticket médio
- [ ] Maior comprador
- [ ] Receita por período
- [ ] Relatórios mensais
- [ ] Histórico financeiro avançado

---

### ⚙️ Gestão

- [ ] Edição de clientes
- [ ] Edição de encomendas
- [ ] Exclusão controlada
- [ ] Histórico de alterações
- [ ] Controle de estoque

---

### 🎨 Interface

- [ ] Busca global
- [ ] Gráficos financeiros
- [ ] Tema claro/escuro
- [ ] Melhorias de UX/UI

---

### 🌐 Futuro

- [ ] Backend próprio
- [ ] Banco de dados
- [ ] Multiusuário
- [ ] Deploy online
- [ ] Sistema de autenticação

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
