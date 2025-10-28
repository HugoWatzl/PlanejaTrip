
import { GoogleGenAI, Type } from "@google/genai";
import { Activity, TripPreferences, Trip } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const defaultCategories = "Hospedagem, Alimentação, Lazer, Transporte, Compras, Emergência";

export const getActivitySuggestions = async (destination: string, preferences: TripPreferences, existingActivities: Activity[]): Promise<Omit<Activity, 'id' | 'isConfirmed' | 'realCost' | 'participants'>[]> => {
  if (!process.env.API_KEY) {
    console.log("Using mock data for suggestions.");
    return Promise.resolve([
      { name: "Visitar um Novo Parque", time: "10:00", description: "Caminhada relaxante.", estimatedCost: 15, category: "Lazer" },
      { name: "Almoço em Bistrô Local", time: "13:00", description: "Experimente pratos diferentes.", estimatedCost: 120, category: "Alimentação" },
      { name: "Explorar a Feira de Artesanato", time: "16:00", description: "Veja a cultura local.", estimatedCost: 50, category: "Compras" },
    ]);
  }
  
  const existingActivityNames = existingActivities.map(a => a.name);

  const prompt = `
    Você é o assistente de viagens "PlanejaTrip". Sua missão é criar roteiros únicos que se alinhem perfeitamente com as preferências do usuário.
    
    **Contexto da Viagem:**
    - Destino: ${destination}
    - Estilo do Orçamento: ${preferences.budgetStyle}
    - O que o usuário GOSTA: ${preferences.likes.join(', ') || 'Nenhum especificado'}
    - O que o usuário NÃO GOSTA: ${preferences.dislikes.join(', ') || 'Nenhum especificado'}
    
    **ATIVIDADES JÁ PLANEJADAS/SUGERIDAS (EVITE REPETIÇÕES):**
    ${existingActivityNames.length > 0 ? `- ${existingActivityNames.join('\n- ')}` : 'Nenhuma'}

    **Sua Tarefa:**
    Sugira 3 atividades turísticas **NOVAS e DIFERENTES** para um turista em ${destination}, que não estejam na lista acima.
    As sugestões devem ser pontos turísticos ou experiências relevantes para o destino.

    **REGRAS CRÍTICAS:**
    1.  **NÃO** sugira NADA que esteja relacionado aos itens que o usuário "NÃO GOSTA".
    2.  **PRIORIZE** fortemente sugestões alinhadas com os itens que o usuário "GOSTA".
    3.  As sugestões de custo devem ser **COERENTES** com o "Estilo do Orçamento":
        - **Econômico**: Priorize atividades gratuitas, mas pode incluir algumas opções de baixo custo. O custo estimado deve ser baixo (ex: 0 a 50 na moeda local).
        - **Confortável**: Um equilíbrio entre custo e benefício, com custos moderados (ex: 50 a 200).
        - **Luxo**: Experiências de alto padrão com custos elevados (ex: 200 a 1000).
        - **Exclusivo**: Experiências únicas e muito caras, para orçamentos muito altos (ex: acima de 1000).
    4.  Para cada atividade, forneça um nome, um horário sugerido, uma breve descrição, um custo estimado na moeda local e uma categoria dentre estas: ${defaultCategories}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'O nome da atividade.' },
              time: { type: Type.STRING, description: 'Um horário sugerido (ex: 10:00).' },
              description: { type: Type.STRING, description: 'Uma breve descrição.' },
              estimatedCost: { type: Type.NUMBER, description: 'O custo estimado na moeda local (sem símbolo).' },
              category: { type: Type.STRING, description: `A categoria da atividade. Escolha uma de: ${defaultCategories}` },
            },
            // FIX: `propertyOrdering` is deprecated and should be replaced with `required`.
            required: ["name", "time", "description", "estimatedCost", "category"],
          },
        },
      },
    });

    // FIX: Access the generated text directly via the `text` property on the response object.
    const jsonText = response.text.trim();
    const suggestions = JSON.parse(jsonText);
    return suggestions as Omit<Activity, 'id' | 'isConfirmed' | 'realCost' | 'participants'>[];
  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    return [
        { name: "Explore a Praia Local", time: "10:00", description: "Caminhe pela orla.", estimatedCost: 20, category: "Lazer" },
        { name: "Jantar com Vista", time: "19:00", description: "Desfrute de frutos do mar frescos.", estimatedCost: 250, category: "Alimentação" },
        { name: "Passeio de Barco", time: "14:00", description: "Veja a costa de uma nova perspectiva.", estimatedCost: 180, category: "Lazer" },
    ];
  }
};


export const getTravelSuggestionsText = async (trip: Trip): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.resolve(`
## Análise do Orçamento
A verificação de orçamento não está disponível sem a chave da API.

## Roteiro Sugerido
* Explorar o mercado local.
* Fazer um piquenique no parque central.
* Jantar em um restaurante familiar tradicional.
* Visitar o principal ponto turístico da cidade.
* Passear pelo bairro histórico ao entardecer.

## Pesquisar Voos
Passagens para ${trip.destination} aqui: [**Google Voos**](https://www.google.com/flights?q=voos+para+${encodeURIComponent(trip.destination)}).

*Essas são sugestões de fallback, pois a chave da API não foi configurada.*
        `);
    }

    const prompt = `
      Você é um guia de viagens experiente e carismático. Sua missão é criar um conjunto de sugestões inspiradoras e visualmente agradáveis para um turista em ${trip.destination}, usando markdown para formatação.

      **Contexto da Viagem:**
      - Estilo do Orçamento: ${trip.preferences.budgetStyle}
      - Orçamento Total (para despesas no destino): ${trip.currency} ${trip.budget.toLocaleString('pt-BR')} para ${trip.days.length} dias.
      - O que o usuário GOSTA: ${trip.preferences.likes.join(', ') || 'Nenhum especificado'}
      - O que o usuário NÃO GOSTA: ${trip.preferences.dislikes.join(', ') || 'Nenhum especificado'}

      **Suas Tarefas:**

      **1. Análise de Orçamento (Seção "Análise do Orçamento"):**
      Primeiro, crie uma seção com o título "## Análise do Orçamento".
      Nesta seção, analise se o orçamento total de **${trip.currency} ${trip.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** é realista. Classifique-o como **'desafiador', 'ideal', 'generoso' ou 'muito generoso'** para o destino e o estilo de viagem '${trip.preferences.budgetStyle}'.
      - Se for **'desafiador'**, escreva uma mensagem de aviso amigável, explicando o porquê.
      - Se for **'ideal'**, **'generoso'** ou **'muito generoso'**, escreva uma mensagem positiva, indicando as boas possibilidades que o orçamento permite.
      - **SEMPRE** formate os números com pontos como separadores de milhares (ex: 1.000, 10.000).

      **2. Sugestões de Atividades (Seção "Roteiro Sugerido"):**
      Crie uma seção com o título "## Roteiro Sugerido".
      Liste de 5 a 7 sugestões de atividades em formato de lista de marcadores ('*').
      - **REGRAS:** As sugestões devem ser criativas, alinhadas com o que o usuário GOSTA e evitar o que ele NÃO GOSTA.
      - Torne a lista atraente, usando negrito (**exemplo**) para destacar nomes de lugares ou atividades.

      **3. Pesquisa de Voos (Seção "Pesquisar Voos"):**
      Crie uma seção com o título "## Pesquisar Voos".
      Adicione um parágrafo amigável com um link direto para pesquisar passagens no Google Voos. O link deve ser formatado em markdown.
      - Texto a ser usado: "Passagens para ${trip.destination} aqui: [**Google Voos**](https://www.google.com/flights?q=voos+para+${encodeURIComponent(trip.destination)})."

      **Formato Final:**
      Combine tudo em uma única resposta de texto usando markdown. A resposta deve ser bem estruturada, visualmente agradável e fácil de ler.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        // FIX: Access the generated text directly via the `text` property on the response object.
        return response.text;
    } catch (error) {
        console.error("Error fetching text suggestions from Gemini API:", error);
        return "Ocorreu um erro ao buscar as sugestões. Por favor, tente novamente mais tarde.";
    }
};