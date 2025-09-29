// FIX: Add triple-slash directive to include Vite's client types, fixing errors with `import.meta.env`.
/// <reference types="vite/client" />

import { GoogleGenAI, Type } from "@google/genai";
import { Activity } from '../types.ts';

// In a Vite environment, client-side environment variables must be prefixed with VITE_
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

const defaultCategories = "Hospedagem, Alimentação, Lazer, Transporte, Compras, Emergência";

export const getActivitySuggestions = async (destination: string): Promise<Omit<Activity, 'id' | 'isConfirmed' | 'realCost' | 'participants'>[]> => {
  if (!apiKey) {
    console.log("Using mock data for suggestions.");
    return Promise.resolve([
      { name: "Explore o Centro Histórico", time: "09:00", description: "Passeie pelas ruas antigas.", estimatedCost: 0, category: "Lazer" },
      { name: "Almoço Típico", time: "12:30", description: "Experimente a culinária local.", estimatedCost: 150, category: "Alimentação" },
      { name: "Visita ao Museu Principal", time: "15:00", description: "Conheça a história e a arte.", estimatedCost: 75, category: "Lazer" },
    ]);
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Você é um assistente de planejamento de viagens. Sugira 3 atividades para um turista em ${destination}. Para cada atividade, forneça um nome, um horário sugerido, uma breve descrição, um custo estimado em BRL e uma categoria dentre estas: ${defaultCategories}.`,
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
              estimatedCost: { type: Type.NUMBER, description: 'O custo estimado em BRL.' },
              category: { type: Type.STRING, description: `A categoria da atividade. Escolha uma de: ${defaultCategories}` },
            },
            required: ["name", "time", "description", "estimatedCost", "category"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const suggestions = JSON.parse(jsonText);
    // FIX: Removed the incorrect mapping that added a `participants` property. 
    // The function's return type correctly omits this property, and the Gemini response does not include it.
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


export const getTravelSuggestionsText = async (destination: string): Promise<string> => {
    if (!apiKey) {
        return Promise.resolve(`
* Explorar o mercado local.
* Fazer um piquenique no parque central.
* Jantar em um restaurante familiar tradicional.
* Visitar o principal ponto turístico da cidade.
* Passear pelo bairro histórico ao entardecer.
*Essas são sugestões de fallback, pois a chave da API não foi configurada.*
        `);
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Você é um guia de viagens experiente. Crie uma lista concisa de 5 a 7 sugestões de atividades para um turista em ${destination}. Use apenas uma lista de marcadores simples ('*') sem títulos, descrições longas ou classificações de custo.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching text suggestions from Gemini API:", error);
        return "Ocorreu um erro ao buscar as sugestões. Por favor, tente novamente mais tarde.";
    }
};