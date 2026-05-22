import { OpenAI } from 'openai';

// Inicializamos el motor de OpenAI con la clave segura de Vercel
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Solo permitimos peticiones POST (envío de formularios)
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  try {
    const { rubro, plantilla, link, idea, publico } = req.body;

    // Estructuramos el mensaje de instrucción (Prompt) según la plantilla elegida
    let instruccionesPlatilla = '';
    
    if (plantilla === 'tiktok_script') {
      instruccionesPlatilla = 'Escribe un guion estructurado para video corto de TikTok usando la fórmula AIDA (Atención, Interés, Deseo, Acción). Incluye ganchos visuales entre corchetes [] y llamadas a la acción claras.';
    } else if (plantilla === 'instagram_feed') {
      instruccionesPlatilla = 'Escribe un copy persuasivo para el feed de Instagram. Comienza con un gancho demoledor en la primera línea, desarrolla el beneficio principal utilizando viñetas con emojis y termina con una llamada a la acción.';
    } else if (plantilla === 'facebook_ads') {
      instruccionesPlatilla = 'Escribe un texto publicitario de alta conversión para Facebook Ads enfocado en venta directa. Utiliza gatillos mentales de urgencia y escasez.';
    } else {
      instruccionesPlatilla = 'Escribe un post profesional y de liderazgo de opinión optimizado para el algoritmo de LinkedIn.';
    }

    // Si es Hotmart, le sumamos el link de afiliado de forma estratégica
    let contextoHotmart = '';
    if (rubro === 'hotmart' && link) {
      contextoHotmart = `El producto es de afiliación Hotmart. Integra sutilmente este enlace de compra al final del texto: ${link}`;
    }

    // Llamamos a la Inteligencia Artificial real
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Usamos el modelo ultra rápido y económico
      messages: [
        {
          role: "system",
          content: `Eres un copywriter experto en marketing de afiliados y lanzamientos digitales. Generas textos de ventas que atrapan y convierten de inmediato. ${instruccionesPlatilla}`
        },
        {
          role: "user",
          content: `Genera una campaña publicitaria con los siguientes datos:
          - Modelo/Rubro: ${rubro}
          - Idea del producto: ${idea}
          - Público objetivo: ${publico || 'Público general interesado'}
          ${contextoHotmart}
          
          Devuelve solo el copy final listo para copiar y pegar, usando emojis de forma profesional y saltos de línea correctos.`
        }
      ],
      temperature: 0.7,
    });

    const textoGenerado = completion.choices[0].message.content;

    // Devolvemos la respuesta exitosa al HTML
    return res.status(200).json({ success: true, texto: textoGenerado });

  } catch (error) {
    console.error("Error en la API de OpenAI:", error);
    return res.status(500).json({ 
      success: false, 
      error: 'Hubo un problema al procesar la IA. Asegúrate de configurar la OPENAI_API_KEY en tu Vercel.' 
    });
  }
}