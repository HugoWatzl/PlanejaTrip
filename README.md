<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1WAKIXWHwyGQCwhxtk4P4PWo1Atm-jr0k

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`





# Documento de Visão: PlanejaTrip

**Versão:** 1.0
**Data:** 24 de Julho de 2024

---

## 1. Visão Geral

O **PlanejaTrip** é uma aplicação web moderna e colaborativa, projetada para simplificar e centralizar o planejamento de viagens. A plataforma permite que usuários, sozinhos ou em grupo, organizem todos os aspectos de uma viagem, desde o roteiro diário e atividades até o controle financeiro detalhado. Com uma interface intuitiva e a integração de inteligência artificial para sugestões, o PlanejaTrip visa transformar a complexidade do planejamento em uma experiência agradável e eficiente.

## 2. Propósito e Problema

O planejamento de viagens, especialmente em grupo, é frequentemente fragmentado. Informações são espalhadas por planilhas, aplicativos de mensagens, e-mails e documentos de texto. Isso leva a desorganização, falhas de comunicação e dificuldade no controle de custos.

O PlanejaTrip resolve esse problema ao oferecer uma **fonte única de verdade**, onde todos os detalhes da viagem são consolidados e acessíveis em tempo real para todos os participantes.

## 3. Público-Alvo

*   **Grupos de Amigos e Famílias:** O principal público, que precisa de uma ferramenta para coordenar planos e dividir despesas de forma transparente.
*   **Viajantes Solo Organizados:** Indivíduos que desejam ter um controle detalhado sobre seus roteiros e orçamentos.
*   **Casais:** Para planejar viagens românticas ou luas de mel sem o estresse da desorganização.

## 4. Principais Funcionalidades (Versão Atual)

### 4.1. Gestão de Usuários e Autenticação
- **Login e Cadastro:** Sistema unificado onde o usuário pode se cadastrar (informando nome, e-mail e senha) ou fazer login (com e-mail e senha).
- **Persistência de Sessão:** O usuário logado é mantido através do `localStorage` para uma experiência contínua.
- **Perfil de Usuário:** Tela de perfil onde o usuário pode visualizar e editar suas informações.

### 4.2. Gestão de Viagens
- **Criação de Viagens:** Um formulário intuitivo permite criar novas viagens, definindo nome, destino, datas de início e término, e orçamento total.
- **Listagem de Viagens:** O perfil do usuário exibe as viagens ativas e as já concluídas, permitindo fácil acesso.
- **Dashboard da Viagem:** Uma visão centralizada para cada viagem, servindo como ponto de partida para o planejamento.

### 4.3. Planejamento de Roteiro Diário
- **Visualização por Dias:** O sistema gera automaticamente um painel para cada dia da viagem.
- **Gestão de Atividades:** Dentro de cada dia, o usuário pode:
    - Adicionar, editar e excluir atividades.
    - Definir nome, horário, descrição, custo estimado e categoria.
- **Sugestões com IA:** Integração com a API Gemini para gerar sugestões de atividades personalizadas para o destino da viagem.

### 4.4. Controle Financeiro
- **Orçamento Total:** Definição de um orçamento geral para a viagem.
- **Confirmação de Gastos:** Usuários podem "confirmar" uma atividade, informando o custo real gasto.
- **Dashboard Financeiro:** Uma visão detalhada dos gastos:
    - Resumo: Orçamento vs. Gasto Total vs. Saldo.
    - Gráfico de Pizza: Distribuição de gastos por categoria (Alimentação, Lazer, etc.).
    - Divisão por Viajante: Análise de quanto cada participante gastou individualmente.

### 4.5. Colaboração em Tempo Real (Simulada)
- **Sistema de Convites:** O dono da viagem pode convidar outros usuários por e-mail.
- **Gestão de Permissões:** Ao convidar, é possível definir se o participante pode "Editar" ou "Apenas Visualizar".
- **Notificações:** O usuário convidado recebe uma notificação para aceitar ou recusar o convite.
- **Acesso Compartilhado:** Uma vez aceito, a viagem aparece no perfil do convidado, e as alterações são refletidas para todos (atualmente simulado via `localStorage`).

### 4.6. Assistente de Viagem com IA
- **Chat Inteligente:** Um assistente de viagem flutuante, alimentado pela API Gemini, que pode responder a perguntas sobre o destino, dar dicas e ajudar no planejamento em linguagem natural.
- **Respostas em Streaming:** As respostas do assistente são exibidas em tempo real, melhorando a experiência do usuário.

## 5. Arquitetura e Pilha Tecnológica

- **Frontend:**
    - **Framework:** React 19
    - **Linguagem:** TypeScript
    - **Estilização:** Tailwind CSS para uma UI moderna e responsiva.
    - **Estado Global:** Gerenciamento de estado local através de `useState` e `useEffect`, com passagem de props.
- **Inteligência Artificial:**
    - **API:** Google Gemini (`gemini-2.5-flash`) para geração de texto, sugestões de atividades e funcionalidade de chat.
- **Persistência de Dados (Protótipo):**
    - **Armazenamento:** `localStorage` do navegador é usado para simular um banco de dados, armazenando usuários, viagens e convites.

## 6. Fluxos de Usuário Essenciais

1.  **Novo Usuário:**
    - Acessa a tela de login.
    - Preenche nome, e-mail e senha para se cadastrar.
    - É redirecionado para a tela de perfil.
    - Clica em "Nova Viagem", preenche o formulário e cria sua primeira viagem.
    - É levado ao dashboard da viagem para começar a planejar.

2.  **Planejamento em Grupo:**
    - O dono da viagem abre as configurações e convida um amigo por e-mail.
    - O amigo se cadastra/loga na plataforma com o mesmo e-mail.
    - Na sua tela de perfil, o amigo vê o convite e o aceita.
    - A viagem agora aparece em sua lista, e ele pode acessá-la e colaborar.

## 7. Evolução Futura (Próximos Passos)

Para transformar o PlanejaTrip de um protótipo funcional em um produto de produção, os seguintes passos são recomendados:

- **Backend e Banco de Dados Real:**
    - **Substituir `localStorage`:** Migrar a persistência de dados para uma solução de backend como **Firebase (Firestore)** ou **Supabase**.
    - **Autenticação Real:** Utilizar os serviços de autenticação dessas plataformas para gerenciar usuários de forma segura.
- **Colaboração em Tempo Real:** Implementar WebSockets (ou as funcionalidades de tempo real do Firestore/Supabase) para que as alterações feitas por um usuário apareçam instantaneamente para todos os outros.
- **Funcionalidades Adicionais:**
    - **Upload de Documentos:** Permitir que os usuários anexem passagens, reservas de hotel e outros documentos.
    - **Integração com Mapas:** Visualizar atividades e rotas em um mapa interativo.
    - **Notificações Push:** Enviar lembretes sobre próximas atividades ou atualizações no planejamento.
- **Aplicativo Móvel:** Desenvolver versões para iOS e Android usando React Native para compartilhar a base de código.

