import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("La variable de entorno API_KEY no está configurada.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Breaks down a complex task into a list of sub-tasks.
 */
export async function breakdownTask(mainTask: string): Promise<string[]> {
    const prompt = `Como un experto gestor de proyectos de IA, tu única función es desglosar el siguiente objetivo del usuario en una serie de sub-tareas secuenciales y accionables. Responde ÚNICAMENTE con un array JSON de strings. No incluyas ningún otro texto, explicación, ni markdown.

Objetivo del usuario: "${mainTask}"`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const subTasks = JSON.parse(jsonStr);

        if (Array.isArray(subTasks) && subTasks.every(item => typeof item === 'string')) {
            return subTasks;
        } else {
            throw new Error("La respuesta de la IA no es un array de strings válido.");
        }
    } catch (error) {
        console.error("Error al desglosar la tarea:", error);
        throw new Error("No se pudo desglosar la tarea. La IA devolvió un formato inesperado.");
    }
}

/**
 * Executes a single sub-task given the context of previous results.
 */
export async function executeTask(taskDescription: string, context: string): Promise<string> {
    const prompt = `Eres un agente de IA experto y diligente. Tu objetivo es ejecutar la tarea asignada y proporcionar un resultado conciso y fáctico. Utiliza el contexto proporcionado de tareas anteriores para informar tu trabajo. Mantén el resultado breve y al grano.

Contexto de tareas previas completadas:
${context || "No hay contexto previo."}

Tu tarea actual es: "${taskDescription}"

Ejecuta esta tarea y proporciona solo el resultado directo.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: {
            temperature: 0.5,
        }
    });

    return response.text.trim();
}

/**
 * Summarizes all results into a final report.
 */
export async function summarizeResults(mainTask: string, results: string[]): Promise<string> {
    const prompt = `Eres un redactor de informes profesional. Tu tarea es sintetizar los resultados de varias sub-tareas en un único informe final, coherente y bien formateado que aborde directamente el objetivo original del usuario. Utiliza un formato de texto claro.

Objetivo Original: ${mainTask}

Resultados de las Sub-tareas:
- ${results.join('\n- ')}

Ahora, crea el informe final consolidado. Comienza con un resumen ejecutivo y luego detalla los hallazgos.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: {
            temperature: 0.7,
        }
    });

    return response.text.trim();
}
