import OpenAI from "openai";

import { env } from "../env.js";

const client = new OpenAI({ apiKey: env.openaiApiKey });

export async function judgeCompletion(outputLines: string[]) {
  const trimmed = outputLines.slice(-200).join("\n");
  const response = await client.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [
      {
        role: "system",
        content:
          "Eres un juez estricto de finalizacion de agentes de codigo. Responde solo JSON valido con keys finished:boolean y message:string.",
      },
      {
        role: "user",
        content: `Analiza esta salida y decide si el proyecto ya termino con pruebas pasadas y listo para empaquetar.\n\nSALIDA:\n${trimmed}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { finished?: boolean; message?: string };
  return {
    finished: Boolean(parsed.finished),
    message: parsed.message ?? "",
  };
}
