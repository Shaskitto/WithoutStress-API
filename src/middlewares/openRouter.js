import fetch from 'node-fetch';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function analizarDiario(texto) {
  const prompt = `
    Eres un asistente empático que analiza entradas de un diario personal. El usuario se expresa libremente. Tu tarea es:
    1. Detectar el estado emocional general (ej. estresado, feliz, confundido, triste, ansioso, tranquilo, desmotivado, motivado, etc.)
    2. Validar lo que siente con una frase empática.
    3. Sugerir una actividad que pueda ayudar a mejorar o reforzar su estado emocional.

    Responde en español con este formato JSON:

    {
      "estado": "...",
      "respuesta": "Texto empático para el usuario.",
      "actividad": "Sugerencia de una actividad útil."
    }

    Texto del usuario: "${texto}"
  `;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const respuestaIA = data.choices[0].message.content;

  try {
    return JSON.parse(respuestaIA);
  } catch (error) {
    return { error: 'Respuesta inválida de OpenRouter', raw: respuestaIA };
  }
}

export { analizarDiario };
