
import { GoogleGenAI } from "@google/genai";
import { SubTask, AgentType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonResponse = <T,>(jsonString: string): T | null => {
  let cleanJsonString = jsonString.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanJsonString.match(fenceRegex);
  if (match && match[2]) {
    cleanJsonString = match[2].trim();
  }

  try {
    return JSON.parse(cleanJsonString) as T;
  } catch (error) {
    console.error("Error al analizar la respuesta JSON:", error, "String original:", jsonString);
    return null;
  }
};

export const runOrchestrator = async (mainTask: string): Promise<SubTask[]> => {
  const prompt = `
    Eres un IA gestor de proyectos experto. Tu trabajo es tomar una solicitud de usuario compleja y descomponerla en una serie de subtareas discretas y secuenciales que pueden ser ejecutadas por agentes de IA especializados.
    Los agentes disponibles son: 'Investigador' (investiga en la web), 'Analista' (analiza datos y resume), y 'Escritor' (redacta secciones de un informe).
    Para la tarea dada, crea un array JSON de subtareas. Cada objeto en el array debe tener dos claves: "agent" (uno de los tipos de agente disponibles) y "task" (una instrucción clara y concisa para ese agente).
    La respuesta debe ser únicamente el array JSON, sin texto adicional, explicaciones ni formato markdown. Asegúrate que el JSON es válido.

    Tarea del usuario: "${mainTask}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const subTasks = parseJsonResponse<SubTask[]>(response.text);
    if (!subTasks || !Array.isArray(subTasks)) {
        throw new Error("La respuesta del Orquestador no es un array de subtareas válido.");
    }
    // Mapeo para asegurar que los nombres de los agentes coincidan con los tipos definidos
    const validAgentTypes: AgentType[] = ['Investigador', 'Analista', 'Escritor'];
    return subTasks.filter(st => st.agent && st.task && validAgentTypes.includes(st.agent));

  } catch (error) {
    console.error("Error en el Orquestador:", error);
    throw new Error("El agente Orquestador no pudo planificar la tarea.");
  }
};


export const runExecutor = async (subTask: SubTask, context: string[]): Promise<string> => {
    const contextString = context.length > 0 ? context.join('\n\n---\n\n') : 'No hay contexto previo.';
    const prompt = `
        Eres un agente IA de clase mundial con el rol de '${subTask.agent}'. Se te proporcionarán los resultados de los pasos anteriores como contexto, seguidos de tu tarea actual.
        Proporciona una respuesta concisa, bien formateada y precisa a tu tarea, en español.
        
        --- CONTEXTO PREVIO ---
        ${contextString}
        
        --- TU TAREA ACTUAL ---
        ${subTask.task}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Error en el agente ${subTask.agent}:`, error);
        throw new Error(`El agente ${subTask.agent} encontró un error al procesar la tarea.`);
    }
};

export const runFinalizer = async (context: string[]): Promise<string> => {
    const contextString = context.join('\n\n---\n\n');
    const prompt = `
        Eres un agente 'Finalizador' IA. Tu trabajo es tomar todos los resultados de los agentes anteriores y compilarlos en un informe final completo, bien estructurado y coherente para el usuario.
        El informe debe estar en formato Markdown, usando títulos (#, ##), listas (*) y negritas (**) para una mejor legibilidad.
        Comienza con un título principal y un breve resumen de la tarea completada.
        
        --- DATOS A COMPILAR ---
        ${contextString}
        
        --- INFORME FINAL (EN FORMATO MARKDOWN) ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error en el agente Finalizador:", error);
        throw new Error("El agente Finalizador no pudo generar el informe final.");
    }
}
