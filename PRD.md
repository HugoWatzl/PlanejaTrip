# Documento de Requisitos de Produto (PRD): PlanejaTrip

**Versão:** 1.0
**Data:** 24 de Julho de 2024
**Autor:** Equipe de Desenvolvimento

---

## 1. Visão Geral

### 1.1. Introdução
O PlanejaTrip é uma aplicação web moderna e colaborativa projetada para centralizar e simplificar o planejamento de viagens. A plataforma oferece ferramentas integradas para criação de roteiros diários, gestão de atividades, controle financeiro detalhado e colaboração em tempo real entre os participantes.

### 1.2. Problema
O planejamento de viagens, especialmente em grupo, é frequentemente um processo caótico e fragmentado. Informações cruciais como roteiros, orçamentos, reservas e responsabilidades ficam espalhadas por múltiplos canais (grupos de mensagens, e-mails, planilhas), resultando em desorganização, falhas de comunicação e dificuldade no acompanhamento dos gastos.

### 1.3. Solução
O PlanejaTrip atua como uma **fonte única de verdade** para cada viagem. Ele consolida todas as informações em um dashboard intuitivo e interativo, onde os usuários podem:
- Criar e gerenciar viagens com datas, destinos e orçamentos definidos.
- Detalhar o roteiro dia a dia, adicionando atividades com horários e custos estimados.
- Registrar e confirmar gastos reais, associando-os a participantes específicos.
- Obter análises financeiras claras, com gráficos e detalhamento por categoria e por pessoa.
- Convidar amigos e familiares para colaborar, com diferentes níveis de permissão.
- Utilizar um assistente de IA para obter sugestões de atividades e dicas sobre o destino.

### 1.4. Público-Alvo
- **Grupos de amigos e famílias:** Coordenando viagens de lazer.
- **Viajantes solo:** Buscando uma ferramenta robusta para organização pessoal.
- **Casais:** Planejando escapadas românticas ou luas de mel.

### 1.5. Objetivos do Produto
- **Centralizar:** Reunir todas as informações da viagem em um único local.
- **Simplificar:** Oferecer uma interface intuitiva que torne o planejamento uma tarefa fácil e agradável.
- **Automatizar:** Reduzir o trabalho manual através da geração automática de roteiros diários e relatórios financeiros.
- **Inspirar:** Fornecer sugestões inteligentes e personalizadas através da integração com IA.
- **Conectar:** Facilitar a colaboração transparente e eficiente entre os viajantes.

---

## 2. Requisitos Funcionais

| ID | Área | Requisito | Detalhes |
|---|---|---|---|
| **RF-01** | **Usuários** | **Cadastro de Usuário** | Um novo usuário deve poder se cadastrar fornecendo nome, e-mail e senha. |
| **RF-02** | **Usuários** | **Autenticação** | Um usuário cadastrado deve poder fazer login com e-mail e senha. A sessão deve ser mantida. |
| **RF-03** | **Usuários** | **Gerenciamento de Perfil** | O usuário deve poder visualizar e editar seu nome e senha em uma tela de perfil. |
| **RF-04** | **Viagens** | **Criação de Viagem** | O usuário deve poder criar uma nova viagem, especificando nome, destino, datas de início/fim e orçamento. |
| **RF-05** | **Viagens** | **Listagem de Viagens** | Na tela de perfil, o usuário deve ver suas viagens separadas por "Ativas" e "Realizadas". |
| **RF-06** | **Viagens** | **Conclusão de Viagem** | O proprietário da viagem deve poder marcá-la como "concluída", tornando-a somente leitura. |
| **RF-07** | **Roteiro** | **Planejamento Diário** | O sistema deve criar automaticamente uma estrutura para cada dia da viagem. |
| **RF-08** | **Roteiro** | **Gerenciamento de Atividades** | O usuário com permissão de edição deve poder adicionar, editar e remover atividades em cada dia, definindo nome, horário, descrição, custo estimado e categoria. |
| **RF-09** | **Roteiro** | **Sugestões com IA** | O sistema deve permitir que o usuário solicite sugestões de atividades geradas pela IA para o destino da viagem. |
| **RF-10** | **Finanças** | **Confirmação de Gastos** | O usuário deve poder confirmar uma atividade, informando o custo real e selecionando os participantes envolvidos no gasto. |
| **RF-11** | **Finanças** | **Dashboard Financeiro** | A aplicação deve exibir um resumo com: orçamento total, gasto total, saldo, e média diária sugerida. |
| **RF-12** | **Finanças** | **Análise por Categoria** | Um gráfico de pizza deve exibir a distribuição dos gastos confirmados por categoria. |
| **RF-13** | **Finanças** | **Análise por Viajante** | O sistema deve calcular e exibir o total gasto por cada participante (divisão individual) e o custo médio por pessoa (divisão igualitária). |
| **RF-14** | **Colaboração** | **Sistema de Convites** | O proprietário da viagem deve poder convidar outros usuários por e-mail, definindo permissões ('EDIT' ou 'VIEW_ONLY'). |
| **RF-15** | **Colaboração** | **Gestão de Convites** | O usuário convidado deve poder aceitar ou recusar convites. O anfitrião deve ser notificado sobre recusas. |
| **RF-16** | **Colaboração** | **Remoção de Participantes** | O proprietário da viagem deve poder remover outros participantes. |
| **RF-17** | **IA** | **Assistente de Viagem** | Um chat flutuante deve permitir que o usuário converse com um assistente de IA para obter dicas e informações sobre a viagem. |
| **RF-18** | **IA** | **Respostas em Streaming** | As respostas do assistente de IA devem ser exibidas em tempo real (streaming) para uma experiência mais fluida. |

---

## 3. Requisitos Não Funcionais

| ID | Categoria | Requisito |
|---|---|---|
| **RNF-01** | **Desempenho** | A interface deve ser fluida, com tempos de carregamento rápidos. Interações com a IA não devem bloquear a UI principal. |
| **RNF-02** | **Usabilidade** | A navegação deve ser clara e intuitiva. O design deve ser limpo, moderno e consistente em toda a aplicação. |
| **RNF-03** | **Responsividade** | A aplicação deve ser totalmente funcional e visualmente agradável em dispositivos desktop e móveis (smartphones e tablets). |
| **RNF-04** | **Compatibilidade** | A aplicação deve ser compatível com as versões mais recentes dos principais navegadores (Chrome, Firefox, Safari, Edge). |
| **RNF-05** | **Segurança** | Em um ambiente de produção, as senhas dos usuários devem ser armazenadas de forma segura (hash) e toda a comunicação deve ser feita via HTTPS. (Atualmente simulado com `localStorage`). |
| **RNF-06** | **Manutenibilidade** | O código-fonte deve ser bem estruturado, componentizado e utilizar TypeScript para garantir a tipagem e facilitar a manutenção. |

---

## 4. Estrutura de Dados

A seguir estão as principais entidades de dados da aplicação.

- **`User`**: Representa um usuário do sistema.
  - `id`: `string` (Identificador único)
  - `name`: `string`
  - `email`: `string` (Usado para login e convites)
  - `password`: `string` (Em produção, seria um hash)

- **`Trip`**: Representa uma viagem.
  - `id`: `string`
  - `name`: `string`
  - `destination`: `string`
  - `startDate`, `endDate`: `string` (Formato 'YYYY-MM-DD')
  - `budget`: `number`
  - `currency`: `'BRL' | 'USD' | 'EUR'`
  - `days`: `Day[]` (Array de objetos `Day`)
  - `participants`: `Participant[]`
  - `categories`: `Category[]`
  - `isCompleted`: `boolean`
  - `ownerEmail`: `string`

- **`Participant`**: Representa um usuário participante de uma viagem.
  - `name`: `string`
  - `email`: `string`
  - `permission`: `'EDIT' | 'VIEW_ONLY'`

- **`Day`**: Representa um dia específico no roteiro da viagem.
  - `date`: `string` (Formato ISO)
  - `dayNumber`: `number`
  - `activities`: `Activity[]`

- **`Activity`**: Representa uma atividade planejada.
  - `id`: `string`
  - `name`: `string`
  - `time`: `string` (Formato 'HH:MM')
  - `description`: `string` (Opcional)
  - `estimatedCost`: `number`
  - `realCost`: `number` (Opcional)
  - `isConfirmed`: `boolean`
  - `participants`: `string[]` (Array de nomes dos participantes)
  - `category`: `string`

- **`Category`**: Representa uma categoria de despesa.
  - `id`: `string`
  - `name`: `string`

- **`Invite`**: Representa um convite para uma viagem.
  - `id`: `string`
  - `tripId`: `string`
  - `hostEmail`: `string`
  - `guestEmail`: `string`
  - `permission`: `'EDIT' | 'VIEW_ONLY'`
  - `status`: `'PENDING' | 'REJECTED'`

---

## 5. Interface do Usuário (UI)

### 5.1. Fluxo de Telas Principais

1.  **Tela de Login/Cadastro:**
    - Formulário centralizado para entrada de nome (cadastro), e-mail e senha.
    - Um único botão para "Entrar / Cadastrar".

2.  **Tela de Perfil (Dashboard do Usuário):**
    - Header com logo e botão de "Sair".
    - Seção com informações do usuário e botão para "Editar Perfil".
    - Sistema de abas para alternar entre "Minhas Viagens" e "Convites e Notificações".
    - **Aba de Viagens:**
        - Seção "Viagens Ativas" com um botão para "Nova Viagem".
        - Cards para cada viagem ativa, com botões para "Planejar" e "Ver Resumo".
        - Seção "Viagens Realizadas" com cards para viagens concluídas.
    - **Aba de Convites:**
        - Lista de convites pendentes com opções para "Aceitar" ou "Recusar".
        - Lista de notificações (ex: convites recusados).

3.  **Tela de Dashboard da Viagem:**
    - **Header:** Informações da viagem (destino, datas), acesso à sidebar de configurações e abas de navegação.
    - **Abas de Navegação:**
        - **Planejamento:** Exibe uma grade com todos os dias da viagem. Ao clicar em um dia, a visão detalha as atividades daquele dia, permitindo adicionar/editar atividades e solicitar sugestões da IA.
        - **Financeiro:** Apresenta o resumo financeiro, o gráfico de gastos por categoria, a divisão por viajante e uma lista detalhada de todas as despesas confirmadas.
        - **Sugestões IA:** Exibe um conteúdo rico gerado pela IA com dicas e recomendações para o destino.
        - **Links:** Uma lista curada de links úteis para planejamento de viagens.
    - **Sidebar de Configurações:** Permite gerenciar participantes, categorias de gastos e a moeda da viagem.
    - **Botão Flutuante de Chat:** Abre a janela do Assistente de Viagem.

### 5.2. Componentes Modais
- **Criação/Edição de Atividade:** Formulário para preencher os detalhes de uma atividade.
- **Confirmação de Gasto:** Modal para informar o valor real gasto e selecionar os participantes.
- **Resumo da Viagem:** Exibe um resumo completo do roteiro e dos dados financeiros, ideal para visualização de viagens concluídas.
- **Confirmação de Criação de Viagem:** Revisa os detalhes da viagem antes da criação final.
- **Conclusão de Viagem:** Pede confirmação antes de marcar uma viagem como concluída.

### 5.3. Assistente de Viagem (Chat)
- Uma janela flutuante, que pode ser movida, redimensionada e maximizada.
- Contém o histórico da conversa e um campo de entrada para enviar novas perguntas.
- Exibe um indicador de "digitando" enquanto a IA processa a resposta.
