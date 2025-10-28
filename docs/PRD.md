# Documento de Requisitos do Produto (PRD): PlanejaTrip

**Versão:** 1.2
**Data:** 26 de Julho de 2024

---

### 1. Identificação do Projeto

*   **Nome do projeto/solução:** PlanejaTrip
*   **Integrantes do Grupo:** Breno Chaves, Hugo Watzl, Lucca Barcelos, Arthur Azeredo, Vitor Farani, Eduardo Jacob

---

### 2. Visão Geral e Motivação

O **PlanejaTrip** é uma aplicação web moderna e colaborativa projetada para centralizar e simplificar o planejamento de viagens. A motivação para o projeto surge de uma necessidade universal: a dificuldade de organizar viagens, especialmente em grupo, onde informações cruciais sobre roteiros, orçamentos e atividades ficam espalhadas por diversas ferramentas como planilhas, grupos de mensagens e e-mails. Essa fragmentação gera estresse, desorganização e falhas de comunicação.

A solução visa ser a **fonte única de verdade** para qualquer viagem, oferecendo uma plataforma intuitiva onde os usuários podem planejar roteiros detalhados, gerenciar finanças de forma transparente e colaborar em tempo real, com o auxílio de inteligência artificial para enriquecer a experiência.

---

### 3. O Problema

O problema central é a **fragmentação da informação no planejamento de viagens colaborativas**, que afeta:
*   **Grupos de amigos e famílias:** Que lutam para alinhar planos, expectativas e finanças.
*   **Casais:** Que buscam uma experiência de planejamento compartilhada e sem atritos.
*   **Viajantes solo:** Que enfrentam a sobrecarga de organizar todos os detalhes da viagem sozinhos.

As principais dores são:
1.  **Desorganização:** Roteiros, reservas e orçamentos ficam espalhados, dificultando o acesso.
2.  **Controle Financeiro Ineficaz:** É difícil rastrear despesas, dividir custos de forma justa e manter-se dentro do orçamento.
3.  **Comunicação Falha:** Decisões importantes se perdem em conversas descentralizadas.
4.  **Sobrecarga de Pesquisa:** Criar um roteiro do zero para um destino novo é demorado e exaustivo.

---

### 4. A Solução Proposta

O PlanejaTrip ataca esses problemas com uma plataforma web centralizada, intuitiva e inteligente.

#### 4.1. Como Funciona

1.  **Gestão Unificada:** O usuário se cadastra e cria uma viagem, definindo destino, datas e orçamento.
2.  **Planejamento Colaborativo:** O criador da viagem pode convidar outros participantes por e-mail, atribuindo permissões de edição ou visualização.
3.  **Roteiro Inteligente:** A plataforma gera um painel para cada dia da viagem, onde atividades podem ser adicionadas manualmente ou sugeridas pela IA.
4.  **Finanças Transparentes:** Os custos de cada atividade são registrados, e um dashboard financeiro mostra o gasto total, o saldo e a divisão por participante.
5.  **Assistência Contínua:** Um assistente de IA está sempre disponível para tirar dúvidas e dar recomendações personalizadas.

#### 4.2. O Papel Estratégico da IA (Google Gemini)

A IA é o grande diferencial do PlanejaTrip, utilizada para:
1.  **Geração de Roteiros:** Ao clicar em "Sugerir com IA", a aplicação envia um prompt para o modelo `gemini-2.5-flash`, solicitando uma lista de atividades para o destino. A IA retorna uma resposta estruturada em **JSON**, que é usada para popular o roteiro automaticamente, incluindo nome, horário, custo estimado e categoria.
2.  **Assistente de Viagem Conversacional:** Um chat flutuante, alimentado pelo `gemini-2.5-flash`, opera em **modo de streaming**. O assistente é pré-configurado com o contexto da viagem (ex: "Você é um guia para uma viagem a Paris") e pode responder a perguntas complexas em tempo real, melhorando drasticamente a interação e a utilidade da plataforma.

#### 4.3. Ferramentas Utilizadas

*   **Inteligência Artificial:** Google Gemini API (modelo `gemini-2.5-flash`).
*   **Frontend:** React 19, TypeScript, Tailwind CSS.
*   **Persistência de Dados (Protótipo):** `localStorage` do navegador para simular um banco de dados.

---

### 5. Benefícios Esperados

*   **Economia de Tempo:** Redução drástica do tempo de pesquisa e organização.
*   **Redução de Custos e Estresse:** O controle financeiro transparente e a colaboração organizada minimizam conflitos.
*   **Acessibilidade:** Centraliza todas as ferramentas necessárias em um único lugar.
*   **Inovação:** A IA oferece uma experiência de planejamento mais inteligente e personalizada.
*   **Tomada de Decisão Apoiada:** As sugestões da IA ajudam os usuários a descobrir as melhores opções para seus roteiros e orçamentos.
*   **Colaboração Eficaz:** Garante que todos os participantes estejam sempre alinhados e informados.
