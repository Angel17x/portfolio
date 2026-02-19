import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { GoogleGenAI } from "@google/genai"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurada" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { text, context, type, userMessage, conversationHistory, improvedText: currentImprovedText } = body

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Texto requerido" }, { status: 400 })
    }

    const genAI = new GoogleGenAI({ apiKey })

    // Si hay un mensaje del usuario, es una conversación/interacción
    if (userMessage) {
      const history: ChatMessage[] = (conversationHistory || []) as ChatMessage[]
      
      // Construir el prompt con contexto
      let conversationPrompt = `Eres un asistente experto en mejorar textos para CVs profesionales. El usuario está trabajando en mejorar un texto.

Texto original:
${text}

${context ? `Contexto: ${context}` : ""}

      ${currentImprovedText ? `Versión mejorada actual:\n${currentImprovedText}\n\n` : ""}

Historial de la conversación:
${history.map((msg: ChatMessage) => `${msg.role === "user" ? "Usuario" : "Asistente"}: ${msg.content}`).join("\n\n")}

Usuario: ${userMessage}

Asistente:`

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: conversationPrompt,
      })

      const reply = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || ""
      
      // Intentar extraer texto mejorado si el usuario lo pidió
      const improvedTextMatch = reply.match(/TEXTO_MEJORADO:\s*([\s\S]*?)(?=\n\n|$)/i)
      const extractedImprovedText = improvedTextMatch ? improvedTextMatch[1].trim() : null
      
      return NextResponse.json({ 
        reply,
        improvedText: extractedImprovedText || undefined,
        conversationHistory: [
          ...history,
          { role: "user", content: userMessage },
          { role: "assistant", content: reply },
        ],
      })
    }

    // Modo preview: generar mejora y explicación
    let prompt = ""
    switch (type) {
      case "experience":
        prompt = `Analiza la siguiente descripción de experiencia laboral para un CV y:

1. Explica QUÉ mejoras harías y POR QUÉ (máximo 3 puntos clave)
2. Proporciona la versión mejorada

Descripción original:
${text}

${context ? `Contexto adicional: ${context}` : ""}

Formato de respuesta:
EXPLICACIÓN:
- [Punto 1]
- [Punto 2]
- [Punto 3]

TEXTO_MEJORADO:
[Texto mejorado aquí]`
        break
      case "project":
        prompt = `Analiza la siguiente descripción de proyecto para un CV y:

1. Explica QUÉ mejoras harías y POR QUÉ (máximo 3 puntos clave)
2. Proporciona la versión mejorada

Descripción original:
${text}

${context ? `Contexto adicional: ${context}` : ""}

Formato de respuesta:
EXPLICACIÓN:
- [Punto 1]
- [Punto 2]
- [Punto 3]

TEXTO_MEJORADO:
[Texto mejorado aquí]`
        break
      case "about":
        prompt = `Analiza el siguiente resumen profesional o biografía para un CV y:

1. Explica QUÉ mejoras harías y POR QUÉ (máximo 3 puntos clave)
2. Proporciona la versión mejorada

Texto original:
${text}

Formato de respuesta:
EXPLICACIÓN:
- [Punto 1]
- [Punto 2]
- [Punto 3]

TEXTO_MEJORADO:
[Texto mejorado aquí]`
        break
      default:
        prompt = `Analiza el siguiente texto para un CV y:

1. Explica QUÉ mejoras harías y POR QUÉ (máximo 3 puntos clave)
2. Proporciona la versión mejorada

Texto original:
${text}

Formato de respuesta:
EXPLICACIÓN:
- [Punto 1]
- [Punto 2]
- [Punto 3]

TEXTO_MEJORADO:
[Texto mejorado aquí]`
    }

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const fullResponse = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    if (!fullResponse) {
      throw new Error("No se pudo obtener la respuesta de la IA")
    }

    // Parsear la respuesta para separar explicación y texto mejorado
    const explanationMatch = fullResponse.match(/EXPLICACIÓN:\s*([\s\S]*?)(?=TEXTO_MEJORADO:|$)/i)
    const improvedTextMatch = fullResponse.match(/TEXTO_MEJORADO:\s*([\s\S]*?)$/i)

    const explanation = explanationMatch 
      ? explanationMatch[1].trim().split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim())
      : []
    
    const improvedText = improvedTextMatch 
      ? improvedTextMatch[1].trim()
      : fullResponse // Fallback: usar toda la respuesta si no se puede parsear

    return NextResponse.json({ 
      improvedText,
      explanation,
      fullResponse, // Para debugging
    })
  } catch (error) {
    console.error("Error mejorando texto con Gemini:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al mejorar el texto. Verifica que GEMINI_API_KEY esté configurada correctamente.",
      },
      { status: 500 }
    )
  }
}
